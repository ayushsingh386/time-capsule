import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Lock, Unlock, Clock, Package, Heart, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Capsule, Notification } from '../lib/supabase'
import CountdownTimer from '../components/CountdownTimer'
import CapsuleCard from '../components/CapsuleCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [received, setReceived] = useState<Capsule[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sentRes, recRes, notifRes] = await Promise.all([
          api.get('/capsules/mine'),
          api.get('/capsules/received'),
          api.get('/notifications'),
        ])
        setCapsules(sentRes.data)
        setReceived(recRes.data)
        setNotifications(notifRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const targetArray = user?.role === 'teacher' ? received : capsules
  const lockedCount = targetArray.filter(c => !c.is_unlocked).length
  const unlockedCount = targetArray.filter(c => c.is_unlocked).length
  const unreadNotifs = notifications.filter(n => !n.is_read).length

  const stats = user?.role === 'teacher' ? [
    { label: 'Total Received', value: received.length, icon: Heart, color: 'from-purple-400 to-indigo-400', bg: 'bg-purple-50', text: 'text-purple-700' },
    { label: 'Still Locked', value: lockedCount, icon: Lock, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-700' },
    { label: 'Unlocked', value: unlockedCount, icon: Unlock, color: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700' }
  ] : [
    { label: 'Capsules Sent', value: capsules.length, icon: Package, color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-700' },
    { label: 'Still Locked', value: lockedCount, icon: Lock, color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-700' },
    { label: 'Unlocked', value: unlockedCount, icon: Unlock, color: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'Received', value: received.length, icon: Heart, color: 'from-purple-400 to-indigo-400', bg: 'bg-purple-50', text: 'text-purple-700' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Your memories, safely locked until the right moment.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadNotifs > 0 && (
            <div className="relative">
              <Bell className="w-6 h-6 text-amber-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifs}
              </span>
            </div>
          )}
          {user?.role !== 'teacher' && (
            <Link to="/create" className="btn-primary">
              <Plus className="w-5 h-5" /> New Capsule
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-serif font-bold text-capsule-dusk">{loading ? '—' : s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Next Unlock */}
      {targetArray.filter(c => !c.is_unlocked).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8 bg-gradient-to-r from-capsule-dusk to-capsule-twilight text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-300" />
            <h2 className="font-serif text-lg font-semibold">Next Capsule Unlocking</h2>
          </div>
          <CountdownTimer targetDate={targetArray.filter(c => !c.is_unlocked).sort((a, b) => new Date(a.unlock_date).getTime() - new Date(b.unlock_date).getTime())[0]?.unlock_date} dark />
        </motion.div>
      )}

      {/* Sent Capsules */}
      {user?.role !== 'teacher' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-serif font-semibold text-capsule-dusk">Capsules You Sent</h2>
            <Link to="/create" className="btn-ghost text-sm">+ Create New</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-5 h-40 shimmer-bg" />
              ))}
            </div>
          ) : capsules.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <motion.div 
                animate={{ y: [-5, 5, -5] }} 
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Package className="w-16 h-16 text-amber-300 mx-auto mb-4 drop-shadow-md" />
              </motion.div>
              <h3 className="font-serif text-xl text-capsule-dusk mb-2 font-bold">No Capsules Yet</h3>
              <p className="text-gray-600 text-sm mb-5 font-medium">Start by creating your first time capsule for a teacher or classmate.</p>
              <Link to="/create" className="btn-primary">Create Your First Capsule</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capsules.map(c => <CapsuleCard key={c.id} capsule={c} />)}
            </div>
          )}
        </motion.div>
      )}

      {/* Received Capsules (unlocked) */}
      {received.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-10">
          <h2 className="text-xl font-serif font-semibold text-capsule-dusk mb-5">💌 Capsules Received</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {received.map(c => <CapsuleCard key={c.id} capsule={c} received />)}
          </div>
        </motion.div>
      )}
    </div>
    </motion.div>
  )
}
