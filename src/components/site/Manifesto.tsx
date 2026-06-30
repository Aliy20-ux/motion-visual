'use client';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const lines: {
  text: string;
  size: 'hero' | 'large' | 'mid';
  align: 'left' | 'right' | 'center';
  color: 'white' | 'muted' | 'gradient';
}[] = [
  { text: "We don't do generic.", size: 'hero', align: 'left', color: 'white' },
  { text: "We don't do templates.", size: 'hero', align: 'left', color: 'white' },
  { text: 'We don\'t do "good enough."', size: 'hero', align: 'left', color: 'white' },
  { text: 'Every pixel, every transition,\nevery word is intentional.', size: 'large', align: 'right', color: 'muted' },
  { text: 'We build the websites that make\nyour competitors nervous.', size: 'large', align: 'left', color: 'white' },
  { text: 'Edinburgh-born. Internet-renowned.', size: 'mid', align: 'center', color: 'gradient' },
];

const sizeMap = {
  hero: 'clamp(3.2rem, 10vw, 12rem)',
  large: 'clamp(2rem, 5.5vw, 6rem)',
  mid: 'clamp(1.4rem, 2.8vw, 3rem)',
};

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative overflow-hidden"
      style={{ padding: 'clamp(100px,13vw,180px) clamp(20px,5vw,80px)' }}
    >
      {/* Atmospheric violet glow top-left */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)' }}
      />
      {/* Atmospheric cyan glow bottom-right */}
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
      />

      {/* Section header row */}
      <motion.div
        className="flex items-start justify-between mb-20 md:mb-28 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-px gradient-bg" />
          <span
            className="font-body text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(244,241,236,0.35)' }}
          >
            Our Manifesto
          </span>
        </div>
        {/* Decorative section number — bleeds toward right edge */}
        <span
          className="font-display italic select-none leading-none"
          style={{
            fontSize: 'clamp(8rem,18vw,22rem)',
            color: 'rgba(244,241,236,0.03)',
            letterSpacing: '-0.05em',
            lineHeight: 0.85,
            marginRight: '-3vw',
            marginTop: '-2rem',
          }}
        >
          02
        </span>
      </motion.div>

      {/* Editorial lines */}
      <div className="relative z-10 space-y-1 md:space-y-0">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`overflow-hidden ${
              line.align === 'right'
                ? 'text-right'
                : line.align === 'center'
                ? 'text-center'
                : 'text-left'
            }`}
          >
            <motion.p
              className={
                line.color === 'gradient'
                  ? 'font-display italic gradient-text inline-block'
                  : 'font-display italic'
              }
              style={{
                fontSize: sizeMap[line.size],
                lineHeight: 0.92,
                letterSpacing: '-0.028em',
                whiteSpace: 'pre-line',
                color:
                  line.color === 'white'
                    ? '#F4F1EC'
                    : line.color === 'muted'
                    ? 'rgba(244,241,236,0.45)'
                    : undefined,
              }}
              initial={{ y: '115%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 1.05, ease, delay: i * 0.1 }}
            >
              {line.text}
            </motion.p>
          </div>
        ))}
      </div>

      {/* Bottom gradient rule */}
      <motion.div
        className="mt-20 md:mt-28 h-px relative z-10"
        style={{
          background:
            'linear-gradient(to right, rgba(124,58,237,0.6), rgba(6,182,212,0.6), transparent)',
        }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease, delay: 0.5 }}
      />
    </section>
  );
}
