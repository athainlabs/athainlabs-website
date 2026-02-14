import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * OrbitingParticles — 3 tilted rings of glowing particles orbiting the sphere.
 * When the cursor passes through, ripples propagate outward from the
 * intersection point, gently displacing particles as the wave passes.
 * Up to 6 ripples can be active at once. Clean and subtle.
 */

const PARTICLES_PER_RING = 50
const RING_COUNT = 3
const MAX_RIPPLES = 3

const pointVertexShader = /* glsl */ `
uniform float uTime;
uniform vec3 uRippleOrigins[${MAX_RIPPLES}];
uniform float uRippleTimes[${MAX_RIPPLES}];
uniform int uRippleCount;
attribute float aOffset;
attribute float aSize;
varying float vAlpha;
varying float vRippleHit;

void main() {
  vec3 pos = position;
  float totalDisp = 0.0;

  // Apply all active ripples
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (i >= uRippleCount) break;

    float age = uTime - uRippleTimes[i];
    if (age < 0.0 || age > 3.0) continue;

    float dist = distance(position, uRippleOrigins[i]);
    float rippleRadius = age * 2.5; // wave expands outward
    float waveDist = abs(dist - rippleRadius);

    // Wave shape — sharp sine pulse that fades with age
    float wave = sin(waveDist * 8.0) * exp(-waveDist * 3.0);
    float fade = 1.0 - smoothstep(0.0, 3.0, age);
    float strength = wave * fade * 0.12;

    // Displace along normal (outward from ring center)
    totalDisp += strength;
  }

  // Push particle outward from its ring plane
  vec3 outDir = normalize(pos + vec3(0.001));
  pos += outDir * totalDisp;

  vRippleHit = clamp(abs(totalDisp) * 3.0, 0.0, 1.0);

  // Twinkle
  float twinkle = sin(uTime * 2.0 + aOffset * 10.0) * 0.5 + 0.5;
  vAlpha = 0.3 + twinkle * 0.7;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (1.0 + vRippleHit * 0.3) * (200.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
`

const pointFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vRippleHit;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.1, d) * vAlpha;

  // Subtle color shift when ripple passes — slightly brighter
  vec3 color = vec3(0.6, 0.9, 1.0);
  color = mix(color, vec3(0.85, 0.95, 1.0), vRippleHit * 0.25);

  gl_FragColor = vec4(color, alpha * 0.35);
}
`

function RingWithRipple({
  ringIndex,
  onMaterial,
}: {
  ringIndex: number
  onMaterial: (mat: THREE.ShaderMaterial) => void
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const groupRef = useRef<THREE.Group>(null)

  const radius = 2.6 + ringIndex * 0.5

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(PARTICLES_PER_RING * 3)
    const offsets = new Float32Array(PARTICLES_PER_RING)
    const sizes = new Float32Array(PARTICLES_PER_RING)

    for (let i = 0; i < PARTICLES_PER_RING; i++) {
      const angle = (i / PARTICLES_PER_RING) * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = Math.sin(angle) * radius
      offsets[i] = Math.random() * Math.PI * 2
      sizes[i] = 1.5 + Math.random() * 2.0
    }

    const origins = []
    const times = []
    for (let i = 0; i < MAX_RIPPLES; i++) {
      origins.push(new THREE.Vector3(100, 100, 100))
      times.push(-10)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1))
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRippleOrigins: { value: origins },
        uRippleTimes: { value: times },
        uRippleCount: { value: 0 },
      },
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { geometry: geo, material: mat }
  }, [radius])

  useEffect(() => {
    onMaterial(material)
  }, [material, onMaterial])

  useFrame((_, delta) => {
    const grp = groupRef.current
    if (!grp) return

    material.uniforms.uTime.value += delta

    const speed = 0.15 - ringIndex * 0.03
    grp.rotation.y += delta * speed
  })

  const tiltX = [0.4, -0.3, 0.15][ringIndex]
  const tiltZ = [0.2, -0.5, 0.6][ringIndex]

  return (
    <group ref={groupRef} rotation={[tiltX, 0, tiltZ]}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}

export default function OrbitingParticles() {
  const { camera, size } = useThree()
  const materials = useRef<THREE.ShaderMaterial[]>([])
  const mouse2D = useRef(new THREE.Vector2(0, 0))
  const prevMouse2D = useRef(new THREE.Vector2(0, 0))
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const intersectPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const rippleIndex = useRef(0)
  const lastRippleTime = useRef(0)
  const targetVec = useRef(new THREE.Vector3())
  const sphereCenter = useRef(new THREE.Vector3(3.2, 0.1, 0))

  useEffect(() => {
    let frameId = 0
    const onMove = (e: MouseEvent) => {
      if (frameId) return
      frameId = requestAnimationFrame(() => {
        mouse2D.current.x = (e.clientX / size.width) * 2 - 1
        mouse2D.current.y = -(e.clientY / size.height) * 2 + 1
        frameId = 0
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [size])

  const registerMaterial = useCallback((mat: THREE.ShaderMaterial, idx: number) => {
    materials.current[idx] = mat
  }, [])

  useFrame(() => {
    // Check if mouse moved enough to spawn a ripple
    const dx = mouse2D.current.x - prevMouse2D.current.x
    const dy = mouse2D.current.y - prevMouse2D.current.y
    const moved = Math.sqrt(dx * dx + dy * dy)
    prevMouse2D.current.copy(mouse2D.current)

    const now = materials.current[0]?.uniforms.uTime.value ?? 0

    // Only spawn ripple if mouse moved meaningfully and enough time has passed
    if (moved > 0.008 && now - lastRippleTime.current > 0.3) {
      // Project mouse into 3D (reuse vector to avoid GC)
      raycaster.setFromCamera(mouse2D.current, camera)
      const target = raycaster.ray.intersectPlane(intersectPlane, targetVec.current)

      if (target) {
        // Check if mouse is roughly near the sphere area
        const distToSphere = target.distanceTo(sphereCenter.current)
        if (distToSphere < 5.0) {
          const idx = rippleIndex.current % MAX_RIPPLES
          rippleIndex.current++
          lastRippleTime.current = now

          materials.current.forEach((mat) => {
            if (!mat) return
            mat.uniforms.uRippleOrigins.value[idx].copy(target)
            mat.uniforms.uRippleTimes.value[idx] = now
            mat.uniforms.uRippleCount.value = Math.min(rippleIndex.current, MAX_RIPPLES)
          })
        }
      }
    }
  })

  return (
    <group position={[3.2, 0.1, 0]}>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <RingWithRipple
          key={i}
          ringIndex={i}
          onMaterial={(mat) => registerMaterial(mat, i)}
        />
      ))}
    </group>
  )
}
