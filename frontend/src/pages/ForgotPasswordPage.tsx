import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Sparkles, ArrowLeft } from 'lucide-react'
import api from '../lib/api'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-gradient flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-serif font-bold text-amber-900">TimeCapsule</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-capsule-dusk mb-2">Reset Password</h1>
          <p className="text-gray-500">We'll send you a reset link</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-capsule-dusk mb-2">Email Sent!</h3>
              <p className="text-gray-600 text-sm mb-6">Check your inbox for the password reset link.</p>
              <Link to="/login" className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@college.edu"
                    className="input-field pl-11"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-70">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
              <Link to="/login" className="flex items-center gap-2 justify-center text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors mt-2">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
