import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * FloatingGeometry — Subtle wireframe shapes drifting in the far background.
 */

interface ShapeConfig {
  type: 'icosahedron' | 'octahedron' | 'torus'
  pos: [number, number, number]
  scale: number
  speed: number
}

const SHAPES: ShapeConfig[] = [
  { type: 'icosahedron', pos: [-5, 3, -8], scale: 0.8, speed: 0.12 },
  { type: 'octahedron', pos: [6, -2, -6], scale: 0.6, speed: 0.15 },
  { type: 'torus', pos: [-4, -3.5, -10], scale: 0.7, speed: 0.1 },
  { type: 'icosahedron', pos: [5, 4, -12], scale: 0.5, speed: 0.18 },
  { type: 'octahedron', pos: [-6, 1, -14], scale: 0.4, speed: 0.08 },
]

function Shape({ config }: { config: ShapeConfig }) {
  const ref = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    switch (config.type) {
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(1, 1)
      case 'octahedron':
        return new THREE.OctahedronGeometry(1, 0)
      case 'torus':
        return new THREE.TorusGeometry(1, 0.3, 8, 16)
    }
  }, [config.type])

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#c0f0ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.035,
    })
  }, [])

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    mesh.rotation.x += delta * config.speed
    mesh.rotation.y += delta * config.speed * 0.7
  })

  return (
    <mesh
      ref={ref}
      position={config.pos}
      scale={config.scale}
      geometry={geometry}
      material={material}
    />
  )
}

export default function FloatingGeometry() {
  return (
    <group>
      {SHAPES.map((s, i) => (
        <Shape key={i} config={s} />
      ))}
    </group>
  )
}
