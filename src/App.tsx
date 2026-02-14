import { useState, useCallback, useLayoutEffect, lazy, Suspense } from 'react'
import './App.css'
import useSmoothScroll from './hooks/useSmoothScroll'
import Preloader from './components/Preloader'
import GrainOverlay from './components/GrainOverlay'
import Scene3D from './components/Scene3D'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'

// Lazy-load below-the-fold sections — they aren't needed until the user scrolls
const Services = lazy(() => import('./components/Services'))
const About = lazy(() => import('./components/About'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))

function App() {
  const [loaded, setLoaded] = useState(false)
  useSmoothScroll()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  const handlePreloaderComplete = useCallback(() => {
    // Always start from hero after preloader
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    setLoaded(true)
    document.body.style.overflow = ''

    // Reinforce once after layout settles (helps with smooth-scroll libs)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [])

  if (!loaded) {
    document.body.style.overflow = 'hidden'
  }

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} />
      <GrainOverlay />
      <Scene3D ready={loaded} active={loaded} />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero ready={loaded} />
        <Marquee />
        <Suspense fallback={null}>
          <Services />
          <About />
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}

export default App
