import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, CheckCircle2, UserX, Ban, UserCheck, AlertTriangle } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  branch?: string
  batch: { name: string; year: number } | null
  created_at: string
  is_verified: boolean
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required')
      navigate('/')
      return
    }
    fetchUsers()
  }, [user, navigate])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await api.put(`/admin/users/${id}/status`, { status })
      toast.success(`User status updated to ${status}`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status, is_verified: status === 'active' } : u))
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">active</span>
      case 'blocked': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">blocked</span>
      case 'suspended': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">suspended</span>
      case 'pending': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">pending</span>
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-warm-gradient pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-8 border-b border-amber-200/50 pb-6">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-capsule-dusk">Super Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Manage user profiles, verification, and status across the platform.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-rose-700 font-medium">Loading entire batch...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="grid gap-4">
            {users.map((u) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800 text-lg">{u.name}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      u.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                    {getStatusBadge(u.status)}
                    {u.role === 'teacher' && u.branch && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {u.branch}
                      </span>
                    )}
                    {u.role === 'student' && u.batch && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {u.batch.name} '{u.batch.year.toString().slice(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-mono">{u.email}</p>
                  <p className="text-[10px] text-gray-400 mt-2">ID: {u.id} · Registered: {format(new Date(u.created_at), 'MMM d, yyyy')}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Allow/Verify Button */}
                  {u.status !== 'active' && (
                    <button
                      onClick={() => updateStatus(u.id, 'active')}
                      disabled={updatingId === u.id}
                      title="Allow User"
                      className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-semibold"
                    >
                      <UserCheck className="w-4 h-4" /> Allow
                    </button>
                  )}

                  {/* Suspend Button */}
                  {u.status !== 'suspended' && (
                     <button
                       onClick={() => updateStatus(u.id, 'suspended')}
                       disabled={updatingId === u.id}
                       title="Suspend User"
                       className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-semibold"
                     >
                       <AlertTriangle className="w-4 h-4" /> Suspend
                     </button>
                  )}

                  {/* Block Button */}
                  {u.status !== 'blocked' && (
                    <button
                      onClick={() => updateStatus(u.id, 'blocked')}
                      disabled={updatingId === u.id}
                      title="Block User"
                      className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-semibold"
                    >
                      <Ban className="w-4 h-4" /> Block
                    </button>
                  )}
                  
                  {updatingId === u.id && (
                     <div className="ml-2 w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-white">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-300">
              <UserX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-700 mb-1">No Users Found</h3>
            <p className="text-gray-500">The batch directory is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  )
}
