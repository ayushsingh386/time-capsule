import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, User, Users, Sparkles, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Batch } from '../lib/supabase'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'student' | 'teacher'
  batch_id?: string
  branch?: string
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState<Batch[]>([])
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { role: 'student' }
  })
  const watchRole = watch('role')
  const watchPassword = watch('password')

  useEffect(() => {
    api.get('/batches').then(res => setBatches(res.data)).catch(() => {})
  }, [])

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      await authRegister(data.name, data.email, data.password, data.role, data.batch_id, data.branch)
      toast.success('Account created! Welcome to TimeCapsule 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/auth-bg.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-rose-900/40 to-purple-900/50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-serif font-bold text-white drop-shadow-md">TimeCapsule</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-white mb-2 drop-shadow-md">Create Your Account</h1>
          <p className="text-amber-100/80">Join your batch and start creating memories</p>
        </div>

        <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'teacher'] as const).map(role => (
                  <label
                    key={role}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${watchRole === role
                      ? 'border-amber-400 bg-amber-400/20'
                      : 'border-white/30 hover:border-amber-300/50'
                    }`}
                  >
                    <input type="radio" value={role} className="sr-only" {...register('role')} />
                    {role === 'student' ? <GraduationCap className="w-5 h-5 text-amber-600" /> : role === 'teacher' ? <Users className="w-5 h-5 text-purple-600" /> : <Lock className="w-5 h-5 text-rose-600" />}
                    <span className="font-medium text-sm capitalize text-white/90">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Priya Mehta"
                  className="input-field pl-11"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                />
              </div>
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="you@college.edu"
                  className="input-field pl-11"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                  })}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Batch (Student only) */}
            {watchRole === 'student' && batches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">Select your Batch</label>
                <select
                  id="reg-batch"
                  className="input-field bg-white text-gray-800"
                  {...register('batch_id', { required: watchRole === 'student' ? 'Batch is required' : false })}
                >
                  <option value="">Select batch...</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} · {b.year}</option>
                  ))}
                </select>
                {errors.batch_id && <p className="text-rose-500 text-xs mt-1">{errors.batch_id.message}</p>}
              </div>
            )}

            {/* Branch (Teacher only) */}
            {watchRole === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">Select your Branch</label>
                <select
                  id="reg-branch"
                  className="input-field bg-white text-gray-800"
                  {...register('branch', { required: watchRole === 'teacher' ? 'Branch is required' : false })}
                >
                  <option value="">Select branch...</option>
                  <option value="CS">Computer Science (CS)</option>
                  <option value="DS">Data Science (DS)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="Others">Others</option>
                </select>
                {errors.branch && <p className="text-rose-500 text-xs mt-1">{errors.branch.message}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="input-field pl-11 pr-12"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="input-field pl-11"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: v => v === watchPassword || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/70 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-300 font-semibold hover:text-amber-200 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
    </motion.div>
  )
}
