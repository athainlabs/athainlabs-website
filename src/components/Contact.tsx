import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <div className="magnetic-btn-wrap" data-hover>
      <a href={href} className="magnetic-btn">
        <div className="magnetic-btn-glow" />
        <span className="magnetic-btn-text">{children}</span>
        <span className="magnetic-btn-arrow">↗</span>
      </a>
    </div>
  )
}

const headingVariant = {
  hidden: { y: '110%', rotate: 3 },
  visible: (i: number) => ({
    y: '0%',
    rotate: 0,
    transition: { duration: 1, ease: [0.76, 0, 0.24, 1] as [number, number, number, number], delay: i * 0.12 },
  }),
}

export default function Contact() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
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

    el.querySelectorAll('.reveal-up').forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="contact-label-group reveal-up">
        <div className="contact-label-line" />
        <span className="contact-eyebrow">Get in touch</span>
      </div>

      <div className="contact-heading">
        <div className="contact-heading-line">
          <motion.h2
            custom={0}
            variants={headingVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            Let's build
          </motion.h2>
        </div>
        <div className="contact-heading-line">
          <motion.h2
            custom={1}
            variants={headingVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            something <em>bold</em>
          </motion.h2>
        </div>
      </div>

      <div className="contact-info">
        <div className="contact-address">
          <h3>Athain Labs</h3>
          <p>New Delhi, India</p>
          <a 
            href="https://maps.google.com/?q=New+Delhi,+India" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-map-link"
          >
            View on Map ↗
          </a>
        </div>
      </div>

      <MagneticButton href="mailto:hello@athain.software">
        Start a conversation
      </MagneticButton>
    </section>
  )
}
