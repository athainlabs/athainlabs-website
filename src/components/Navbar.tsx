import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const links = [
  { label: 'Index', href: '#' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const linkVariant = {
  hidden: { y: '120%', rotate: 5 },
  visible: (i: number) => ({
    y: '0%',
    rotate: 0,
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as [number, number, number, number], delay: 0.05 + i * 0.07 },
  }),
  exit: (i: number) => ({
    y: '-120%',
    transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as [number, number, number, number], delay: i * 0.03 },
  }),
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 100)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`navbar ${scrolled ? 'is-scrolled' : ''}`} ref={navRef}>
        <a href="#" className="nav-logo" data-hover>
          <span className="nav-logo-text">Athain Labs</span>
          <span className="nav-logo-reg">®</span>
        </a>
        <div className="nav-right">
          <div className={`nav-status ${scrolled ? 'is-visible' : ''}`}>
            <span className="nav-status-dot" />
            <span className="nav-status-text">Available for projects</span>
          </div>
          <button
            className="nav-menu-btn"
            onClick={() => setOpen(!open)}
            data-hover
          >
            <span className="nav-menu-btn-text">{open ? 'Close' : 'Menu'}</span>
            <div className={`nav-burger ${open ? 'is-open' : ''}`}>
              <span /><span />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            className="menu-overlay"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="menu-bg-pattern" />
            <div className="menu-inner">
              <div className="menu-links">
                {links.map((link, i) => (
                  <div className="menu-link-row" key={link.label}>
                    <motion.a
                      href={link.href}
                      className="menu-link"
                      custom={i}
                      variants={linkVariant}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onClick={() => setOpen(false)}
                      data-hover
                    >
                      <span className="menu-link-num">0{i + 1}</span>
                      <span className="menu-link-text">{link.label}</span>
                    </motion.a>
                  </div>
                ))}
              </div>

              <motion.div
                className="menu-sidebar"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="menu-sidebar-group">
                  <span className="menu-sidebar-label">Get in touch</span>
                  <a href="mailto:hello@athain.software" className="menu-sidebar-link" data-hover>
                    hello@athain.software
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
