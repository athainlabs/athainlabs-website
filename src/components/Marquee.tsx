import { useRef, useEffect, useState, memo } from 'react'

const items = [
  'Workflow Automation',
  'Rapid Prototyping',
  'AI Strategy',
  'Systems Integration',
  'Data Pipelines',
  'Machine Learning',
  'MVP Development',
  'Process Intelligence',
  'Neural Networks',
  'Computer Vision',
]

/*
 * CSS-driven marquee — uses a single CSS animation instead of rAF loop.
 * Much lighter on CPU: the compositor handles the translate entirely on the GPU.
 */
const MarqueeTrack = memo(function MarqueeTrack({ reverse = false, rowClass = '' }: { reverse?: boolean; rowClass?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(0)

  // Measure track width once to set animation duration (constant speed regardless of width)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const totalWidth = track.scrollWidth / 2
    // Further slowed for comfortable reading speed
    const speed = 50 // px per second
    setDuration(totalWidth / speed)
  }, [])

  const doubled = [...items, ...items]

  return (
    <div className={`marquee ${reverse ? 'marquee--reverse' : ''} ${rowClass}`}>
      <div
        className="marquee-track"
        ref={trackRef}
        style={duration > 0 ? {
          animation: `${reverse ? 'marqueeReverse' : 'marqueeForward'} ${duration}s linear infinite`,
        } : { opacity: 0 }}
      >
        {doubled.map((item, i) => (
          <div className="marquee-item" key={i}>
            <div className="marquee-dot" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

export default function Marquee() {
  return (
    <div className="marquee-section">
      <MarqueeTrack rowClass="marquee-row-top" />
      <MarqueeTrack rowClass="marquee-row-bottom" reverse />
    </div>
  )
}
