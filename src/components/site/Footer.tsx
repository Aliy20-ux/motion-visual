'use client';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function Footer() {
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const [distorted, setDistorted] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
    setDistorted(true);
    const el = wordmarkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    el.style.transform = `skew(${x * 0.4}deg, ${y * 0.2}deg)`;
    el.style.letterSpacing = `${0.05 + Math.abs(x) * 0.01}em`;
  };

  const handleMouseLeave = () => {
    setDistorted(false);
    if (wordmarkRef.current) {
      wordmarkRef.current.style.transform = '';
      wordmarkRef.current.style.letterSpacing = '0.05em';
    }
  };

  return (
    <>
      {/* ── Full-bleed CTA ── */}
      <section className="relative overflow-hidden" style={{ background: '#0C0C0F' }}>
        {/* Top gradient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,144,32,0.12), transparent 65%)' }} />
        {/* Bottom fade to footer */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #080809, transparent)' }} />

        <div className="relative" style={{ padding: 'clamp(100px,13vw,180px) clamp(24px,5vw,88px)' }}>
          <div className="max-w-5xl mx-auto text-center">
            <motion.p className="font-body text-[10px] tracking-[0.35em] uppercase mb-8"
              style={{ color: 'rgba(237,232,220,0.3)' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Ready to begin?
            </motion.p>

            {/* Huge display line */}
            <motion.div className="overflow-hidden mb-4"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.h2 className="font-display italic"
                style={{ fontSize: 'clamp(3.5rem,9vw,11rem)', lineHeight: 0.88, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.95, ease } } }}>
                Let's build
              </motion.h2>
            </motion.div>
            <motion.div className="overflow-hidden mb-14"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.h2 className="font-display italic gradient-text"
                style={{ fontSize: 'clamp(3.5rem,9vw,11rem)', lineHeight: 0.88, letterSpacing: '-0.025em' }}
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.95, ease, delay: 0.1 } } }}>
                something great.
              </motion.h2>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.35, duration: 0.7 }}>
              <a href="#quote"
                className="gradient-bg inline-flex items-center gap-3 rounded-full font-body font-medium text-base text-white hover:opacity-90 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ padding: '18px 40px' }}>
                Start Your Project
              </a>
              <a href="mailto:hello@motionvisual.co.uk"
                className="font-body text-sm transition-opacity hover:opacity-80"
                style={{ color: 'rgba(237,232,220,0.42)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                or email us directly
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#080809', borderTop: '1px solid rgba(237,232,220,0.06)' }}>
        {/* Kinetic wordmark */}
        <div className="overflow-hidden px-[clamp(24px,5vw,88px)] pt-16 pb-12" style={{ borderBottom: '1px solid rgba(237,232,220,0.06)' }}>
          <h2
            ref={wordmarkRef}
            className="font-display italic select-none transition-all duration-150"
            style={{
              fontSize: 'clamp(3rem,14vw,16rem)',
              lineHeight: 0.88,
              letterSpacing: '0.05em',
              cursor: 'default',
              background: distorted
                ? 'linear-gradient(135deg,#B07810,#E8C050)'
                : 'linear-gradient(180deg, rgba(237,232,220,0.55) 0%, rgba(237,232,220,0.18) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            MOTION<br />VISUAL
          </h2>
        </div>

        {/* Footer bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-[clamp(24px,5vw,88px)] py-8">
          <div className="flex items-center gap-6">
            <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.22)' }}>© 2026 Motion Visual Agency Ltd</span>
            <span className="font-body text-xs hidden sm:block" style={{ color: 'rgba(237,232,220,0.12)' }}>Edinburgh, Scotland</span>
          </div>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href={`/${link.toLowerCase()}`} className="font-body text-xs transition-opacity hover:opacity-70 cursor-pointer" style={{ color: 'rgba(237,232,220,0.22)' }}>
                {link}
              </a>
            ))}
            <a href="/admin" className="font-body text-xs transition-colors duration-200 hover:opacity-80" style={{ color: 'rgba(196,144,32,0.38)' }}>
              Admin
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
