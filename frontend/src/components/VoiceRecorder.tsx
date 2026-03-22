import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react'

interface Props {
  onRecordingComplete: (file: File | null) => void
}

export default function VoiceRecorder({ onRecordingComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' })
        onRecordingComplete(file)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Could not access microphone. Please allow permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const deleteRecording = () => {
    setAudioUrl(null)
    setRecordingTime(0)
    onRecordingComplete(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-sky-200 p-5 flex flex-col items-center">
      {audioUrl ? (
        <div className="w-full flex items-center justify-between bg-sky-50 rounded-lg p-3">
          <button 
            type="button"
            onClick={togglePlay} 
            className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-sky-600 focus:outline-none transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          
          <div className="flex-1 px-4">
            <div className="h-2 bg-sky-200 rounded-full w-full overflow-hidden">
              <div className="h-full bg-sky-500 w-full animate-pulse opacity-50"></div>
            </div>
            <p className="text-xs text-sky-700 font-medium mt-1 text-center font-mono">
              Voice Note ({formatTime(recordingTime)})
            </p>
          </div>

          <button 
            type="button"
            onClick={deleteRecording} 
            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="text-center w-full">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3 text-sky-500 hover:bg-sky-200 hover:scale-105 transition-all shadow-sm"
            >
              <Mic className="w-8 h-8" />
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center mb-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 bg-rose-500/20 rounded-full animate-ping"></div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors shadow-md z-10"
                >
                  <Square className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
          
          {isRecording ? (
            <p className="text-rose-600 font-mono font-medium tracking-wider mb-1">
              {formatTime(recordingTime)} / 1:00
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-600 mb-1">
              Record a Voice Note
            </p>
          )}
          <p className="text-xs text-gray-400">
            {isRecording ? "Tap square to stop" : "Max 60 seconds"}
          </p>
        </div>
      )}
    </div>
  )
}
