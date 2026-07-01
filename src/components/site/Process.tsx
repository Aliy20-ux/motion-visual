'use client';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  {
    num: '01',
    title: 'Brief & Strategy',
    duration: 'Day 1–2',
    body: 'We start with a focused discovery call — goals, audience, competitors, and brand. No endless questionnaires. We ask the right questions and we listen. By the end of day two, we have a strategy document you can hold us to.',
    accent: '#C49020',
  },
  {
    num: '02',
    title: 'Design & Direction',
    duration: 'Day 3–5',
    body: "You receive a full design direction — typography, colour palette, layout language, and key page concepts. Not wireframes. Real, polished design work. We refine until it's right, then we lock it.",
    accent: '#B07810',
  },
  {
    num: '03',
    title: 'Build & Animate',
    duration: 'Day 6–12',
    body: 'Our developers build from the approved designs — every animation, interaction, and transition handcrafted in code. No templates, no page builders. The site we build performs as well as it looks.',
    accent: '#C49020',
  },
  {
    num: '04',
    title: 'Launch & Handover',
    duration: 'Day 13–14',
    body: 'Final QA, speed audit, SEO setup, and deployment to your domain. You get full access, a walkthrough, and 30 days of post-launch support. Most clients go live in under two weeks from first call.',
    accent: '#B07810',
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="relative overflow-hidden"
      style={{ background: '#09090A', padding: 'clamp(100px,12vw,160px) clamp(24px,5vw,88px)' }}
    >
      {/* Atmospheric glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(196,144,32,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 md:mb-28">
          <div>
            <motion.div className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="w-8 h-px gradient-bg" />
              <span className="font-body text-[10px] tracking-[0.32em] uppercase"
                style={{ color: 'rgba(237,232,220,0.35)' }}>
                How We Work
              </span>
            </motion.div>

            <motion.div className="overflow-hidden"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.h2 className="font-display italic"
                style={{ fontSize: 'clamp(2.8rem,6.5vw,8rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.95, ease } } }}>
                Live in 14 days.<br />
                <span className="gradient-text">No exceptions.</span>
              </motion.h2>
            </motion.div>
          </div>

          <motion.div className="lg:max-w-xs"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            <p className="font-body font-light text-sm leading-relaxed mb-6"
              style={{ color: 'rgba(237,232,220,0.4)' }}>
              A clear four-step process. No scope creep, no missed deadlines.
              You always know exactly where your project stands.
            </p>
            <a href="#quote"
              className="inline-flex items-center gap-2 font-body text-xs tracking-[0.18em] uppercase transition-opacity hover:opacity-70 cursor-pointer"
              style={{ color: 'rgba(237,232,220,0.5)' }}>
              Start the process <ArrowUpRight size={12} />
            </a>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="group relative grid grid-cols-1 md:grid-cols-[120px_1fr_220px] gap-8 md:gap-12 py-10 md:py-12"
              style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.75, ease, delay: i * 0.08 }}>

              {/* Left: step number */}
              <div className="flex md:flex-col gap-4 md:gap-2 items-center md:items-start">
                <span className="font-display italic gradient-text"
                  style={{ fontSize: 'clamp(1.6rem,3.5vw,3rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {step.num}
                </span>
                <span className="font-body text-[10px] tracking-[0.22em] uppercase"
                  style={{ color: 'rgba(237,232,220,0.2)' }}>
                  {step.duration}
                </span>
              </div>

              {/* Centre: title + body */}
              <div>
                <h3 className="font-display italic mb-4"
                  style={{ fontSize: 'clamp(1.5rem,2.8vw,2.6rem)', color: '#EDE8DC', letterSpacing: '-0.022em', lineHeight: 1.05 }}>
                  {step.title}
                </h3>
                <p className="font-body font-light text-sm leading-relaxed"
                  style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '52ch' }}>
                  {step.body}
                </p>
              </div>

              {/* Right: decorative rule */}
              <div className="hidden md:flex items-center justify-end">
                <div
                  className="h-px w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to right, transparent, ${step.accent}60)` }} />
              </div>

              {/* Animated left border on hover */}
              <div
                className="absolute left-0 top-0 w-px h-0 group-hover:h-full transition-all duration-500 pointer-events-none"
                style={{ background: step.accent }} />
            </motion.div>
          ))}

          {/* Final border */}
          <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />
        </div>

        {/* Bottom CTA note */}
        <motion.div
          className="flex items-center justify-between mt-16 flex-wrap gap-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}>
          <p className="font-body font-light text-xs" style={{ color: 'rgba(237,232,220,0.25)' }}>
            Average project delivered in <span style={{ color: 'rgba(196,144,32,0.7)' }}>11.4 days</span> across all 2025 projects.
          </p>
          <a href="#quote"
            className="gradient-bg inline-flex items-center gap-2 rounded-full font-body text-xs font-semibold cursor-pointer transition-all hover:opacity-90 hover:scale-[1.03] duration-200"
            style={{ padding: '12px 28px', color: '#09090A' }}>
            Book Your Free Consultation <ArrowUpRight size={12} />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
