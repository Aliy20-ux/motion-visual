'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { scrollToHash } from '../../lib/smoothScroll';

const ease = [0.16, 1, 0.3, 1] as const;
const clients = ['Thomas J Walls', 'Texture Lounge', 'CHE Edinburgh', 'S2 Studio', 'Lucky Chen', 'Trim2Fresh'];

function ClientTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % clients.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>Built for</span>
      <AnimatePresence mode="wait">
        <motion.span key={clients[idx]} className="font-body text-xs tracking-[0.2em] uppercase gradient-text"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}>
          {clients[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function MagneticCTA({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    setPos({ x: (e.clientX - rect.left - rect.width / 2) * 0.35, y: (e.clientY - rect.top - rect.height / 2) * 0.35 });
  };
  return (
    <motion.a ref={ref} href={href} onClick={scrollToHash(href)}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onMouseMove={handleMove} onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className="gradient-bg inline-flex items-center gap-2 rounded-full font-body font-medium text-sm text-white cursor-pointer"
      style={{ padding: '15px 30px' }}>
      {children}
    </motion.a>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const scrollOverlay = useTransform(scrollYProgress, [0, 0.5], [0, 0.55]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // The veil used to clear on a fixed timer regardless of whether the video had actually
  // decoded a frame yet — on a cold cache/slower connection this let the static poster
  // image flash through before the video caught up and swapped in. Now it only clears once
  // the video really is ready (or a safety cap trips, so a slow/failed load never leaves
  // the hero stuck black).
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), 900);
    return () => clearTimeout(t);
  }, []);
  const markVideoReady = () => setVideoReady(true);

  // Some mobile browsers evaluate autoplay eligibility before React's `muted` JSX attribute
  // has definitely landed as the live IDL property, so the native `autoPlay` attribute can
  // get silently blocked with no error — leaving the video paused on frame one until the
  // visitor taps it. Forcing `.muted = true` and calling `.play()` explicitly (and again on
  // canplay, in case the first attempt races the video's readiness) makes it actually stick.
  const videoRef = useRef<HTMLVideoElement>(null);
  const tryPlay = () => {
    const v = videoRef.current;
    if (v && v.paused) {
      v.muted = true;
      v.play().catch(() => {});
    }
  };
  useEffect(() => { tryPlay(); }, []);

  // Belt-and-suspenders: on some real devices even an explicit programmatic .play() call
  // gets rejected (Low Power Mode, or a per-site "Never Auto-Play" Safari setting), and the
  // browser falls back to its native tap-to-play affordance. A genuine user gesture always
  // overrides autoplay restrictions, so retry on the very first touch/scroll/click anywhere
  // on the page — the video starts the instant the visitor does anything, no direct tap on
  // the video itself required.
  useEffect(() => {
    if (videoRef.current && !videoRef.current.paused) return;
    const events = ['touchstart', 'scroll', 'click', 'pointerdown'] as const;
    const handler = () => {
      tryPlay();
      events.forEach(e => window.removeEventListener(e, handler));
    };
    events.forEach(e => window.addEventListener(e, handler, { passive: true, once: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  const headline = ['We build', "the internet's", 'most wanted.'];

  return (
    <section id="home" ref={sectionRef} className="relative overflow-hidden"
      style={{ height: '100svh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Video layer with scroll-parallax scale ── */}
      <motion.div className="absolute inset-0 z-0" style={{ scale: videoScale, transformOrigin: 'center center' }}>
        <video
          ref={videoRef}
          autoPlay muted loop playsInline preload="auto"
          poster="/hero-poster.jpg"
          onLoadedData={() => { markVideoReady(); tryPlay(); }}
          onCanPlay={() => { markVideoReady(); tryPlay(); }}
          onPlaying={markVideoReady}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'center center' }}
        >
          <source src="/hero-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* ── Cinematic overlay stack ── */}
      {/* Bottom-heavy gradient — dark crimson base so text sits on black */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(6,4,4,0.32) 0%, rgba(8,4,4,0.04) 30%, rgba(14,6,6,0.62) 72%, #0A0505 100%)' }} />
      {/* Edge vignette with crimson tint */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(10,4,4,0.68) 100%)' }} />
      {/* Subtle crimson atmospheric glow — echoes the video's light source */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 62% 38%, rgba(196,30,30,0.09) 0%, transparent 58%)' }} />
      {/* Scroll-driven progressive darkening */}
      <motion.div className="absolute inset-0 z-[2] pointer-events-none"
        style={{ background: '#080404', opacity: scrollOverlay }} />

      {/* ── Entrance veil — stays opaque until the video actually has a frame ready, so the
          poster image is never visible on its own; the 900ms setTimeout above is just a
          safety cap in case the video is slow or fails to load. ── */}
      <motion.div className="absolute inset-0 z-[30] pointer-events-none" style={{ background: '#0A0505' }}
        initial={{ opacity: 1 }} animate={{ opacity: videoReady ? 0 : 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 flex flex-col justify-end flex-1"
        style={{
          padding: 'clamp(100px,14vw,180px) clamp(24px,5vw,88px) clamp(56px,7vw,96px)',
          maxWidth: 1440, width: '100%', margin: '0 auto',
          y: textY, opacity: contentOpacity,
        }}>

        {/* Location + 14-day badge + ticker */}
        <motion.div className="flex items-center justify-between mb-6 flex-wrap gap-3"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.05, ease }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-body text-xs tracking-[0.26em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Edinburgh, Scotland
            </span>
            <div className="hidden sm:block w-px h-3" style={{ background: 'rgba(237,232,220,0.15)' }} />
            {/* Pill chip (not plain text) so it stays legible against the video regardless of
                what's playing behind it at any given frame — plain crimson text on a red/bright
                video highlight was reading as low-contrast. */}
            <span
              className="inline-flex items-center rounded-full font-body text-xs tracking-[0.2em] uppercase"
              style={{
                color: '#F0B8B8',
                background: 'rgba(196,30,30,0.16)',
                border: '1px solid rgba(196,30,30,0.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '5px 12px',
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                style={{ background: '#E83838', boxShadow: '0 0 6px rgba(196,30,30,0.8)' }} />
              Live in 14 days
            </span>
          </div>
          <ClientTicker />
        </motion.div>

        {/* Rule */}
        <motion.div className="mb-8" style={{ height: 1, background: 'rgba(237,232,220,0.09)' }}
          initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease, delay: 1.2 }} />

        {/* Headline */}
        <h1 aria-label="We build the internet's most wanted.">
          {headline.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.span
                className="block font-display italic"
                style={{ fontSize: 'clamp(2rem,10.5vw,13rem)', lineHeight: 0.9, letterSpacing: '-0.028em' }}
                initial={{ y: '110%' }} animate={{ y: 0 }}
                transition={{ duration: 1.1, ease, delay: 1.3 + i * 0.12 }}>
                <span className={i === 2 ? 'gradient-text' : ''} style={i === 2 ? {} : { color: '#EDE8DC' }}>
                  {line}
                </span>
              </motion.span>
            </div>
          ))}
        </h1>

        {/* CTA sub-row — the paragraph renders unanimated (no opacity/delay) because it's the
            largest text node Chrome measures for LCP; a video can't be the LCP candidate (Chrome
            doesn't score <video> frames), so this line — despite being visually minor — was the
            actual element the metric was waiting on. The divider + buttons keep their original
            fade-in untouched. */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10 lg:mt-14">
          <p className="font-body font-light text-sm leading-relaxed max-w-[260px]"
            style={{ color: 'rgba(237,232,220,0.52)' }}>
            Bespoke websites, live in 14 days.<br />Brands that refuse to be forgettable.
          </p>
          <div className="hidden sm:block w-px h-8" style={{ background: 'rgba(237,232,220,0.1)' }} />
          <motion.div className="flex items-center gap-5 flex-wrap"
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 1.55 }}>
            <MagneticCTA href="#quote">Get a Quote <ArrowUpRight size={14} /></MagneticCTA>
            <a href="#work" onClick={scrollToHash('#work')} className="font-body font-light text-sm transition-opacity hover:opacity-80"
              style={{ color: 'rgba(237,232,220,0.5)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
              See our work →
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-3 z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.7, duration: 1.2 }}
        style={{ opacity: contentOpacity }}>
        <motion.div
          animate={{ y: [0, 14, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-14" style={{ background: 'linear-gradient(to bottom, rgba(196,30,30,0.7), transparent)' }} />
        <span className="font-body text-[9px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(237,232,220,0.5)', writingMode: 'vertical-lr' }}>scroll</span>
      </motion.div>
    </section>
  );
}
