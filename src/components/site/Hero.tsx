'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { scrollToHash } from '../../lib/smoothScroll';

const ease = [0.16, 1, 0.3, 1] as const;
const clients = ['Texture Lounge', 'Trim2Fresh', 'Kell Executive', 'S2 Studio'];

function ClientTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % clients.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(246,242,234,0.94)', textShadow: '0 1px 14px rgba(10,10,11,0.9)' }}>Built for</span>
      <AnimatePresence mode="wait">
        <motion.span key={clients[idx]} className="font-body text-xs tracking-[0.2em] uppercase"
          style={{ color: '#EDE8DC', textShadow: '0 1px 14px rgba(10,10,11,0.9)' }}
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
  // Motion values + springs instead of React state: the magnetic pull updates on the
  // compositor-friendly transform path without re-rendering the Hero on every mousemove.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 22 });
  const y = useSpring(my, { stiffness: 300, damping: 22 });
  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  };
  return (
    <motion.a ref={ref} href={href} onClick={scrollToHash(href)}
      onMouseMove={handleMove} onMouseLeave={() => { mx.set(0); my.set(0); }}
      whileTap={{ scale: 0.96 }}
      className="gradient-bg inline-flex items-center gap-2 rounded-full font-body font-medium text-sm text-white cursor-pointer"
      style={{ padding: '15px 30px', x, y }}>
      {children}
    </motion.a>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const headline = ['We build', "the internet's", 'most wanted.'];

  return (
    // No background of its own: the journey canvas (journey/JourneyCanvas) is drawn behind it.
    // Without WebGL2 the .hero-fallback still image shows instead (see index.css).
    <section id="home" ref={sectionRef} className="hero-journey relative overflow-hidden"
      style={{ height: '100svh', display: 'flex', flexDirection: 'column' }}>
      <div className="hero-fallback absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />

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
            <span className="font-body text-[13px] tracking-[0.24em] uppercase" style={{ color: 'rgba(246,242,234,0.94)', textShadow: '0 1px 14px rgba(8,2,2,0.9)' }}>
              Edinburgh, Scotland
            </span>
            <div className="hidden sm:block w-px h-3" style={{ background: 'rgba(237,232,220,0.15)' }} />
            {/* Pill chip (not plain text) so it stays legible against the moving background whatever is
                behind it at any moment — plain crimson text on the bright red light read as low-contrast. */}
            <span
              className="inline-flex items-center rounded-full font-body text-xs tracking-[0.2em] uppercase"
              style={{
                color: '#FFE4E0',
                background: 'rgba(12,4,4,0.62)',
                border: '1px solid rgba(240,122,124,0.55)',
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
                style={{ fontSize: 'clamp(2.4rem,11.5vw,13rem)', lineHeight: 0.9, letterSpacing: '-0.028em' }}
                initial={{ y: '110%' }} animate={{ y: 0 }}
                transition={{ duration: 1.1, ease, delay: 1.3 + i * 0.12 }}>
                <span className={i === 2 ? 'hero-last' : ''} style={i === 2 ? {} : { color: '#F6F2EA' }}>
                  {line}
                </span>
              </motion.span>
            </div>
          ))}
        </h1>

        {/* CTA sub-row — the paragraph renders unanimated (no opacity/delay) because it's the
            largest text node Chrome can paint straight away; the headline animates in, and the canvas
            behind isn't an LCP candidate, so this line is what the metric measures first. The divider + buttons keep their original
            fade-in untouched. */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10 lg:mt-14">
          <p className="font-body font-normal text-[15px] leading-relaxed max-w-[280px]"
            style={{ color: 'rgba(246,242,234,0.94)', textShadow: '0 1px 12px rgba(8,2,2,0.85)' }}>
            Bespoke websites, live in 14 days.<br />Brands that refuse to be forgettable.
          </p>
          <div className="hidden sm:block w-px h-8" style={{ background: 'rgba(237,232,220,0.1)' }} />
          <motion.div className="flex items-center gap-5 flex-wrap"
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 1.55 }}>
            <MagneticCTA href="#quote">Get a Quote <ArrowUpRight size={14} /></MagneticCTA>
            <a href="#work" onClick={scrollToHash('#work')} className="font-body font-normal text-[15px] transition-opacity hover:opacity-80"
              style={{ color: 'rgba(246,242,234,0.94)', textShadow: '0 1px 12px rgba(8,2,2,0.85)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
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
        <span className="font-body text-[11px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(246,242,234,0.9)', writingMode: 'vertical-lr' }}>scroll</span>
      </motion.div>
    </section>
  );
}
