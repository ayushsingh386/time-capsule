import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Lock, Unlock, Heart, Package } from 'lucide-react'
import api from '../lib/api'
import { Capsule } from '../lib/supabase'
import CapsuleCard from '../components/CapsuleCard'
import ConfettiEffect from '../components/ConfettiEffect'

type Tab = 'sent' | 'received'
type Filter = 'all' | 'locked' | 'unlocked'

export default function ViewCapsulesPage() {
  const [tab, setTab] = useState<Tab>('sent')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [received, setReceived] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sentRes, recRes] = await Promise.all([
          api.get('/capsules/mine'),
          api.get('/capsules/received'),
        ])
        setCapsules(sentRes.data)
        setReceived(recRes.data)
        // Trigger confetti if newly unlocked capsules exist
        if (recRes.data.length > 0) setShowConfetti(true)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const activeList = tab === 'sent' ? capsules : received
  const filtered = activeList.filter(c => {
    if (filter === 'locked' && c.is_unlocked) return false
    if (filter === 'unlocked' && !c.is_unlocked) return false
    if (search && !c.content_text?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page-container">
      {showConfetti && <ConfettiEffect onDone={() => setShowConfetti(false)} />}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="section-title mb-2">My Capsules 📬</h1>
          <p className="text-gray-500">Browse all your time capsules — sent and received.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['sent', 'received'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all capitalize ${tab === t
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-100'
              }`}
            >
              {t === 'sent' ? '📤 Sent' : '📥 Received'}
              <span className="ml-1.5 text-xs opacity-80">({t === 'sent' ? capsules.length : received.length})</span>
            </button>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'locked', 'unlocked'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize border ${filter === f
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-600 border-amber-100 hover:border-amber-300'
                }`}
              >
                {f === 'locked' && '🔒'} {f === 'unlocked' && '🔓'}{f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-48 shimmer-bg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-14 text-center">
            <Package className="w-12 h-12 text-amber-200 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-capsule-dusk mb-2">No capsules found</h3>
            <p className="text-gray-500 text-sm">Try changing your filters or search term.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CapsuleCard capsule={c} received={tab === 'received'} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  )
}
