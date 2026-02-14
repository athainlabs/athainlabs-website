import { useEffect, useRef } from 'react'

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">Athain Labs®</span>
            <span className="footer-tagline">AI Consultancy</span>
          </div>
          <div className="footer-links-group">
            <div className="footer-col">
              <span className="footer-col-label">Navigation</span>
              <a href="#" className="footer-link" data-hover>Index</a>
              <a href="#services" className="footer-link" data-hover>Services</a>
              <a href="#about" className="footer-link" data-hover>About</a>
              <a href="#contact" className="footer-link" data-hover>Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} Athain Labs. All rights reserved.</span>
          <span className="footer-credit">Designed with precision</span>
        </div>
      </div>
    </footer>
  )
}
