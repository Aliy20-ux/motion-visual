'use client';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 xl:gap-24 items-start">

          {/* ── Left: Headline ── */}
          <div className="lg:sticky lg:top-28">
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="w-8 h-px gradient-bg" />
              <span className="font-body text-[10px] tracking-[0.32em] uppercase"
                style={{ color: 'rgba(237,232,220,0.35)' }}>How We Work</span>
            </motion.div>

            <div className="overflow-hidden mb-8">
              <motion.h2
                className="font-display italic"
                style={{ fontSize: 'clamp(2rem,5.5vw,7rem)', lineHeight: 0.92, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                initial={{ y: '110%' }} whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.95, ease }}>
                Live in 14 days.<br />
                <span className="gradient-text">No exceptions.</span>
              </motion.h2>
            </div>

            <motion.p
              className="font-body font-light text-sm leading-relaxed mb-8"
              style={{ color: 'rgba(237,232,220,0.4)', maxWidth: '36ch' }}
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
              Average delivery:{' '}
              <span className="font-semibold" style={{ color: '#EDE8DC' }}>11.4 days</span>
            </motion.div>
          </div>

          {/* ── Right: Vertical timeline ── */}
          <div className="relative">
            {/* Vertical line */}
            <motion.div
              className="absolute left-[18px] top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, #C41E1E 0%, rgba(196,30,30,0.15) 100%)' }}
              initial={{ scaleY: 0, originY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease, delay: 0.2 }} />

            <div className="flex flex-col gap-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="relative flex items-start gap-8 pb-12"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, ease, delay: 0.3 + i * 0.1 }}>

                  {/* Crimson numbered circle */}
                  <div
                    className="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: '#09090A',
                      border: '1.5px solid #C41E1E',
                      boxShadow: '0 0 12px rgba(196,30,30,0.25)',
                    }}>
                    <span className="font-body text-[10px] font-semibold tracking-[0.08em]"
                      style={{ color: '#C41E1E' }}>
                      {step.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-1.5">
                    <p className="font-body text-[10px] tracking-[0.28em] uppercase mb-2"
                      style={{ color: 'rgba(237,232,220,0.3)' }}>
                      {step.duration}
                    </p>
                    <h3 className="font-display italic mb-3"
                      style={{ fontSize: 'clamp(1.3rem,2.2vw,2rem)', color: '#EDE8DC', letterSpacing: '-0.022em', lineHeight: 1.1 }}>
                      {step.title}
                    </h3>
                    <p className="font-body font-light text-sm leading-relaxed"
                      style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '48ch' }}>
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}
