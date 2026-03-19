import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  onDone?: () => void
}

export default function ConfettiEffect({ onDone }: Props) {
  useEffect(() => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F59E0B', '#F43F5E', '#A78BFA', '#34D399'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F59E0B', '#F43F5E', '#A78BFA', '#34D399'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      } else {
        onDone?.()
      }
    }

    frame()
  }, [])

  return null
}
