const router = require('express').Router()
const auth = require('../middleware/auth')
const supabase = require('../middleware/supabase')

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    res.json(data)
  } catch {
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

// PATCH /api/notifications/read-all
router.patch('/read-all', auth, async (req, res) => {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
    res.json({ message: 'All marked as read' })
  } catch {
    res.status(500).json({ message: 'Failed to update notifications' })
  }
})

module.exports = router
