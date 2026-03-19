import { useState, useEffect } from 'react'
import { differenceInSeconds, intervalToDuration, isPast, type Duration } from 'date-fns'

interface Props {
  targetDate?: string
  dark?: boolean
}

export default function CountdownTimer({ targetDate, dark }: Props) {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!targetDate) return
    const target = new Date(targetDate)
    if (isPast(target)) { setExpired(true); return }

    const tick = () => {
      if (isPast(target)) { setExpired(true); return }
      const duration = intervalToDuration({ start: new Date(), end: target })
      setTimeLeft(duration)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!targetDate) return null

  if (expired) return (
    <div className="flex items-center gap-2">
      <span className="text-emerald-400 text-xl">🔓</span>
      <span className={`font-semibold ${dark ? 'text-emerald-300' : 'text-emerald-600'}`}>Unlocked!</span>
    </div>
  )

  if (!timeLeft) return <div className={`text-sm ${dark ? 'text-white/60' : 'text-gray-400'}`}>Calculating...</div>

  const units = [
    { label: 'Yrs', value: timeLeft.years ?? 0 },
    { label: 'Mo', value: timeLeft.months ?? 0 },
    { label: 'Days', value: timeLeft.days ?? 0 },
    { label: 'Hrs', value: timeLeft.hours ?? 0 },
    { label: 'Min', value: timeLeft.minutes ?? 0 },
    { label: 'Sec', value: timeLeft.seconds ?? 0 },
  ].filter(u => u.value > 0 || ['Hrs','Min','Sec'].includes(u.label))

  return (
    <div className="flex flex-wrap gap-2">
      {units.map(u => (
        <div key={u.label} className={`flex flex-col items-center min-w-[52px] rounded-xl px-3 py-2 ${dark ? 'bg-white/10' : 'bg-amber-50 border border-amber-100'}`}>
          <span className={`text-xl font-bold font-mono tabular-nums ${dark ? 'text-white' : 'text-capsule-dusk'}`}>
            {String(u.value).padStart(2, '0')}
          </span>
          <span className={`text-xs ${dark ? 'text-white/60' : 'text-amber-600'} font-medium`}>{u.label}</span>
        </div>
      ))}
    </div>
  )
}
