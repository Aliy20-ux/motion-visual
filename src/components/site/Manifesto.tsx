'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const bigLines = ['We build the websites', "that make your", 'competitors nervous.'];

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative overflow-hidden"
      style={{ background: '#09090A', padding: 'clamp(100px,13vw,180px) clamp(24px,5vw,88px)' }}
    >
      {/* Atmospheric glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 10%, rgba(196,144,32,0.055) 0%, transparent 60%)' }} />

      {/* ── Section label row ── */}
      <div className="relative z-10 flex items-start justify-between mb-24">
        <motion.div className="flex items-center gap-4 mt-4"
          initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="w-8 h-px gradient-bg" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(237,232,220,0.35)' }}>
            Our Manifesto
          </span>
        </motion.div>
        {/* Ghost number — parallax drift */}
        <motion.span
          className="font-display italic select-none pointer-events-none"
          style={{
            fontSize: 'clamp(8rem,18vw,22rem)',
            color: 'rgba(237,232,220,0.03)',
            letterSpacing: '-0.05em',
            lineHeight: 0.85,
            marginRight: '-3vw',
            marginTop: '-1.5rem',
            y: ghostY,
          }}
          aria-hidden>
          02
        </motion.span>
      </div>

      {/* ── Zone 1: Denial — small, muted editorial ── */}
      <motion.div
        className="relative z-10 mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease }}>
        <p
          className="font-display italic"
          style={{
            fontSize: 'clamp(1.05rem,1.9vw,2.1rem)',
            color: 'rgba(237,232,220,0.28)',
            letterSpacing: '-0.018em',
            lineHeight: 1.4,
            maxWidth: '55ch',
          }}>
          We don't do generic. We don't do templates.<br />
          We don't do "good&nbsp;enough."
        </p>
      </motion.div>

      {/* Thin rule pivot */}
      <motion.div
        className="relative z-10 h-px mb-20"
        style={{ background: 'rgba(237,232,220,0.07)', maxWidth: 480 }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease, delay: 0.2 }}
      />

      {/* ── Zone 2: Big dominant statement ── */}
      <div className="relative z-10 mb-24">
        {bigLines.map((line, i) => (
          <motion.div
            key={i}
            className="overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}>
            <motion.p
              className={i === 2 ? 'font-display italic gradient-text' : 'font-display italic'}
              style={{
                fontSize: 'clamp(1.8rem,8.5vw,11.5rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.028em',
                color: i === 2 ? undefined : '#EDE8DC',
              }}
              variants={{
                hidden: { y: '110%' },
                visible: { y: 0, transition: { duration: 1.05, ease, delay: i * 0.1 } },
              }}>
              {line}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* ── Zone 3: Two-column footer ── */}
      <motion.div
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-end"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.85, ease, delay: 0.25 }}>

        {/* Left — supporting display text */}
        <p
          className="font-display italic"
          style={{
            fontSize: 'clamp(1.35rem,2.4vw,2.8rem)',
            lineHeight: 1.18,
            letterSpacing: '-0.022em',
            color: 'rgba(237,232,220,0.5)',
          }}>
          Every pixel, every transition,<br />every word is intentional.
        </p>

        {/* Right — body + gold tagline */}
        <div className="flex flex-col gap-5">
          <p
            className="font-body font-light text-sm leading-relaxed"
            style={{ color: 'rgba(237,232,220,0.28)', maxWidth: '42ch' }}>
            We obsess over the 1% of details that visitors feel but never consciously notice.
            That's what separates a site from an unforgettable brand statement.
          </p>
          <span
            className="gradient-text font-display italic"
            style={{ fontSize: 'clamp(1.1rem,1.8vw,1.9rem)', letterSpacing: '-0.02em' }}>
            Edinburgh-born. Internet-renowned.
          </span>
        </div>
      </motion.div>

      {/* Bottom gold rule */}
      <motion.div
        className="mt-24 h-px relative z-10"
        style={{ background: 'linear-gradient(to right, rgba(176,120,16,0.65), rgba(232,192,80,0.4), transparent)' }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease, delay: 0.5 }}
      />
    </section>
  );
}
