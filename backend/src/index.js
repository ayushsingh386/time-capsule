require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')

const authRoutes = require('./routes/auth')
const capsuleRoutes = require('./routes/capsules')
const batchRoutes = require('./routes/batches')
const userRoutes = require('./routes/users')
const notifRoutes = require('./routes/notifications')
const { startScheduler } = require('./services/scheduler')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/capsules', capsuleRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notifRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TimeCapsule backend running on http://localhost:${PORT}`)
  startScheduler()
})

// Trigger nodemon restart again
