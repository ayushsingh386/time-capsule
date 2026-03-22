const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const supabase = require('../middleware/supabase')
const { sendPasswordResetEmail } = require('../services/mailer')
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // 10 attempts
  message: 'Too many login/registration attempts from this IP, please try again after 15 minutes'
})

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, name: user.name, batch_id: user.batch_id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
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
      .insert({
        name,
        email,
        password_hash: hashed,
        role,
        batch_id: batch_id || null,
        is_verified: false // Default to false on registration
      })
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
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, batch_id, is_verified, password_hash') // Select password_hash and is_verified
      .eq('email', email)
      .single()

    if (error || !user) return res.status(401).json({ message: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    // Check if the user is verified, unless they are an admin
    if (user.role !== 'admin' && !user.is_verified) {
      return res.status(403).json({
        message: 'Your account is pending admin verification. Please wait for an administrator to approve your account before logging in.'
      })
    }

    const token = signToken(user)
    const { password_hash, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed' })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const { data: user } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (!user) {
      // Return success even if user doesn't exist for security (prevent email enumeration)
      return res.json({ message: 'If this email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await supabase
      .from('profiles')
      .update({ reset_token: hashedToken, reset_token_expiry: tokenExpiry.toISOString() })
      .eq('id', user.id)

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    await sendPasswordResetEmail(user.email, resetLink)

    res.json({ message: 'If this email exists, a reset link has been sent.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ message: 'Failed to process request' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { email, token, newPassword } = req.body
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('id, reset_token, reset_token_expiry')
      .eq('email', email)
      .single()

    if (!user || !user.reset_token || !user.reset_token_expiry) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    // Check expiry
    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ message: 'Reset token has expired' })
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    if (hashedToken !== user.reset_token) {
      return res.status(400).json({ message: 'Invalid reset token' })
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    await supabase
      .from('profiles')
      .update({ 
        password_hash: newPasswordHash,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id)

    res.json({ message: 'Password has been successfully reset' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ message: 'Failed to reset password' })
  }
})

module.exports = router
