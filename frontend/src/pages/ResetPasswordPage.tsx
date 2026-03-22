import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Lock, Sparkles } from 'lucide-react'
import api from '../lib/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const newPassword = watch('newPassword')

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-warm-gradient flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-capsule-dusk mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/login" className="btn-primary">Return to Login</Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        newPassword: data.newPassword,
      })
      toast.success('Password reset successful! You can now log in.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password. The link might be expired.')
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
          <h1 className="text-3xl font-serif font-bold text-capsule-dusk mb-2">New Password</h1>
          <p className="text-gray-500">Create a secure password</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-11"
                  {...register('newPassword', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' }
                  })}
                />
              </div>
              {errors.newPassword && <p className="text-rose-500 text-xs mt-1">{errors.newPassword?.message as string}</p>}
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-11"
                  {...register('confirmPassword', { 
                    required: 'Please confirm password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword?.message as string}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-70">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
