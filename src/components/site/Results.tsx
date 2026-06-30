'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const stats = [
  { value: 47, suffix: '+', label: 'Websites Delivered', description: 'Across hospitality, retail, and professional services' },
  { value: 98, suffix: '%', label: 'Client Satisfaction', description: 'Measured post-launch across every project' },
  { value: 3, suffix: 'x', label: 'Average Traffic Lift', description: 'Organic search growth within 90 days of launch' },
  { value: 14, suffix: 'd', label: 'Average Delivery', description: 'From brief to live site — without compromising quality' },
];

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
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
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
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActive(true); }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className="relative p-8 lg:p-12 flex flex-col gap-4"
      style={{ borderLeft: index > 0 ? '1px solid rgba(244,241,236,0.06)' : 'none' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16,1,0.3,1], delay: index * 0.1 }}
    >
      <span
        className="font-display italic gradient-text"
        style={{ fontSize: 'clamp(3.5rem,8vw,7rem)', lineHeight: 1, letterSpacing: '-0.03em' }}
      >
        {count}{stat.suffix}
      </span>
      <div>
        <p className="font-body font-medium text-sm mb-1" style={{ color: 'rgba(244,241,236,0.8)' }}>{stat.label}</p>
        <p className="font-body font-light text-xs leading-relaxed" style={{ color: 'rgba(244,241,236,0.4)' }}>{stat.description}</p>
      </div>
    </motion.div>
  );
}

export default function Results() {
  return (
    <section id="results" className="relative" style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex items-center gap-4 mb-12"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-px gradient-bg" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>The Numbers</span>
        </motion.div>

        <motion.h2
          className="font-display italic mb-16"
          style={{ fontSize: 'clamp(2.5rem,6vw,6rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#F4F1EC' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
        >
          Results that<br /><span className="gradient-text">speak for themselves.</span>
        </motion.h2>

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
