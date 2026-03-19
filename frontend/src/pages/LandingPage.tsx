import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Clock, Heart, Star, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const TYPEWRITER_PHRASES = [
  'Lock your memories today…',
  'Open them 5 years from now…',
  'Remember this moment forever.',
]

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && charIndex < phrase.length) {
      timeout = setTimeout(() => {
        setDisplayed(phrase.substring(0, charIndex + 1))
        setCharIndex(c => c + 1)
      }, 60)
    } else if (!deleting && charIndex === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 2000)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayed(phrase.substring(0, charIndex - 1))
        setCharIndex(c => c - 1)
      }, 30)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setPhraseIndex(i => (i + 1) % TYPEWRITER_PHRASES.length)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, deleting, phraseIndex])

  const features = [
    { icon: Lock, title: 'Time-Locked Capsules', desc: '5 years for teachers, 8 years for classmates. Your words, perfectly preserved.', color: 'from-amber-400 to-orange-500' },
    { icon: Clock, title: 'Countdown Timer', desc: 'Watch the days count down. Anticipate the beautiful moment of opening.', color: 'from-rose-400 to-pink-500' },
    { icon: Heart, title: 'Emotional Messages', desc: 'Text, photos, and videos — everything that makes this batch unforgettable.', color: 'from-purple-400 to-indigo-500' },
    { icon: Star, title: 'Batch Memories', desc: 'Every classmate contributes. Together, you create a treasure chest of shared moments.', color: 'from-emerald-400 to-teal-500' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-animated-gradient overflow-hidden"
    >
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle bg-amber-400 opacity-20"
            style={{
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 4 + 3}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-serif font-bold text-amber-900">TimeCapsule</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-amber-200">
            <Sparkles className="w-4 h-4" />
            College Farewell · Batch 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-capsule-dusk mb-6 leading-tight tracking-tight drop-shadow-md">
            Lock Your <span className="gradient-text drop-shadow-sm">Memories</span>,<br />
            Unlock the <span className="gradient-text drop-shadow-sm">Future</span>
          </h1>

          <div className="h-12 flex items-center justify-center mb-8">
            <p className="text-2xl text-amber-700 font-light typewriter-cursor">{displayed}</p>
          </div>

          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Write heartfelt messages to your teachers and classmates today. They'll open them 5–8 years from now,
            transported back to this beautiful chapter of life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              Create Your Capsule <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-4">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-rose-400/20 rounded-3xl blur-3xl" />
            <div className="relative glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-serif font-semibold text-capsule-dusk">To: Prof. Sharma</p>
                  <p className="text-sm text-gray-500">Opens in 5 years · Teacher Capsule</p>
                </div>
                <span className="ml-auto badge-locked">🔒 Locked</span>
              </div>
              <div className="bg-amber-50 rounded-xl p-5 text-left border border-amber-100">
                <p className="text-gray-700 italic leading-relaxed text-sm">
                  "Dear Sir, I still remember how you explained Data Structures with that dusty whiteboard marker...
                  You made me believe I could actually write good code. By the time you read this, I hope I've
                  built something that would make you proud. 💙"
                </p>
                <p className="text-amber-600 text-xs mt-3 font-medium">— Priya Mehta, TYCS 2026</p>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">🖼️ 2 photos</span>
                  <span className="bg-rose-100 text-rose-700 text-xs px-3 py-1 rounded-full">❤️ With love</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Unlock date</p>
                  <p className="text-sm font-bold text-amber-700">March 18, 2031</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title mb-4 tracking-tight drop-shadow-sm">Why TimeCapsule?</h2>
            <p className="text-gray-700 font-medium max-w-xl mx-auto">Every batch deserves to be remembered. We make sure your words last forever.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover p-6 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif font-semibold text-capsule-dusk mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <h2 className="section-title mb-4 tracking-tight drop-shadow-sm">Start Your Journey</h2>
            <p className="text-gray-700 font-medium mb-8">Join your batch and create memories that will last lifetimes.</p>
            <Link to="/register" className="btn-primary text-base px-10 py-4">
              Create Your Time Capsule <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-500 text-sm border-t border-amber-100">
        <p>Made with ❤️ for Batch 2026 · TimeCapsule Memories</p>
      </footer>
    </motion.div>
  )
}
