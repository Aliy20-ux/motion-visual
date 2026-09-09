'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;
const STEP_DELAY = 0.35;

const steps = [
  {
    num: '01',
    title: 'Brief & Strategy',
    duration: 'Day 1–2',
    body: 'We start with a focused discovery call — goals, audience, competitors, and brand. No endless questionnaires. By the end of day two, we have a strategy document you can hold us to.',
  },
  {
    num: '02',
    title: 'Design & Direction',
    duration: 'Day 3–5',
    body: "You receive a full design direction — typography, colour palette, layout language, and key page concepts. Not wireframes. Real, polished design work. We refine until it's right.",
  },
  {
    num: '03',
    title: 'Build & Animate',
    duration: 'Day 6–12',
    body: 'Our developers build from the approved designs — every animation, interaction, and transition handcrafted in code. No templates, no page builders. The site performs as well as it looks.',
  },
  {
    num: '04',
    title: 'Launch & Handover',
    duration: 'Day 13–14',
    body: 'Final QA, speed audit, SEO setup, and deployment to your domain. You get full access, a walkthrough, and 30 days of post-launch support.',
  },
];

export default function Process() {
  const railRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [segments, setSegments] = useState<{ left: number; top: number; width: number }[]>([]);

  // The connecting line used to be positioned with guessed percentages (left-[12.5%],
  // right-[12.5%]), which assumes each grid column is an even fraction of the container —
  // untrue once gap-x-8 eats fixed pixel space out of a percentage-based grid, so the line
  // drifted out of alignment with the actual circle centers. Measuring the real rendered
  // positions and drawing one segment per gap is the only way this stays aligned at every
  // viewport width.
  useLayoutEffect(() => {
    function measure() {
      const rail = railRef.current;
      if (!rail) return;
      const railRect = rail.getBoundingClientRect();
      const centers = circleRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - railRect.left, y: r.top + r.height / 2 - railRect.top };
      });
      const next: { left: number; top: number; width: number }[] = [];
      for (let i = 0; i < centers.length - 1; i++) {
        const a = centers[i];
        const b = centers[i + 1];
        if (!a || !b) continue;
        next.push({ left: a.x, top: a.y, width: b.x - a.x });
      }
      setSegments(next);
    }
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section
      id="process"
      className="relative overflow-hidden"
      style={{ background: '#09090A', padding: 'clamp(80px,11vw,150px) clamp(24px,5vw,88px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Atmospheric glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(196,30,30,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* ── Full-width header block ── */}
        <div className="max-w-2xl mb-20 md:mb-28">
          <motion.div
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'rgba(237,232,220,0.5)' }}>How We Work</span>
          </motion.div>

          <motion.h2
            className="font-display italic mb-6"
            style={{ fontSize: 'clamp(2rem,5.5vw,6rem)', lineHeight: 0.92, letterSpacing: '-0.025em', color: '#EDE8DC' }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 0.85, ease }}>
            Live in 14 days.{' '}
            <span className="gradient-text">No exceptions.</span>
          </motion.h2>

          <motion.p
            className="font-body font-light text-sm leading-relaxed mb-8"
            style={{ color: 'rgba(237,232,220,0.5)', maxWidth: '52ch' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.25 }}>
            A clear four-step process. No scope creep, no missed deadlines.
            You always know exactly where your project stands.
          </motion.p>

          {/* Average delivery badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full font-body text-xs"
            style={{
              padding: '10px 20px',
              background: 'rgba(237,232,220,0.04)',
              border: '1px solid rgba(237,232,220,0.1)',
              color: 'rgba(237,232,220,0.55)',
            }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4 }}>
            <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background: '#C41E1E', boxShadow: '0 0 6px rgba(196,30,30,0.7)' }} />
            Delivery guarantee:{' '}
            <span className="font-semibold" style={{ color: '#EDE8DC' }}>14 days</span>
          </motion.div>
        </div>

        {/* ── Horizontal step rail ── */}
        <div ref={railRef} className="relative grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-14">
          {/* Connecting line — one measured segment per gap, so it always meets the
              actual circle centers exactly, and lights up in step with each stage. */}
          {segments.map((seg, i) => (
            <motion.div
              key={i}
              className="hidden md:block absolute h-px"
              style={{
                left: seg.left,
                top: seg.top,
                width: seg.width,
                transformOrigin: 'left',
                background: 'linear-gradient(to right, #C41E1E 0%, rgba(196,30,30,0.15) 100%)',
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.3 + (i + 1) * STEP_DELAY }} />
          ))}

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="group relative flex flex-col gap-4 cursor-default"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease, delay: 0.3 + i * STEP_DELAY }}>

              {/* Crimson numbered circle */}
              <motion.div
                ref={(el) => { circleRefs.current[i] = el; }}
                className="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#09090A', border: '1.5px solid #C41E1E' }}
                initial={{ boxShadow: '0 0 12px rgba(196,30,30,0.25)' }}
                whileHover={{ scale: 1.15, boxShadow: '0 0 20px rgba(196,30,30,0.5)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
                <span className="font-body text-[10px] font-semibold tracking-[0.08em]"
                  style={{ color: '#C41E1E' }}>
                  {step.num}
                </span>
              </motion.div>

              {/* Content — lifts on hover independently of the circle above, so the
                  connecting line (anchored to the circle's measured, unmoving center)
                  never drifts out of alignment when a card is hovered. */}
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3, ease }}>
                <p className="font-body text-[10px] tracking-[0.28em] uppercase mb-2"
                  style={{ color: 'rgba(237,232,220,0.5)' }}>
                  {step.duration}
                </p>
                <h3 className="font-display italic mb-3 transition-transform duration-200 group-hover:translate-x-[3px]"
                  style={{ fontSize: 'clamp(1.2rem,1.8vw,1.6rem)', color: '#EDE8DC', letterSpacing: '-0.022em', lineHeight: 1.1 }}>
                  {step.title}
                </h3>
                <p className="font-body font-light text-sm leading-relaxed"
                  style={{ color: 'rgba(237,232,220,0.5)' }}>
                  {step.body}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}
