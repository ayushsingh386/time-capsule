const router = require('express').Router()
const auth = require('../middleware/auth')
const supabase = require('../middleware/supabase')

// GET /api/users?role=teacher|student
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.query
    let query = supabase
      .from('profiles')
      .select('id, name, email, role, batch_id')
      .neq('id', req.user.id)

    if (role) query = query.eq('role', role)

    // Only show users from the same batch
    if (req.user.batch_id) {
      query = query.eq('batch_id', req.user.batch_id)
    }

    const { data, error } = await query.order('name')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, batch_id')
      .eq('id', req.user.id)
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

module.exports = router
