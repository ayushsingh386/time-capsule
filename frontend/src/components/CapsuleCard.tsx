import { motion } from 'framer-motion'
import { format, isPast } from 'date-fns'
import { Lock, Unlock, Image, Heart, GraduationCap, Users } from 'lucide-react'
import { Capsule } from '../lib/supabase'
import CountdownTimer from './CountdownTimer'

interface Props {
  capsule: Capsule
  received?: boolean
}

export default function CapsuleCard({ capsule, received }: Props) {
  const isUnlocked = capsule.is_unlocked || isPast(new Date(capsule.unlock_date))
  const isTeacher = capsule.recipient_type === 'teacher'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden"
    >
      {/* Top accent */}
      <div className={`h-1.5 w-full ${isUnlocked ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : isTeacher ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isTeacher
              ? <span className="badge-teacher"><GraduationCap className="w-3 h-3" /> Teacher</span>
              : <span className="badge-student"><Users className="w-3 h-3" /> Student</span>
            }
            {isUnlocked
              ? <span className="badge-unlocked"><Unlock className="w-3 h-3" /> Unlocked</span>
              : <span className="badge-locked"><Lock className="w-3 h-3" /> Locked</span>
            }
          </div>
          {capsule.media_urls?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Image className="w-3.5 h-3.5" />
              <span>{capsule.media_urls.length}</span>
            </div>
          )}
        </div>

        {/* Content preview */}
        {isUnlocked ? (
          <div>
            {capsule.media_urls?.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-3 rounded-xl overflow-hidden">
                {capsule.media_urls.slice(0, 3).map((url, i) => (
                  <div key={i} className="aspect-square bg-gray-100 relative">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 2 && capsule.media_urls.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">
                        +{capsule.media_urls.length - 3}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {capsule.content_text || 'No text message'}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-capsule-dusk/5 to-capsule-twilight/10 rounded-xl p-5 flex flex-col items-center gap-2 my-2">
            <Lock className="w-8 h-8 text-capsule-twilight/50" />
            <p className="text-sm text-capsule-dusk/60 font-medium text-center">This capsule is sealed</p>
            <p className="text-xs text-gray-400 text-center">Unlocks {format(new Date(capsule.unlock_date), 'MMM d, yyyy')}</p>
          </div>
        )}

        {/* Sender (received view) */}
        {received && capsule.sender && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-50">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold">
              {capsule.sender.name?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-medium text-capsule-dusk">{capsule.sender.name}</p>
              <p className="text-xs text-gray-400">Batch 2026</p>
            </div>
            <Heart className="w-3.5 h-3.5 text-rose-400 ml-auto" />
          </div>
        )}

        {/* Countdown */}
        {!isUnlocked && (
          <div className="mt-4 pt-3 border-t border-amber-50">
            <p className="text-xs text-gray-400 mb-2">Time remaining:</p>
            <CountdownTimer targetDate={capsule.unlock_date} />
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-gray-400 mt-3">
          Created {format(new Date(capsule.created_at), 'MMM d, yyyy')}
        </p>
      </div>
    </motion.div>
  )
}
