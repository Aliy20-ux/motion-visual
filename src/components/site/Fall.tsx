import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// The moment between the hero and the services: the background falls through the ring (see journey/JourneyCanvas)
// while this line rises into the centre and fades away again. Scrubbed by scroll, so it never has to "play".
export default function Fall() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  // one transform string: compositor-only, no per-property shorthands
  const transform = useTransform(scrollYProgress, (p) => {
    if (reduce) return 'none';
    const lift = (0.5 - p) * 120;
    const grow = 1 + Math.max(0, 1 - Math.abs(p - 0.5) / 0.3) * 0.04;
    return `translateY(${lift.toFixed(1)}px) scale(${grow.toFixed(3)})`;
  });

  return (
    <section id="fall" ref={ref} className="relative flex items-center justify-center" style={{ height: '120svh', padding: '0 24px' }}>
      <motion.p className="journey-statement font-display" style={{ opacity: reduce ? 1 : opacity, transform }}>
        Raw energy.<br />
        <span className="journey-red">Engineered.</span>
      </motion.p>
    </section>
  );
}
