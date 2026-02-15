import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!?<>{}[]'

function useScrambleText(text: string, delay: number, speed = 25) {
  const [display, setDisplay] = useState<string[]>(Array(text.length).fill(' '))

  useEffect(() => {
    let iteration = 0
    const maxIterations = text.length * 5
    let interval: ReturnType<typeof setInterval>

    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setDisplay(
          text.split('').map((char, i) => {
            if (char === ' ') return ' '
            if (i < Math.floor(iteration / 5)) return text[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
        )
        iteration++
        if (iteration > maxIterations) {
          clearInterval(interval)
          setDisplay(text.split(''))
        }
      }, speed)
    }, delay)

    return () => {
      clearTimeout(timer)
      clearInterval(interval!)
    }
  }, [text, delay, speed])

  return display
}

export default function Hero({
  ready,
  onVisibilityChange,
}: {
  ready: boolean
  onVisibilityChange?: (inView: boolean) => void
}) {
  const line1 = useScrambleText('ATHAIN', ready ? 200 : 99999, 22)
  const line2 = useScrambleText('LABS', ready ? 600 : 99999, 22)
  const [taglineVisible, setTaglineVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setTaglineVisible(true), 2200)
    return () => clearTimeout(t)
  }, [ready])

  // Notify parent when hero is visible to gate heavy 3D rendering
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || !onVisibilityChange) return

    const observer = new IntersectionObserver(
      ([entry]) => onVisibilityChange(entry.isIntersecting),
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20% 0px',
      }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [onVisibilityChange])

  // Parallax scroll effect — rAF-throttled
  useEffect(() => {
    let ticking = false
    let rafId = 0
    const onScroll = () => {
      if (ticking) return
      ticking = true
      rafId = requestAnimationFrame(() => {
        if (parallaxRef.current) {
          const y = window.scrollY
          const parallaxY = Math.max(-36, -y * 0.12)
          parallaxRef.current.style.transform = `translate3d(0, ${parallaxY}px, 0)`
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-content" ref={parallaxRef}>
        {/* Line 1 */}
        <div className="hero-title-wrap">
          <h1 className="hero-title">
            {line1.map((char, i) => (
              <span key={i} className="hero-char" style={{ animationDelay: `${i * 0.05}s` }}>
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Line 2 */}
        <div className="hero-title-wrap">
          <h1 className="hero-title hero-title-italic">
            {line2.map((char, i) => (
              <span key={i} className="hero-char" style={{ animationDelay: `${i * 0.05 + 0.3}s` }}>
                {char}
              </span>
            ))}
            <sup className="hero-registered">®</sup>
          </h1>
        </div>
      </div>

      {/* Bottom row */}
      <motion.div
        className="hero-bottom"
        initial={{ opacity: 0, y: 40 }}
        animate={taglineVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <p className="hero-tagline">
          An AI consultancy based in Delhi that automates<br />
          workflows and builds working prototypes — turning<br />
          bold ideas into real products, fast.
        </p>
        <div className="hero-scroll">
          <span className="hero-scroll-text">Scroll</span>
          <div className="hero-scroll-line">
            <div className="hero-scroll-line-inner" />
          </div>
        </div>
      </motion.div>

      {/* Decorative grid lines */}
      <div className="hero-grid-lines">
        <span /><span /><span /><span />
      </div>
    </section>
  )
}
