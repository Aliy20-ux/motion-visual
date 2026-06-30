'use client';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const features = [
  {
    num: '01',
    title: 'Days, Not Months',
    body: 'We move at startup speed. Most agencies take 3–6 months. We deliver fully bespoke, award-tier sites in weeks — without cutting corners.',
    accent: '#7C3AED',
  },
  {
    num: '02',
    title: 'Obsessively Crafted',
    body: 'Every micro-interaction, easing curve, and typographic choice is deliberate. We obsess over the 1% details that visitors feel but never consciously notice.',
    accent: '#06B6D4',
  },
  {
    num: '03',
    title: 'Built to Convert',
    body: "Beautiful means nothing if it doesn't perform. We engineer every layout decision around psychology, user flow, and measurable outcomes.",
    accent: '#7C3AED',
  },
  {
    num: '04',
    title: 'Secure by Default',
    body: "Enterprise-grade auth, encrypted data flows, and hardened Cloudflare infrastructure. Your client's data is as protected as your reputation.",
    accent: '#06B6D4',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="relative"
      style={{ padding: 'clamp(80px,12vw,160px) clamp(20px,5vw,80px)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-10"
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
                Why Us
              </span>
            </motion.div>
            <div className="overflow-hidden">
              <motion.h2
                className="font-display italic"
                style={{ fontSize: 'clamp(2.5rem,6vw,7rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#F4F1EC' }}
                initial={{ y: '110%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease }}
              >
                The standard<br />
                <span className="gradient-text">we hold ourselves to.</span>
              </motion.h2>
            </div>
          </div>
          <motion.p
            className="font-body font-light text-sm leading-relaxed max-w-xs hidden md:block"
            style={{ color: 'rgba(244,241,236,0.4)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            We don't compete on price. We compete on outcomes. Here's what that means in practice.
          </motion.p>
        </div>

        {/* Feature rows */}
        <div>
          {features.map((feature, i) => (
            <FeatureRow key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      className="group relative flex flex-col md:grid md:grid-cols-[64px_1fr_1fr_32px] items-start md:items-center gap-4 md:gap-12 py-8 md:py-11"
      style={{ borderBottom: '1px solid rgba(244,241,236,0.06)' }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease, delay: index * 0.1 }}
    >
      {/* Hover glow bg */}
      <div
        className="absolute inset-0 -mx-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'rgba(244,241,236,0.015)' }}
      />

      {/* Animated accent bottom line */}
      <div
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full pointer-events-none transition-[width] duration-500"
        style={{ background: `linear-gradient(to right, ${feature.accent}80, transparent)` }}
      />

      {/* Number */}
      <span className="font-body text-xs font-medium gradient-text shrink-0 relative z-10">
        {feature.num}
      </span>

      {/* Title */}
      <div className="overflow-hidden relative z-10">
        <h3
          className="font-display italic"
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.8rem)',
            letterSpacing: '-0.02em',
            color: '#F4F1EC',
            lineHeight: 1.05,
          }}
        >
          {feature.title}
        </h3>
      </div>

      {/* Body */}
      <p
        className="font-body font-light text-sm leading-relaxed relative z-10"
        style={{ color: 'rgba(244,241,236,0.48)', maxWidth: 520 }}
      >
        {feature.body}
      </p>

      {/* Arrow */}
      <div className="hidden md:flex items-center justify-end relative z-10">
        <div
          className="w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0"
        >
          <ArrowUpRight size={13} style={{ color: 'rgba(244,241,236,0.6)' }} />
        </div>
      </div>
    </motion.div>
  );
}
