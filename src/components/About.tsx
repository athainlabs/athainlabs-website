import { useEffect, useRef, useState, memo } from 'react'

const paragraphText =
  'We are a team of engineers, strategists, and builders obsessed with making AI useful. Not theoretical — practical. We partner with ambitious companies to automate what slows them down and prototype what moves them forward. Speed, craft, and real results — that is what we deliver.'

const AnimatedCounter = memo(function AnimatedCounter({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const duration = 2000
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            setValue(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end])

  return (
    <div className="about-stat" ref={ref}>
      <div className="about-stat-num">
        <span className="about-stat-value">{value}</span>
        <span className="about-stat-suffix">{suffix}</span>
      </div>
      <div className="about-stat-label">{label}</div>
      <div className="about-stat-bar">
        <div className="about-stat-bar-fill" style={{ width: counted.current ? '100%' : '0%' }} />
      </div>
    </div>
  )
})

export default function About() {
  const textRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<HTMLSpanElement[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const rafId = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const update = () => {
      ticking.current = false
      const container = textRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const viewH = window.innerHeight
      const start = viewH
      const end = -rect.height * 0.01
      const progress = 1 - (rect.top - end) / (start - end)
      const clamped = Math.max(0, Math.min(1, progress))
      const revealWindow = 0.5
      const revealProgress = Math.max(0, Math.min(1, clamped / revealWindow))

      const words = wordsRef.current
      const len = words.length
      for (let i = 0; i < len; i++) {
        const word = words[i]
        if (!word) continue
        const wordProgress = i / len
        const shouldShow = revealProgress > wordProgress
        // Avoid unnecessary classList thrashing
        if (shouldShow && !word.classList.contains('is-visible')) {
          word.classList.add('is-visible')
        } else if (!shouldShow && word.classList.contains('is-visible')) {
          word.classList.remove('is-visible')
        }
      }
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        rafId.current = requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  // Reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const section = sectionRef.current
    if (section) {
      section.querySelectorAll('.reveal-up').forEach((el) => observer.observe(el))
    }
    return () => observer.disconnect()
  }, [])

  const words = paragraphText.split(' ')

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about-inner">
        <div className="about-label-group reveal-up">
          <div className="about-label-line" />
          <span className="about-label">About Athain Labs</span>
        </div>

        <div className="about-text" ref={textRef}>
          {words.map((word, i) => (
            <span
              key={i}
              className="about-word"
              ref={(el) => { if (el) wordsRef.current[i] = el }}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="about-stats reveal-up">
          <AnimatedCounter end={3} suffix="x" label="Avg. efficiency gain" />
          <AnimatedCounter end={14} suffix="" label="Days avg. prototype delivery" />
        </div>
      </div>
    </section>
  )
}
