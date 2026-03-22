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

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, status, branch, batch:batches(name, year), is_verified, created_at')
      .neq('role', 'admin') // Don't show admin profiles
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Fetch users error:', err)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // expected values: active, blocked, suspended, pending

    const updateData = { status }
    if (status === 'active') {
      updateData.is_verified = true
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
    res.json({ message: `User status set to ${status}` })
  } catch (err) {
    console.error('Update status error:', err)
    res.status(500).json({ message: 'Failed to update user status' })
  }
})

// Kept for backward compatibility or direct verification
router.put('/verify/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true, status: 'active' })
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'User verified successfully' })
  } catch (err) {
    console.error('Verify user error:', err)
    res.status(500).json({ message: 'Failed to verify user' })
  }
})

module.exports = router
