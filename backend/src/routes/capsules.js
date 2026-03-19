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

    const { recipient_type, recipient_id, content_text } = req.body
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
      .select('*, batch:batches(name, year)')
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
      .select('*, sender:profiles!sender_id(name, email, role), batch:batches(name, year)')

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

module.exports = router
