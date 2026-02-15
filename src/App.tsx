import { useLayoutEffect, lazy, Suspense } from 'react'
import './App.css'
import useSmoothScroll from './hooks/useSmoothScroll'
import GrainOverlay from './components/GrainOverlay'
import Scene3D from './components/Scene3D'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import { Analytics } from '@vercel/analytics/react'

// Lazy-load below-the-fold sections — they aren't needed until the user scrolls
const Services = lazy(() => import('./components/Services'))
const About = lazy(() => import('./components/About'))
const Insights = lazy(() => import('./components/Insights'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))

function App() {
  useSmoothScroll()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
    <>
      <GrainOverlay />
      <Scene3D ready active />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero ready />
        <Suspense fallback={null}>
          <Services />
          <About />
          <Insights />
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Analytics />
    </>
  )
}

export default App
