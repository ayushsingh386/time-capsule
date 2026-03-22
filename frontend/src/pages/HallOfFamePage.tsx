import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import api from '../lib/api'
import { Capsule } from '../lib/supabase'
import CapsuleCard from '../components/CapsuleCard'
import toast from 'react-hot-toast'

export default function HallOfFamePage() {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPublicCapsules = async () => {
    try {
      const { data } = await api.get('/capsules/public')
      setCapsules(data)
    } catch {
      toast.error('Failed to load Hall of Fame')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicCapsules()
  }, [])

  return (
    <div className="min-h-screen bg-warm-gradient pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-200/50 transform rotate-3">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-capsule-dusk mb-4">
            Hall of Fame
          </h1>
          <p className="text-lg text-gray-600">
            A public gallery of unsealed memories. These time capsules have finished their journey and are now shared with the world.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-amber-700 font-medium font-serif">Loading history...</p>
          </div>
        ) : capsules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((capsule) => (
              <CapsuleCard 
                key={capsule.id} 
                capsule={capsule} 
                received={true} 
                onUpdate={fetchPublicCapsules} 
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white"
          >
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-capsule-dusk mb-2">It's a bit empty here!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No one has published their unlocked capsules yet. When 5 or 8 years pass, you'll start seeing memories appear here!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
