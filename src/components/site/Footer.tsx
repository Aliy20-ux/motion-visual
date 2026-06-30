'use client';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';

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
      {/* Full-bleed CTA */}
      <section className="relative overflow-hidden" style={{ padding: 'clamp(80px,12vw,160px) clamp(20px,5vw,80px)', background: '#111114' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, #7C3AED, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="font-body text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: 'rgba(244,241,236,0.35)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Ready to begin?
          </motion.p>
          <motion.h2
            className="font-display italic mb-10"
            style={{ fontSize: 'clamp(3rem,8vw,9rem)', lineHeight: 0.9, letterSpacing: '-0.02em', color: '#F4F1EC' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          >
            Let's build<br /><span className="gradient-text">something great.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <a
              href="#quote"
              className="gradient-bg inline-flex items-center gap-3 rounded-full font-body font-medium text-base text-white px-10 py-5 hover:opacity-90 hover:scale-105 transition-all duration-300"
            >
              Start Your Project
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0A0A0B', borderTop: '1px solid rgba(244,241,236,0.06)' }}>
        {/* Kinetic wordmark */}
        <div className="overflow-hidden px-[clamp(20px,5vw,80px)] pt-16 pb-12" style={{ borderBottom: '1px solid rgba(244,241,236,0.06)' }}>
          <h2
            ref={wordmarkRef}
            className="font-display italic select-none transition-all duration-150"
            style={{
              fontSize: 'clamp(3rem,14vw,16rem)',
              lineHeight: 0.88,
              letterSpacing: '0.05em',
              cursor: 'default',
              background: distorted
                ? 'linear-gradient(135deg,#7C3AED,#06B6D4)'
                : 'linear-gradient(180deg, rgba(244,241,236,0.6) 0%, rgba(244,241,236,0.22) 100%)',
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

        {/* Footer bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-[clamp(20px,5vw,80px)] py-8">
          <div className="flex items-center gap-6">
            <span className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.25)' }}>© 2026 Motion Visual Agency Ltd</span>
            <span className="font-body text-xs hidden sm:block" style={{ color: 'rgba(244,241,236,0.15)' }}>Edinburgh, Scotland</span>
          </div>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href={`/${link.toLowerCase()}`} className="font-body text-xs transition-colors duration-200 hover:text-off-white/70" style={{ color: 'rgba(244,241,236,0.25)' }}>
                {link}
              </a>
            ))}
            <a href="/admin" className="font-body text-xs transition-colors duration-200 hover:text-violet-400" style={{ color: 'rgba(124,58,237,0.4)' }}>
              Admin
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
