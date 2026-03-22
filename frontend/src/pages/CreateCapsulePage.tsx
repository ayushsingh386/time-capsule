import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Image, Video, FileText, Users, GraduationCap, Upload, X, Lock, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Batch, Profile } from '../lib/supabase'
import { addYears, format } from 'date-fns'
import VoiceRecorder from '../components/VoiceRecorder'

interface CapsuleForm {
  recipient_type: 'teacher' | 'student'
  recipient_id: string
  content_text: string
  is_collaborative: boolean
}

export default function CreateCapsulePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [recipients, setRecipients] = useState<Profile[]>([])
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CapsuleForm>({
    defaultValues: { recipient_type: 'teacher' }
  })
  const watchRecipientType = watch('recipient_type')

  useEffect(() => {
    if (user?.role === 'teacher') {
      navigate('/dashboard')
    }
  }, [user, navigate])
  const lockYears = watchRecipientType === 'teacher' ? 5 : 8
  const unlockDate = addYears(new Date(), lockYears)

  useEffect(() => {
    api.get(`/users?role=${watchRecipientType}`)
      .then(res => setRecipients(res.data))
      .catch(() => {})
  }, [watchRecipientType])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + mediaFiles.length > 5) {
      toast.error('Maximum 5 files allowed')
      return
    }
    const newFiles = [...mediaFiles, ...files]
    setMediaFiles(newFiles)
    const previews = newFiles.map(f => URL.createObjectURL(f))
    setMediaPreviews(previews)
  }

  const removeFile = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    setMediaFiles(newFiles)
    setMediaPreviews(newFiles.map(f => URL.createObjectURL(f)))
  }

  const onSubmit = async (data: CapsuleForm) => {
    if (!data.content_text.trim() && mediaFiles.length === 0) {
      toast.error('Please write a message or add media')
      return
    }
    setLoading(true)
    try {
      // Create capsule
      const formData = new FormData()
      formData.append('recipient_type', data.recipient_type)
      if (data.recipient_id) formData.append('recipient_id', data.recipient_id)
      formData.append('content_text', data.content_text)
      formData.append('is_collaborative', String(!!data.is_collaborative))
      mediaFiles.forEach(f => formData.append('media', f))
      if (voiceFile) formData.append('media', voiceFile)

      await api.post('/capsules', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Time capsule created and locked! 🔒')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create capsule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="page-container max-w-3xl"
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-2">Create a Time Capsule 🎁</h1>
          <p className="text-gray-500">Write something from the heart. It'll be kept safe until the right moment.</p>
        </div>

        {/* Recipient Type */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-6"
        >
          <h2 className="font-serif font-semibold text-capsule-dusk mb-4">Who is this for?</h2>
          <div className="grid grid-cols-2 gap-4">
            {(['teacher', 'student'] as const).map(type => (
              <label
                key={type}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${watchRecipientType === type
                  ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100'
                  : 'border-gray-200 hover:border-amber-200'
                }`}
              >
                <input type="radio" value={type} className="sr-only" {...register('recipient_type')} />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type === 'teacher' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {type === 'teacher' ? <GraduationCap className="w-6 h-6 text-purple-600" /> : <Users className="w-6 h-6 text-blue-600" />}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 capitalize">{type}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Unlocks in <span className="font-bold text-amber-600">{type === 'teacher' ? 5 : 8} years</span>
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Unlock date preview */}
          <div className="mt-5 flex items-center gap-3 bg-capsule-dusk/5 rounded-xl p-4">
            <Lock className="w-5 h-5 text-capsule-twilight flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-capsule-dusk">This capsule will unlock on</p>
              <p className="text-lg font-serif font-bold gradient-text">{format(unlockDate, 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Select recipient */}
          {recipients.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="font-serif font-semibold text-capsule-dusk mb-4">
                Select a specific {watchRecipientType} (optional)
              </h2>
              <select id="recipient-select" className="input-field bg-white" {...register('recipient_id')}>
                <option value="">All {watchRecipientType}s in my batch</option>
                {recipients.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Collaborative Checkbox */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="flex-1">
              <h2 className="font-serif font-semibold text-capsule-dusk mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" /> Group Memory
              </h2>
              <p className="text-sm text-gray-500">Allow your batchmates to add their own messages and photos to this capsule after you create it.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" className="sr-only peer" {...register('is_collaborative')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </motion.div>

          {/* Message */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="font-serif font-semibold text-capsule-dusk mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" /> Your Message
            </h2>
            <textarea
              id="capsule-message"
              placeholder={`Dear ${watchRecipientType === 'teacher' ? 'Teacher' : 'Friend'},\n\nBy the time you read this...`}
              rows={8}
              className="input-field resize-none"
              {...register('content_text')}
            />
            {errors.content_text && <p className="text-rose-500 text-xs mt-1">{errors.content_text.message}</p>}
          </motion.div>

          {/* Media upload */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h2 className="font-serif font-semibold text-capsule-dusk mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-amber-500" /> Add Photos or Videos
              <span className="text-xs text-gray-400 font-normal">(up to 5 files)</span>
            </h2>

            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {mediaPreviews.map((preview, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-gray-100">
                    {mediaFiles[i]?.type.startsWith('video/') ? (
                      <video src={preview} className="w-full h-full object-cover" />
                    ) : (
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-amber-200 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50 transition-all group"
            >
              <Upload className="w-8 h-8 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-600">Click to upload photos or videos</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, MP4, MOV · Max 50MB each</p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </motion.div>

          {/* Audio recording */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-card p-6"
          >
            <VoiceRecorder onRecordingComplete={(f) => setVoiceFile(f)} />
          </motion.div>

          {/* Submit */}
          <button
            id="capsule-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-4 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Lock className="w-5 h-5" /> Lock & Send Capsule</>
            )}
          </button>

          <p className="text-center text-gray-400 text-xs">
            Once submitted, this capsule cannot be edited or deleted.
          </p>
        </form>
      </motion.div>
    </motion.div>
  )
}
