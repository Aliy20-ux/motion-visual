'use client';
import { useRef, useEffect, useState, Suspense } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const clients = ['Thomas J Walls', 'Texture Lounge', 'CHE Edinburgh', 'S2 Studio', 'Lucky Chen', 'The Mid Yoken'];

/* ── 3D Fluid Distortion Plane ── */
const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uDistortion;
  varying vec2 vUv;
  varying float vDistortion;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float dist = distance(uv, uMouse * 0.5 + 0.5);
    float wave1 = sin(pos.x * 3.0 + uTime * 0.6) * 0.06;
    float wave2 = cos(pos.y * 2.5 + uTime * 0.4) * 0.04;
    float cursor = (1.0 - smoothstep(0.0, 0.5, dist)) * 0.15 * uDistortion;
    pos.z += (wave1 + wave2 + cursor) * uDistortion;
    vDistortion = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDistortion;

  void main() {
    vec3 violet = vec3(0.486, 0.227, 0.929);
    vec3 cyan = vec3(0.024, 0.714, 0.831);
    vec3 dark = vec3(0.04, 0.04, 0.043);
    float t = vUv.x + vDistortion * 2.0 + sin(uTime * 0.3) * 0.1;
    vec3 col = mix(dark, mix(violet, cyan, vUv.y), smoothstep(0.0, 1.0, t));
    gl_FragColor = vec4(col, 0.82);
  }
`;

function FluidPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const targetMouse = useRef(new THREE.Vector2(0, 0));
  const distortionRef = useRef(1.0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      targetMouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const uniforms = useRef({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uDistortion: { value: 1.0 },
  });

  useFrame(({ clock }) => {
    uniforms.current.uTime.value = clock.elapsedTime;
    uniforms.current.uMouse.value.lerp(targetMouse.current, 0.06);
    distortionRef.current = THREE.MathUtils.lerp(distortionRef.current, 0.6, 0.008);
    uniforms.current.uDistortion.value = distortionRef.current;
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]}>
      <planeGeometry args={[viewport.width * 1.2, viewport.height * 1.2, 48, 48]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ── Client ticker ── */
function ClientTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % clients.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>Built for</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={clients[idx]}
          className="font-body text-xs tracking-[0.2em] uppercase gradient-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {clients[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Magnetic CTA ── */
function MagneticCTA({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({ x: (e.clientX - cx) * 0.35, y: (e.clientY - cy) * 0.35 });
  };
  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="gradient-bg inline-flex items-center gap-2 rounded-full font-body font-medium text-sm text-white transition-all duration-300 hover:opacity-90 hover:scale-105"
      style={{ padding: '16px 32px' }}
    >
      {children}
    </motion.a>
  );
}

/* ── Hero ── */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const headline = ['We build', 'the internet\'s', 'most wanted.'];

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0" data-cursor="invert">
        <Suspense fallback={null}>
          <Canvas
            camera={{ fov: 50, position: [0, 0, 3] }}
            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
            style={{ width: '100%', height: '100%' }}
          >
            <FluidPlane />
          </Canvas>
        </Suspense>
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,11,0.65) 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-40" style={{ background: 'linear-gradient(to bottom, #0A0A0B 0%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: 'linear-gradient(to top, #0A0A0B 0%, transparent 100%)' }} />
      </div>

      {/* Dark entrance veil */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: '#0A0A0B' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col justify-end flex-1"
        style={{
          padding: 'clamp(100px,14vw,180px) clamp(20px,5vw,80px) clamp(60px,8vw,100px)',
          maxWidth: 1400,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          y: textY,
          opacity,
        }}
      >
        {/* Location + ticker row */}
        <motion.div
          className="flex items-center justify-between mb-6 flex-wrap gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease }}
        >
          <span className="font-body text-xs tracking-[0.25em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>
            Edinburgh, Scotland
          </span>
          <ClientTicker />
        </motion.div>

        {/* Thin rule */}
        <motion.div
          className="mb-8"
          style={{ height: 1, background: 'rgba(244,241,236,0.08)' }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.0, ease, delay: 1.15 }}
        />

        {/* Headline */}
        <h1 aria-label="We build the internet's most wanted." className="relative">
          {headline.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span
                className="block font-display italic"
                style={{ fontSize: 'clamp(4rem,12vw,14rem)', lineHeight: 0.92, letterSpacing: '-0.025em' }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, ease, delay: 1.25 + i * 0.13 }}
              >
                <span style={i === 2 ? {} : { color: '#F4F1EC' }}
                  className={i === 2 ? 'gradient-text' : ''}>
                  {line}
                </span>
              </motion.span>
            </div>
          ))}
        </h1>

        {/* Sub row */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-10 lg:mt-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease, delay: 1.85 }}
        >
          <p className="font-body font-light text-sm leading-relaxed max-w-[280px]" style={{ color: 'rgba(244,241,236,0.58)' }}>
            Award-quality websites for brands<br />that refuse to be forgettable.
          </p>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-4">
            <MagneticCTA href="#work">
              See Our Work <ArrowUpRight size={14} />
            </MagneticCTA>
            <a
              href="#quote"
              className="font-body font-light text-sm transition-all duration-200 hover:opacity-100"
              style={{ color: 'rgba(244,241,236,0.55)', textDecoration: 'underline', textUnderlineOffset: 4 }}
            >
              Get a quote →
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-3 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1 }}
        style={{ opacity }}
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-14"
          style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.6), transparent)' }}
        />
        <span className="font-body text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.25)', writingMode: 'vertical-lr' }}>scroll</span>
      </motion.div>
    </section>
  );
}
