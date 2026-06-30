'use client';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const lines: { text: string; size: 'hero' | 'large' | 'mid'; align: 'left' | 'right' | 'center'; color: 'white' | 'muted' | 'gradient' }[] = [
  { text: 'We don\'t do generic.', size: 'hero', align: 'left', color: 'white' },
  { text: 'We don\'t do templates.', size: 'hero', align: 'left', color: 'white' },
  { text: 'We don\'t do "good enough."', size: 'hero', align: 'left', color: 'white' },
  { text: 'Every pixel, every transition,\nevery word is intentional.', size: 'large', align: 'right', color: 'muted' },
  { text: 'We build the websites that make\nyour competitors nervous.', size: 'large', align: 'left', color: 'white' },
  { text: 'Edinburgh-born. Internet-renowned.', size: 'mid', align: 'center', color: 'gradient' },
];

const sizeMap = {
  hero: 'clamp(3rem, 8.5vw, 10rem)',
  large: 'clamp(2rem, 5vw, 5.5rem)',
  mid: 'clamp(1.4rem, 2.8vw, 3rem)',
};

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative"
      style={{ padding: 'clamp(100px,13vw,180px) clamp(20px,5vw,80px)' }}
    >
      {/* Section header row */}
      <motion.div
        className="flex items-center justify-between mb-20 md:mb-28"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-px gradient-bg" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>
            Our Manifesto
          </span>
        </div>
        <span className="font-display italic" style={{ fontSize: 'clamp(4rem,8vw,10rem)', color: 'rgba(244,241,236,0.04)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          02
        </span>
      </motion.div>

      {/* Lines */}
      <div className="max-w-[1600px] mx-auto space-y-3 md:space-y-2">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`overflow-hidden ${line.align === 'right' ? 'text-right' : line.align === 'center' ? 'text-center' : 'text-left'}`}
          >
            <motion.p
              className={line.color === 'gradient' ? 'font-display italic gradient-text inline-block' : 'font-display italic'}
              style={{
                fontSize: sizeMap[line.size],
                lineHeight: 0.93,
                letterSpacing: '-0.025em',
                whiteSpace: 'pre-line',
                color:
                  line.color === 'white' ? '#F4F1EC' :
                  line.color === 'muted' ? 'rgba(244,241,236,0.55)' :
                  undefined,
              }}
              initial={{ y: '115%', opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 1.0, ease, delay: i * 0.09 }}
            >
              {line.text}
            </motion.p>
          </div>
        ))}
      </div>

      {/* Bottom rule */}
      <motion.div
        className="mt-20 md:mt-28 h-px"
        style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent)' }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease, delay: 0.5 }}
      />
    </section>
  );
}
