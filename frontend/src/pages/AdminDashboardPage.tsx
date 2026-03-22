import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, CheckCircle2, UserX } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface PendingUser {
  id: string
  name: string
  email: string
  role: string
  batch: { name: string; year: number } | null
  created_at: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required')
      navigate('/')
      return
    }
    fetchPendingUsers()
  }, [user, navigate])

  const fetchPendingUsers = async () => {
    try {
      const { data } = await api.get('/admin/pending-users')
      setUsers(data)
    } catch {
      toast.error('Failed to load pending users')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    try {
      await api.put(`/admin/verify/${id}`)
      toast.success('User verified successfully')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      toast.error('Failed to verify user')
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-warm-gradient pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-8 border-b border-amber-200/50 pb-6">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-capsule-dusk">Verification Requests</h1>
            <p className="text-gray-500 text-sm mt-1">Review and approve new student and teacher accounts.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-rose-700 font-medium">Loading requests...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="grid gap-4">
            {users.map((u) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">{u.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      u.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                    {u.batch && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {u.batch.name} '{u.batch.year.toString().slice(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-2">Registered: {format(new Date(u.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                
                <button
                  onClick={() => handleVerify(u.id)}
                  disabled={verifyingId === u.id}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {verifyingId === u.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Approve User</>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-white">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-300">
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-700 mb-1">No Pending Requests</h3>
            <p className="text-gray-500">All registered users have been verified.</p>
          </div>
        )}
      </div>
    </div>
  )
}
