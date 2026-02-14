import { useState, useEffect, useRef, useCallback, memo } from 'react'

interface ServiceData {
  num: string
  name: string
  description: string
  tags: string[]
  icon: string
}

const services: ServiceData[] = [
  {
    num: '01',
    name: 'Workflow Automation',
    description:
      'We dissect your operations to find the highest-leverage automation opportunities. Then we build AI-driven systems that eliminate bottlenecks, reduce manual work, and compound efficiency gains over time.',
    tags: ['Process Mining', 'RPA', 'AI Agents', 'LLM Pipelines'],
    icon: '⚡',
  },
  {
    num: '02',
    name: 'Rapid Prototyping',
    description:
      'Got an idea? We turn concepts into functional prototypes in days, not months. We validate feasibility, demonstrate value to stakeholders, and de-risk your investment before you commit to full-scale development.',
    tags: ['POC', 'MVP', 'User Testing', 'Iteration'],
    icon: '◈',
  },
  {
    num: '03',
    name: 'AI Strategy',
    description:
      'We help leadership teams navigate the AI landscape with clarity. From identifying use cases to building roadmaps and selecting tech stacks — we provide the strategic foundation that makes AI initiatives succeed.',
    tags: ['Roadmapping', 'Use Case Discovery', 'Tech Stack', 'ROI Analysis'],
    icon: '◎',
  },
  {
    num: '04',
    name: 'Data & Infrastructure',
    description:
      'The smartest AI is only as good as its data. We architect robust data pipelines, optimize model infrastructure, and ensure your systems are built to scale from day one.',
    tags: ['Data Engineering', 'MLOps', 'Cloud', 'Scalability'],
    icon: '⬡',
  },
  {
    num: '05',
    name: 'Custom AI Products',
    description:
      'From intelligent copilots to autonomous agents — we design and build production-grade AI products tailored to your domain. Bespoke solutions that give you an unfair advantage.',
    tags: ['Product Design', 'Fine-tuning', 'Deployment', 'Monitoring'],
    icon: '◉',
  },
]

const ServiceCard = memo(function ServiceCard({ service, index, isActive, isVisible, onActivate }: {
  service: ServiceData
  index: number
  isActive: boolean
  isVisible: boolean
  onActivate: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()

    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const x = (px - 0.5) * 20
    const y = (py - 0.5) * -20

    // Sync glow hotspot with cursor for every card
    card.style.setProperty('--mouse-x', `${px * 100}%`)
    card.style.setProperty('--mouse-y', `${py * 100}%`)
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale3d(1.02, 1.02, 1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--mouse-x', '50%')
    card.style.setProperty('--mouse-y', '50%')
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale3d(1, 1, 1)'
  }, [])

  return (
    <div
      ref={cardRef}
      className={`service-card ${isVisible ? 'is-visible' : ''} ${isActive ? 'is-active' : ''}`}
      onClick={onActivate}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-hover
      style={{ transitionDelay: isVisible ? '0ms' : `${index * 0.05}s` }}
    >
      <div className="service-card-glow" />
      <div className="service-card-header">
        <span className="service-card-num">{service.num}</span>
        <span className="service-card-icon">{service.icon}</span>
      </div>
      <h3 className="service-card-name">{service.name}</h3>
      <p className="service-card-desc">{service.description}</p>
      <div className="service-card-tags">
        {service.tags.map((tag) => (
          <span className="service-tag" key={tag}>{tag}</span>
        ))}
      </div>
      <div className="service-card-line" />
    </div>
  )
})

export default function Services({ onVisibilityChange }: { onVisibilityChange?: (inView: boolean) => void }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll reveal (React-managed to avoid class loss on re-render)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Notify parent when "What we do" section enters/leaves viewport
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !onVisibilityChange) return

    const observer = new IntersectionObserver(
      ([entry]) => onVisibilityChange(entry.isIntersecting),
      { threshold: 0.05, rootMargin: '0px 0px -20% 0px' }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [onVisibilityChange])

  return (
    <section className="services" id="services" ref={sectionRef}>
      <div className={`services-header reveal-up ${isVisible ? 'is-visible' : ''}`}>
        <div className="services-label-group">
          <div className="services-label-line" />
          <span className="services-label">What we do</span>
        </div>
        <h2 className="services-heading">
          Building intelligent<br />systems that <em>ship</em>
        </h2>
      </div>

      <div className="services-grid">
        {services.map((s, i) => (
          <ServiceCard
            key={s.num}
            service={s}
            index={i}
            isActive={activeIndex === i}
            isVisible={isVisible}
            onActivate={() => setActiveIndex(activeIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  )
}
