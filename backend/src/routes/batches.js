const router = require('express').Router()
const auth = require('../middleware/auth')
const supabase = require('../middleware/supabase')

// GET /api/batches
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('year', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch batches' })
  }
})

// POST /api/batches
router.post('/', auth, async (req, res) => {
  try {
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins and teachers can create batches' })
    }
    const { name, year } = req.body
    if (!name || !year) return res.status(400).json({ message: 'Name and year required' })

    const { data, error } = await supabase
      .from('batches')
      .insert({ name, year: parseInt(year) })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create batch', error: err.message || err })
  }
})

// DELETE /api/batches/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete batches' })
    }
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Batch deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete batch' })
  }
})

module.exports = router
