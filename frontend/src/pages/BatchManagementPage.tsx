import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2, Users, Calendar } from 'lucide-react'
import api from '../lib/api'
import { Batch } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function BatchManagementPage() {
  const { user } = useAuth()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string; year: number }>()

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches')
      setBatches(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBatches() }, [])

  const onCreate = async (data: { name: string; year: number }) => {
    setCreating(true)
    try {
      await api.post('/batches', data)
      toast.success('Batch created!')
      reset()
      fetchBatches()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create batch')
    } finally {
      setCreating(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this batch? This cannot be undone.')) return
    try {
      await api.delete(`/batches/${id}`)
      toast.success('Batch deleted')
      setBatches(b => b.filter(x => x.id !== id))
    } catch {
      toast.error('Failed to delete batch')
    }
  }

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return (
      <div className="page-container">
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-amber-200 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-capsule-dusk mb-2">Access Restricted</h2>
          <p className="text-gray-500">Only admins and teachers can manage batches.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="section-title mb-2">Batch Management 🎓</h1>
          <p className="text-gray-500">Manage student batches and groups.</p>
        </div>

        {/* Create Batch */}
        <div className="card p-6 mb-8">
          <h2 className="font-serif font-semibold text-capsule-dusk mb-5">Create New Batch</h2>
          <form onSubmit={handleSubmit(onCreate)} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                id="batch-name"
                placeholder="e.g. TYCS 2026"
                className="input-field"
                {...register('name', { required: 'Batch name is required' })}
              />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="w-full sm:w-32">
              <input
                id="batch-year"
                type="number"
                placeholder="Year"
                className="input-field"
                {...register('year', {
                  required: 'Year required',
                  min: { value: 2020, message: 'Too early' },
                  max: { value: 2040, message: 'Too far' }
                })}
              />
              {errors.year && <p className="text-rose-500 text-xs mt-1">{errors.year.message}</p>}
            </div>
            <button type="submit" disabled={creating} className="btn-primary whitespace-nowrap">
              {creating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Create</>}
            </button>
          </form>
        </div>

        {/* Batch List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-16 shimmer-bg" />)}
          </div>
        ) : batches.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No batches created yet. Add your first batch above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-capsule-dusk">{b.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Batch of {b.year}</span>
                    </div>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => onDelete(b.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
