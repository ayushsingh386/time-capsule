const router = require('express').Router()
const auth = require('../middleware/auth')
const supabase = require('../middleware/supabase')

// Middleware to ensure user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' })
  }
  next()
}

// Apply auth and requireAdmin to all admin routes
router.use(auth)
router.use(requireAdmin)

// GET /api/admin/pending-users
router.get('/pending-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, batch:batches(name, year), created_at')
      .eq('is_verified', false)
      .neq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Pending users error:', err)
    res.status(500).json({ message: 'Failed to fetch pending users' })
  }
})

// PUT /api/admin/verify/:id
router.put('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'User verified successfully' })
  } catch (err) {
    console.error('Verify user error:', err)
    res.status(500).json({ message: 'Failed to verify user' })
  }
})

module.exports = router
