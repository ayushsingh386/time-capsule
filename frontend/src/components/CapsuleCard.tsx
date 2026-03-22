import { motion } from 'framer-motion'
import { format, isPast } from 'date-fns'
import { Lock, Unlock, Image, Heart, GraduationCap, Users, Globe, EyeOff, Loader2, MailOpen } from 'lucide-react'
import { Capsule } from '../lib/supabase'
import CountdownTimer from './CountdownTimer'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Plus, X, Upload } from 'lucide-react'
import { useRef } from 'react'

interface Props {
  capsule: Capsule
  received?: boolean
  onUpdate?: () => void
}

export default function CapsuleCard({ capsule, received, onUpdate }: Props) {
  const isUnlocked = capsule.is_unlocked || isPast(new Date(capsule.unlock_date))
  const isTeacher = capsule.recipient_type === 'teacher'
  const { user } = useAuth()
  
  const [isPublic, setIsPublic] = useState(!!capsule.is_public)
  const [toggling, setToggling] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [contribText, setContribText] = useState('')
  const [contribFiles, setContribFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isOwnerOrRecipient = user && (capsule.sender_id === user.id || capsule.recipient_id === user.id || (!capsule.recipient_id && user.role === capsule.recipient_type))

  const toggleVisibility = async () => {
    if (!isUnlocked || !isOwnerOrRecipient) return
    setToggling(true)
    try {
      await api.put(`/capsules/${capsule.id}/public`, { is_public: !isPublic })
      setIsPublic(!isPublic)
      toast.success(`Capsule is now ${!isPublic ? 'public' : 'private'}`)
      if (onUpdate) onUpdate()
    } catch {
      toast.error('Failed to change visibility')
    } finally {
      setToggling(false)
    }
  }

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('content_text', contribText)
      contribFiles.forEach(f => formData.append('media', f))
      await api.post(`/capsules/${capsule.id}/contribute`, formData)
      toast.success('Contribution added! It will unlock with the capsule.')
      setShowModal(false)
      if (onUpdate) onUpdate()
    } catch {
      toast.error('Failed to add contribution')
    } finally {
      setSubmitting(false)
    }
  }

  const playMelody = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const sequence = [
        { note: 261.63, time: 0 }, { note: 329.63, time: 0.2 }, { note: 392.00, time: 0.4 }, { note: 523.25, time: 0.6 },
        { note: 349.23, time: 2 }, { note: 440.00, time: 2.2 }, { note: 523.25, time: 2.4 }, { note: 698.46, time: 2.6 },
        { note: 392.00, time: 4 }, { note: 493.88, time: 4.2 }, { note: 587.33, time: 4.4 }, { note: 783.99, time: 4.6 },
        { note: 523.25, time: 6 }, { note: 659.25, time: 6.2 }, { note: 783.99, time: 6.4 }, { note: 1046.50, time: 6.6 },
        { note: 523.25, time: 8 }, { note: 659.25, time: 8.1 }, { note: 783.99, time: 8.2 }, { note: 1046.50, time: 8.3 }, { note: 1318.51, time: 8.5 }
      ];
      sequence.forEach(({ note, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = note;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startTime = ctx.currentTime + time;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 2);
        osc.start(startTime);
        osc.stop(startTime + 2);
      });
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  const handleOpenCapsule = () => {
    setIsOpening(true);
    playMelody();
    setTimeout(() => {
      setIsOpening(false);
      setIsOpen(true);
    }, 9500);
  }

  const isAudio = (url: string) => url.match(/\.(webm|mp3|wav|ogg|m4a)$/i) || url.includes('voice-note')

  const renderMedia = (url: string, className: string = "w-full h-full object-cover") => {
    if (isAudio(url)) {
      return (
        <div className="w-full h-full bg-sky-50 flex items-center justify-center p-2">
          <audio controls src={url} className="w-full h-8" />
        </div>
      )
    }
    return <img src={url} alt="" className={className} />
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden ${isUnlocked ? 'bg-[#fafaf8] rounded-md shadow-md border border-[#e2dcd0]' : 'glass-card'}`}
    >
      {/* Top accent */}
      <div className={`h-1.5 w-full ${isUnlocked ? 'bg-gradient-to-r from-slate-400 to-slate-600' : isTeacher ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`} />

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
            {isUnlocked && isPublic && (
               <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                 <Globe className="w-3 h-3" /> Public
               </span>
            )}
            {capsule.is_collaborative && (
               <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-pink-100 text-pink-700 border border-pink-200 shadow-sm">
                 <Users className="w-3 h-3" /> Group
               </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isUnlocked && isOwnerOrRecipient && (
              <button 
                onClick={toggleVisibility}
                disabled={toggling}
                title={isPublic ? "Make private" : "Publish to Hall of Fame"}
                className={`p-1.5 rounded-md transition-colors ${isPublic ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublic ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              </button>
            )}
            {capsule.media_urls?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400 ml-1">
                <Image className="w-3.5 h-3.5" />
                <span>{capsule.media_urls.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content preview */}
        {isUnlocked ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border-2 border-slate-200 shadow-inner">
               <MailOpen className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-serif text-slate-800 mb-2">Memory Unsealed!</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">This capsule has finished its journey.</p>
            <button 
              onClick={isOpen ? () => setIsOpen(true) : handleOpenCapsule}
              disabled={isOpening}
              className="btn-primary w-full py-3 shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 hover:scale-[1.02]"
            >
              {isOpening ? <Loader2 className="w-5 h-5 animate-spin" /> : <MailOpen className="w-5 h-5" />}
              {isOpening ? 'Unsealing...' : (isOpen ? 'View Letter' : 'Open Capsule')}
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-capsule-dusk/5 to-capsule-twilight/10 rounded-xl p-5 flex flex-col items-center gap-2 my-2">
            <Lock className="w-8 h-8 text-capsule-twilight/50" />
            <p className="text-sm text-capsule-dusk/60 font-medium text-center">This capsule is sealed</p>
            <p className="text-xs text-gray-400 text-center">Unlocks {format(new Date(capsule.unlock_date), 'MMM d, yyyy')}</p>
          </div>
        )}

        {/* Sender (received view) */}
        {received && capsule.sender && !isUnlocked && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-amber-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-amber-400 to-rose-400 text-white">
              {capsule.sender.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-capsule-dusk">{capsule.sender.name}</p>
              <p className="text-xs text-gray-500">Batch 2026</p>
            </div>
          </div>
        )}

        {/* Countdown */}
        {!isUnlocked && (
          <div className="mt-4 pt-3 border-t border-amber-50">
            <p className="text-xs text-gray-400 mb-2">Time remaining:</p>
            <CountdownTimer targetDate={capsule.unlock_date} />
            
            {capsule.is_collaborative && (
              <button onClick={() => setShowModal(true)} className="w-full mt-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Add to Group Capsule
              </button>
            )}
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-gray-400 mt-4 font-mono">
          Sealed on {format(new Date(capsule.created_at), 'MMM d, yyyy')}
        </p>
      </div>
    </motion.div>

    {/* Opened Letter Modal */}
    {isOpen && (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#fafaf8] rounded-md w-full max-w-2xl shadow-2xl relative my-auto mx-auto"
        >
          {/* Note styling borders */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-400 rounded-t-md"></div>
          
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors z-10">
            <X className="w-6 h-6" />
          </button>

          <div className="p-8 sm:p-12">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-serif text-slate-800 tracking-wide">A Message from Time</h2>
               <p className="text-sm font-mono text-slate-400 mt-2">
                 Sealed on {format(new Date(capsule.created_at), 'MMMM d, yyyy')}
               </p>
            </div>

            {capsule.media_urls?.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-8 rounded-xl overflow-hidden shadow-sm">
                {capsule.media_urls.map((url, i) => (
                  <div key={i} className={`bg-gray-100 relative ${isAudio(url) ? 'col-span-2 h-16 rounded-xl overflow-hidden' : 'aspect-video'}`}>
                    {renderMedia(url)}
                  </div>
                ))}
              </div>
            )}

            <div className="prose prose-slate max-w-none">
              <p className="text-slate-800 font-serif text-lg leading-loose whitespace-pre-wrap">
                {capsule.content_text || 'No text message attached.'}
              </p>
            </div>

            {/* Sender signature area */}
            {capsule.sender && (
               <div className="mt-12 pt-8 border-t border-slate-200 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-serif text-xl shadow-sm">
                   {capsule.sender.name?.charAt(0)}
                 </div>
                 <div>
                   <p className="text-sm text-slate-500 italic mb-1">Signed by</p>
                   <p className="text-lg font-serif text-slate-800">{capsule.sender.name}</p>
                 </div>
               </div>
            )}
            
            {/* Contributors */}
            {capsule.is_collaborative && (capsule as any).contributors && (capsule as any).contributors.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 italic mb-4">With contributions from</p>
                <div className="space-y-6">
                  {(capsule as any).contributors.map((c: any) => (
                    <div key={c.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                          {c.user?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{c.user?.name || 'Guest'}</span>
                      </div>
                      <p className="text-slate-600 font-serif whitespace-pre-wrap leading-relaxed">{c.content_text}</p>
                      {c.media_urls?.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-4 rounded-lg overflow-hidden">
                          {c.media_urls.map((url: string, i: number) => (
                            <div key={i} className={isAudio(url) ? 'col-span-2 h-14' : 'h-24'}>
                              {renderMedia(url, "w-full h-full object-cover")}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )}

    {/* Contribute Modal */}
    {showModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif font-bold text-xl text-capsule-dusk">Add to Capsule</h3>
            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleContribute} className="space-y-4">
            <div>
              <textarea 
                placeholder="Write your message here..." 
                className="input-field min-h-[100px]"
                value={contribText}
                onChange={e => setContribText(e.target.value)}
              />
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-gray-500 hover:bg-gray-50 flex flex-col items-center gap-2">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">{contribFiles.length} file(s) selected</span>
              </button>
              <input 
                ref={fileRef} type="file" multiple className="hidden" accept="image/*"
                onChange={e => setContribFiles(Array.from(e.target.files || []))}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 justify-center">
              {submitting ? 'Adding...' : 'Add Contribution'}
            </button>
          </form>
        </div>
      </div>
    )}
    </>
  )
}
