import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * AccretionDisk — Dense swirling particle disk around the sphere,
 * styled like matter spiraling into a supermassive black hole.
 * Particles closer to center orbit faster. Hot color gradient.
 */

const PARTICLE_COUNT = 600

const vertexShader = /* glsl */ `
uniform float uTime;
attribute float aAngle;
attribute float aRadius;
attribute float aSpeed;
attribute float aSize;
attribute float aPhase;
attribute float aYOffset;

varying float vRadius;
varying float vAlpha;
varying float vHeat;

void main() {
  // Orbit — inner particles much faster
  float angle = aAngle + uTime * aSpeed;

  // Slight wobble for turbulence
  float wobbleY = sin(angle * 3.0 + aPhase * 6.28) * 0.06 * aRadius;
  float wobbleR = sin(angle * 5.0 + aPhase * 3.14) * 0.08;

  float r = aRadius + wobbleR;
  vec3 pos = vec3(
    cos(angle) * r,
    aYOffset + wobbleY,
    sin(angle) * r
  );

  // Heat — inner = hotter
  vHeat = 1.0 - smoothstep(2.2, 4.5, aRadius);
  vRadius = aRadius;

  // Twinkle / flicker
  float flicker = sin(uTime * 4.0 + aPhase * 20.0) * 0.3 + 0.7;
  // Brighter closer to center
  float coreBright = smoothstep(4.5, 2.2, aRadius);
  vAlpha = (0.3 + coreBright * 0.7) * flicker;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (180.0 / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
`

const fragmentShader = /* glsl */ `
varying float vRadius;
varying float vAlpha;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;

  // Soft glow falloff
  float glow = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.2, 0.0, d);

  // Color: hot inner (white-cyan) → mid (purple) → cool outer (deep magenta)
  vec3 hotColor = vec3(0.7, 0.95, 1.0);    // white-cyan core
  vec3 midColor = vec3(0.5, 0.2, 1.0);     // purple mid
  vec3 coolColor = vec3(0.8, 0.1, 0.4);    // magenta outer

  vec3 color = mix(coolColor, midColor, smoothstep(0.0, 0.5, vHeat));
  color = mix(color, hotColor, smoothstep(0.5, 1.0, vHeat));

  // White-hot core of each particle
  color = mix(color, vec3(1.0), core * vHeat * 0.5);

  float alpha = glow * vAlpha * 0.5;

  gl_FragColor = vec4(color, alpha);
}
`

export default function AccretionDisk() {
  const pointsRef = useRef<THREE.Points>(null)
  const groupRef = useRef<THREE.Group>(null)

  const { geometry, material } = useMemo(() => {
    const angles = new Float32Array(PARTICLE_COUNT)
    const radii = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)
    const yOffsets = new Float32Array(PARTICLE_COUNT)

    // Dummy positions — actual positions computed in vertex shader
    const positions = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random()
      // Bias toward inner radii for density
      const radius = 2.2 + Math.pow(t, 0.6) * 2.8

      angles[i] = Math.random() * Math.PI * 2
      radii[i] = radius
      // Kepler-ish: inner orbits faster (1/r^1.5 roughly)
      speeds[i] = 1.8 / Math.pow(radius / 2.2, 1.5) + Math.random() * 0.15
      sizes[i] = 1.0 + Math.random() * 2.5 + (1.0 - t) * 1.5
      phases[i] = Math.random()
      // Thin disk — slight vertical spread, thinner near center
      yOffsets[i] = (Math.random() - 0.5) * 0.15 * (radius / 4.0)

      // Need valid positions for bounding sphere
      positions[i * 3] = Math.cos(angles[i]) * radius
      positions[i * 3 + 1] = yOffsets[i]
      positions[i * 3 + 2] = Math.sin(angles[i]) * radius
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('aAngle', new THREE.Float32BufferAttribute(angles, 1))
    geo.setAttribute('aRadius', new THREE.Float32BufferAttribute(radii, 1))
    geo.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1))
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1))
    geo.setAttribute('aYOffset', new THREE.Float32BufferAttribute(yOffsets, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { geometry: geo, material: mat }
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    material.uniforms.uTime.value += delta
  })

  return (
    <group ref={groupRef} position={[3.2, 0.1, 0]}>
      {/* Tilt the disk ~75° so it looks like a proper accretion disk viewed at an angle */}
      <group rotation={[1.25, 0.2, 0.3]}>
        <points ref={pointsRef} geometry={geometry} material={material} />
      </group>
    </group>
  )
}
