import { useRef, useEffect } from 'react'

const insights = [
  {
    title: 'How AI Agents Reduced Data Entry Time by 40% for a Logistics Firm',
    category: 'Case Study',
    date: 'Oct 2025',
    link: '#',
  },
  {
    title: 'RPA vs AI: Which one does your Delhi business need?',
    category: 'Guide',
    date: 'Sep 2025',
    link: '#',
  },
  {
    title: "The CEO's Guide to AI Adoption in 2026",
    category: 'Whitepaper',
    date: 'Aug 2025',
    link: '#',
  },
]

export default function Insights() {
  const sectionRef = useRef<HTMLElement>(null)

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

  return (
    <section className="insights" id="insights" ref={sectionRef}>
      <div className="insights-header reveal-up">
        <div className="insights-label-group">
          <div className="insights-label-line" />
          <span className="insights-label">Thinking</span>
        </div>
        <h2 className="insights-heading">Latest Insights.</h2>
      </div>

      <div className="insights-grid">
        {insights.map((item, i) => (
          <a 
            href={item.link} 
            key={i} 
            className="insight-card reveal-up"
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <div className="insight-meta">
              <span className="insight-category">{item.category}</span>
              <span className="insight-date">{item.date}</span>
            </div>
            <h3 className="insight-title">{item.title}</h3>
            <div className="insight-arrow">→</div>
          </a>
        ))}
      </div>
    </section>
  )
}
