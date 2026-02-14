import { Suspense, useMemo, useRef, useEffect, memo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Group } from 'three'
import MorphingSphere from './MorphingSphere'
import OrbitingParticles from './OrbitingParticles'

/* Wraps children in a group that shifts with mouse for parallax depth */
const ParallaxRig = memo(function ParallaxRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })
  const { camera } = useThree()

  useEffect(() => {
    let frameId = 0
    const onMove = (e: MouseEvent) => {
      if (frameId) return
      frameId = requestAnimationFrame(() => {
        mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        frameId = 0
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  useFrame(() => {
    // Smooth lerp toward target
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.03
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.03

    const mx = smoothMouse.current.x
    const my = smoothMouse.current.y

    // Shift scene group — primary parallax layer
    if (groupRef.current) {
      groupRef.current.position.x = mx * 0.4
      groupRef.current.position.y = my * 0.25
      groupRef.current.rotation.y = mx * 0.06
      groupRef.current.rotation.x = -my * 0.04
    }

    // Subtle camera shift — secondary parallax layer (moves opposite)
    camera.position.x = -mx * 0.15
    camera.position.y = -my * 0.1
    camera.lookAt(0, 0, 0)
  })

  return <group ref={groupRef}>{children}</group>
})

/* Detect low-end devices via hardware concurrency & device memory */
function getPerformanceTier(): 'low' | 'mid' | 'high' {
  const cores = navigator.hardwareConcurrency || 2
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4
  if (cores <= 2 || memory <= 2) return 'low'
  if (cores <= 4 || memory <= 4) return 'mid'
  return 'high'
}

const SceneContent = memo(function SceneContent({ ready }: { ready: boolean }) {
  const tier = useMemo(() => getPerformanceTier(), [])

  return (
    <>
      {/* Lights — reduced to 2 for low-end */}
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#c0f0ff" />
      {tier !== 'low' && (
        <pointLight position={[-5, -3, 3]} intensity={0.3} color="#8060ff" />
      )}
      {tier === 'high' && (
        <pointLight position={[0, 5, -5]} intensity={0.2} color="#ff30a0" />
      )}

      {/* 3D Elements — wrapped in parallax rig */}
      <ParallaxRig>
        <MorphingSphere ready={ready} />
        <OrbitingParticles />
      </ParallaxRig>

      {/* Post-processing — simplified: removed ChromaticAberration (expensive full-screen pass) */}
      <EffectComposer multisampling={0} enabled={tier !== 'low'}>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette
          blendFunction={BlendFunction.NORMAL}
          offset={0.3}
          darkness={0.7}
        />
      </EffectComposer>
    </>
  )
})

export default function Scene3D({ ready = false, active = true }: { ready?: boolean; active?: boolean }) {
  if (!active) {
    return null
  }

  return (
    <div className="scene3d-container">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.25]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <SceneContent ready={ready} />
        </Suspense>
      </Canvas>
    </div>
  )
}
