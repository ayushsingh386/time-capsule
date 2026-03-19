const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../middleware/supabase')

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, name: user.name, batch_id: user.batch_id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, batch_id } = req.body
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 12)

    const { data: user, error } = await supabase
      .from('profiles')
      .insert({ name, email, password_hash: hashed, role, batch_id: batch_id || null })
      .select()
      .single()

    if (error) throw error

    const token = signToken(user)
    const { password_hash, ...safeUser } = user
    res.status(201).json({ token, user: safeUser })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) return res.status(401).json({ message: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken(user)
    const { password_hash, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed' })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  // In production: send email with reset link via Nodemailer
  // For demo: just return success
  res.json({ message: 'If this email exists, a reset link has been sent.' })
})

module.exports = router
