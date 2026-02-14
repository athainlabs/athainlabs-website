import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState<'counting' | 'done'>('counting')
  const rafRef = useRef(0)
  const startRef = useRef(0)
  const glitchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const duration = 2600

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const linear = Math.min(elapsed / duration, 1)
      const eased = linear < 0.5
        ? 4 * linear * linear * linear
        : 1 - Math.pow(-2 * linear + 2, 3) / 2
      const val = Math.floor(eased * 100)
      setCount(val)

      if (linear < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setCount(100)
        setTimeout(() => setPhase('done'), 500)
      }
    }

    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate)
    }, 400)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Glitch effect during loading
  useEffect(() => {
    if (phase !== 'counting' || !glitchRef.current) return
    const el = glitchRef.current
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        el.style.transform = `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 2}px) skewX(${(Math.random() - 0.5) * 2}deg)`
        el.style.opacity = `${0.6 + Math.random() * 0.4}`
        setTimeout(() => {
          el.style.transform = 'translate(0,0) skewX(0)'
          el.style.opacity = '1'
        }, 50)
      }
    }, 150)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase === 'done') {
      const timer = setTimeout(onComplete, 700)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <AnimatePresence>
      {phase !== 'done' ? (
        <motion.div
          className="preloader"
          exit={{ y: '-100%', filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="preloader-scanlines" />
          <div className="preloader-content" ref={glitchRef}>
            <span className="preloader-text">Initializing</span>
            <span className="preloader-counter">{String(count).padStart(3, '0')}</span>
            <div className="preloader-bar-track">
              <div className="preloader-bar-fill" style={{ width: `${count}%` }} />
            </div>
            <div className="preloader-meta">
              <span className="preloader-meta-item">
                {count < 30 ? 'Loading assets' : count < 60 ? 'Initializing 3D' : count < 90 ? 'Building scene' : 'Ready'}
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
