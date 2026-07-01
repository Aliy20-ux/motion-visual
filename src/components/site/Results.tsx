'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const stats = [
  { value: 47, suffix: '+', label: 'Websites Delivered', description: 'Across hospitality, retail, and professional services' },
  { value: 98, suffix: '%', label: 'Client Satisfaction', description: 'Measured post-launch across every project' },
  { value: 3, suffix: '×', label: 'Average Traffic Lift', description: 'Organic search growth within 90 days of launch' },
  { value: 14, suffix: 'd', label: 'Average Delivery', description: 'From brief to live site — without compromising quality' },
];

const ease = [0.16, 1, 0.3, 1] as const;

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!active) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setCount(target); return undefined; }

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else setCount(target);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, active]);

  return count;
}

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(stat.value, 1600 + index * 200, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setActive(true);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className="group relative flex flex-col gap-4 p-8 lg:p-12"
      style={{ borderLeft: index > 0 ? '1px solid rgba(244,241,236,0.06)' : 'none' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease, delay: index * 0.1 }}
    >
      {/* Accent glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,144,32,0.06), transparent 70%)' }}
      />

      <span
        className="font-display italic gradient-text"
        style={{ fontSize: 'clamp(3.5rem,8vw,7rem)', lineHeight: 1, letterSpacing: '-0.03em' }}
      >
        {count}{stat.suffix}
      </span>
      <div>
        <p className="font-body font-medium text-sm mb-1" style={{ color: 'rgba(244,241,236,0.85)' }}>
          {stat.label}
        </p>
        <p className="font-body font-light text-xs leading-relaxed" style={{ color: 'rgba(244,241,236,0.38)' }}>
          {stat.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Results() {
  return (
    <section id="results" className="relative overflow-hidden" style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)' }}>
      {/* Atmospheric depth */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,144,32,0.05) 0%, transparent 70%)' }} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-10"
          style={{ borderBottom: '1px solid rgba(244,241,236,0.06)' }}
        >
          <div>
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-8 h-px gradient-bg" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>
                The Numbers
              </span>
            </motion.div>
            <motion.div className="overflow-hidden"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.h2
                className="font-display italic"
                style={{ fontSize: 'clamp(2.5rem,6vw,7rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#F4F1EC' }}
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.9, ease } } }}
              >
                Results that<br />
                <span className="gradient-text">speak for themselves.</span>
              </motion.h2>
            </motion.div>
          </div>
          <motion.p
            className="font-body font-light text-sm leading-relaxed max-w-xs hidden md:block"
            style={{ color: 'rgba(244,241,236,0.38)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Numbers measured across every live project we've shipped since founding.
          </motion.p>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ borderTop: '1px solid rgba(244,241,236,0.06)', borderBottom: '1px solid rgba(244,241,236,0.06)' }}
        >
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
