import { useEffect, useRef, useState, useCallback } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<HTMLDivElement[]>([])
  const pos = useRef({ x: -100, y: -100 })
  const target = useRef({ x: -100, y: -100 })
  const trailPositions = useRef(
    Array.from({ length: 3 }, () => ({ x: -100, y: -100 }))
  )
  const [label, setLabel] = useState('')
  const [hovering, setHovering] = useState(false)

  // Stable hover handlers — avoids constant re-binding
  const handleEnter = useCallback((e: Event) => {
    setHovering(true)
    const lbl = (e.currentTarget as HTMLElement).dataset.cursorLabel || ''
    setLabel(lbl)
  }, [])
  const handleLeave = useCallback(() => {
    setHovering(false)
    setLabel('')
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const onMouseMove = (e: MouseEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
    }

    let raf: number
    const animate = () => {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.15)
      pos.current.y = lerp(pos.current.y, target.current.y, 0.15)
      cursor.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`

      // Update trails (reduced to 3)
      trailPositions.current.forEach((trail, i) => {
        const prev = i === 0 ? pos.current : trailPositions.current[i - 1]
        trail.x = lerp(trail.x, prev.x, 0.18 - i * 0.03)
        trail.y = lerp(trail.y, prev.y, 0.18 - i * 0.03)
        const el = trailRefs.current[i]
        if (el) {
          el.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`
        }
      })

      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    animate()

    // Set up hovers once, then observe for new elements
    const setupHovers = () => {
      document.querySelectorAll('[data-hover]').forEach((el) => {
        // Prevent duplicate listeners via a data flag
        if ((el as HTMLElement).dataset._cursorBound) return
        ;(el as HTMLElement).dataset._cursorBound = '1'
        el.addEventListener('mouseenter', handleEnter)
        el.addEventListener('mouseleave', handleLeave)
      })
    }

    const timer = setTimeout(setupHovers, 600)
    // Use a debounced observer instead of instant re-bind
    let observerTimeout: ReturnType<typeof setTimeout>
    const observer = new MutationObserver(() => {
      clearTimeout(observerTimeout)
      observerTimeout = setTimeout(setupHovers, 500)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      observer.disconnect()
      clearTimeout(timer)
      clearTimeout(observerTimeout)
    }
  }, [handleEnter, handleLeave])

  return (
    <>
      {/* Trail dots — reduced from 5 to 3 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`trail-${i}`}
          className="cursor-trail"
          ref={(el) => { if (el) trailRefs.current[i] = el }}
          style={{ opacity: 0.25 - i * 0.06, width: 4 - i * 0.6, height: 4 - i * 0.6 }}
        />
      ))}
      <div ref={cursorRef} className={`cursor ${hovering ? 'is-hovering' : ''}`}>
        <div className="cursor-dot" />
        <div className="cursor-ring" />
        {label && <span className="cursor-label">{label}</span>}
      </div>
    </>
  )
}
