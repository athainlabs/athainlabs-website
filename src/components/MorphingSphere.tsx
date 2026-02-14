import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * Morphing Sphere — Noise-displaced icosphere with iridescent shader.
 * Uses a ShaderMaterial created imperatively (not JSX spread) for reliability.
 */

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

const vertexShader = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uTransition;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;
varying float vNoise;

void main() {
  float time = uTime * 0.3;
  vec3 np = position * 1.5;

  float n1 = snoise(np + time);
  float n2 = snoise(np * 2.0 + time * 1.3) * 0.5;
  float n3 = snoise(np * 4.0 + time * 0.7) * 0.25;
  float totalNoise = n1 + n2 + n3;

  float mouseInf = dot(normalize(position.xy), uMouse) * 0.25;
  float breath = sin(uTime * 0.8) * 0.05 + sin(uTime * 1.3) * 0.03;
  float disp = (totalNoise * 0.35 + mouseInf * 0.15 + breath) * uTransition;

  vDisplacement = disp;
  vNoise = totalNoise;

  vec3 newPos = position + normal * disp;

  vNormal = normalize(normalMatrix * normal);
  vWorldPos = (modelMatrix * vec4(newPos, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uTransition;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;
varying float vNoise;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

  // Iridescent multi-color
  float angle = atan(vNormal.z, vNormal.x) / 6.283 + 0.5;
  angle += uTime * 0.04 + vNoise * 0.3;
  float t = fract(angle);

  vec3 cA = vec3(0.04, 1.0, 0.94);   // cyan
  vec3 cB = vec3(0.48, 0.18, 1.0);   // purple
  vec3 cC = vec3(1.0, 0.18, 0.48);   // magenta
  vec3 cD = vec3(0.18, 0.48, 1.0);   // blue

  vec3 color;
  if (t < 0.25) color = mix(cA, cB, t * 4.0);
  else if (t < 0.5) color = mix(cB, cC, (t - 0.25) * 4.0);
  else if (t < 0.75) color = mix(cC, cD, (t - 0.5) * 4.0);
  else color = mix(cD, cA, (t - 0.75) * 4.0);

  // Rim glow
  vec3 rim = mix(cA, vec3(1.0), 0.5);
  color = mix(color, rim, fresnel * 0.6);

  // Peaks glow
  float peak = smoothstep(0.15, 0.45, abs(vDisplacement));
  color += peak * vec3(0.06, 0.15, 0.2);

  // Tone down overall brightness
  color *= 0.7;
  float alpha = (0.45 + fresnel * 0.35) * uTransition;

  gl_FragColor = vec4(color, alpha);
}
`

export default function MorphingSphere({ ready }: { ready: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const mouse = useRef(new THREE.Vector2(0, 0))
  const targetMouse = useRef(new THREE.Vector2(0, 0))
  const transitionRef = useRef(0)

  // Create material imperatively
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTransition: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  // Create geometry imperatively (optimised icosphere — 32 detail is visually identical to 64 at this size)
  const geometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(1.8, 32)
  }, [])

  useEffect(() => {
    let frameId = 0
    const onMouseMove = (e: MouseEvent) => {
      if (frameId) return
      frameId = requestAnimationFrame(() => {
        targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
        targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
        frameId = 0
      })
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    // Smooth mouse
    mouse.current.lerp(targetMouse.current, 0.04)

    // Transition
    if (ready && transitionRef.current < 1) {
      transitionRef.current = Math.min(1, transitionRef.current + delta * 0.4)
    }

    // Update uniforms
    material.uniforms.uTime.value += delta
    material.uniforms.uMouse.value.copy(mouse.current)
    material.uniforms.uTransition.value = transitionRef.current

    // Rotation
    mesh.rotation.y += delta * 0.08 + mouse.current.x * delta * 0.3
    mesh.rotation.x = Math.sin(material.uniforms.uTime.value * 0.05) * 0.1 + mouse.current.y * 0.15

  })

  return (
    <group position={[3.2, 0.1, 0]}>
      <mesh ref={meshRef} geometry={geometry} material={material} scale={1} />
    </group>
  )
}
