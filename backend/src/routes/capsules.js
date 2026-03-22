const router = require('express').Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const supabase = require('../middleware/supabase')
const { addYears } = require('date-fns')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } })

// POST /api/capsules  - create capsule (with optional file upload)
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      return res.status(403).json({ message: 'Teachers are not permitted to send time capsules.' })
    }

    const { recipient_type, recipient_id, content_text, is_collaborative } = req.body
    if (!recipient_type) return res.status(400).json({ message: 'recipient_type is required' })

    // Calculate unlock date
    const lockYears = recipient_type === 'teacher' ? 5 : 8
    const unlock_date = addYears(new Date(), lockYears).toISOString()

    // Upload media files to Supabase Storage
    const media_urls = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filename = `${req.user.id}/${Date.now()}-${file.originalname}`
        const { data, error } = await supabase.storage
          .from('capsule-media')
          .upload(filename, file.buffer, { contentType: file.mimetype })

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('capsule-media')
          .getPublicUrl(filename)
        media_urls.push(urlData.publicUrl)
      }
    }

    // Get sender's batch_id
    const { data: sender } = await supabase
      .from('profiles')
      .select('batch_id')
      .eq('id', req.user.id)
      .single()

    const { data: capsule, error } = await supabase
      .from('capsules')
      .insert({
        sender_id: req.user.id,
        recipient_type,
        recipient_id: recipient_id || null,
        content_text: content_text || '',
        media_urls,
        unlock_date,
        is_unlocked: false,
        is_collaborative: is_collaborative === 'true' || is_collaborative === true,
        batch_id: sender?.batch_id || null,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(capsule)
  } catch (err) {
    console.error('Create capsule error:', err)
    res.status(500).json({ message: 'Failed to create capsule', error: err.message || err })
  }
})

// GET /api/capsules/mine  - capsules I sent
router.get('/mine', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select('*, batch:batches(name, year), contributors:capsule_contributors(*, user:profiles!user_id(name, avatar_url))')
      .eq('sender_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch capsules' })
  }
})

// GET /api/capsules/received  - capsules sent TO me (only unlocked)
router.get('/received', auth, async (req, res) => {
  try {
    const now = new Date().toISOString()

    let query = supabase
      .from('capsules')
      .select('*, sender:profiles!sender_id(name, email, role), batch:batches(name, year), contributors:capsule_contributors(*, user:profiles!user_id(name, avatar_url))')

    // Teachers see capsules of type 'teacher', students see type 'student'
    if (req.user.role === 'teacher') {
      query = query.eq('recipient_type', 'teacher')
    } else if (req.user.role === 'student') {
      query = query
        .eq('recipient_type', 'student')
        .or(`recipient_id.eq.${req.user.id},recipient_id.is.null`)
    }

    const { data, error } = await query.order('unlock_date', { ascending: false })
    if (error) throw error

    // Auto-mark as unlocked in DB
    const ids = data.filter(c => !c.is_unlocked && new Date(c.unlock_date) <= new Date(now)).map(c => c.id)
    if (ids.length > 0) {
      await supabase.from('capsules').update({ is_unlocked: true }).in('id', ids)
    }

    res.json(data)
  } catch (err) {
    console.error('Received capsules error:', err)
    res.status(500).json({ message: 'Failed to fetch received capsules' })
  }
})

// GET /api/capsules/public  - all public unlocked capsules
router.get('/public', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('capsules')
      .select('*, sender:profiles!sender_id(name, avatar_url), batch:batches(name, year)')
      .eq('is_public', true)
      .eq('is_unlocked', true)
      .order('unlock_date', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public capsules' })
  }
})

// PUT /api/capsules/:id/public  - toggle public visibility
router.put('/:id/public', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { is_public } = req.body

    const { data: capsule, error: fetchErr } = await supabase
      .from('capsules')
      .select('sender_id, recipient_id, recipient_type, is_unlocked')
      .eq('id', id)
      .single()

    if (fetchErr || !capsule) return res.status(404).json({ message: 'Capsule not found' })
    if (!capsule.is_unlocked) return res.status(400).json({ message: 'Cannot make locked capsule public' })

    const isOwner = capsule.sender_id === req.user.id
    const isDirectRecipient = capsule.recipient_id === req.user.id
    const isGeneralRecipient = !capsule.recipient_id && req.user.role === capsule.recipient_type

    if (!isOwner && !isDirectRecipient && !isGeneralRecipient) {
      return res.status(403).json({ message: 'Not authorized to change visibility' })
    }

    const { error: updateErr } = await supabase
      .from('capsules')
      .update({ is_public: !!is_public })
      .eq('id', id)

    if (updateErr) throw updateErr
    res.json({ message: `Capsule is now ${is_public ? 'public' : 'private'}` })
  } catch (err) {
    console.error('Toggle public error:', err)
    res.status(500).json({ message: 'Failed to update visibility' })
  }
})

// POST /api/capsules/:id/contribute  - add to a collaborative capsule
router.post('/:id/contribute', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { id } = req.params
    const { content_text } = req.body

    const { data: capsule, error: fetchErr } = await supabase
      .from('capsules')
      .select('is_collaborative, is_unlocked')
      .eq('id', id)
      .single()

    if (fetchErr || !capsule) return res.status(404).json({ message: 'Capsule not found' })
    if (!capsule.is_collaborative) return res.status(400).json({ message: 'Capsule is not collaborative' })
    if (capsule.is_unlocked) return res.status(400).json({ message: 'Cannot contribute to an unlocked capsule' })

    const media_urls = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filename = `${req.user.id}/contrib-${Date.now()}-${file.originalname}`
        const { error } = await supabase.storage
          .from('capsule-media')
          .upload(filename, file.buffer, { contentType: file.mimetype })

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('capsule-media')
          .getPublicUrl(filename)
        media_urls.push(urlData.publicUrl)
      }
    }

    const { data: contribution, error } = await supabase
      .from('capsule_contributors')
      .insert({
        capsule_id: id,
        user_id: req.user.id,
        content_text: content_text || '',
        media_urls,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(contribution)
  } catch (err) {
    console.error('Contribute error:', err)
    res.status(500).json({ message: 'Failed to add contribution' })
  }
})

module.exports = router
