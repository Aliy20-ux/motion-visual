'use client';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const features = [
  {
    num: '01',
    title: 'Days, Not Months',
    body: 'Most agencies take 3–6 months. We deliver fully bespoke, award-tier sites in under two weeks — without cutting a single corner. Speed is craft, not compromise.',
    accent: '#C41E1E',
    tag: 'Delivery',
  },
  {
    num: '02',
    title: 'Obsessively Crafted',
    body: 'Every micro-interaction, easing curve, and typographic choice is deliberate. Nothing ships until it feels right — not just looks right.',
    accent: '#8B1010',
    tag: 'Quality',
  },
  {
    num: '03',
    title: 'Built to Convert',
    body: "Beautiful means nothing if it doesn't perform. Every layout decision is engineered around psychology, user flow, and measurable outcomes.",
    accent: '#C41E1E',
    tag: 'Performance',
  },
  {
    num: '04',
    title: 'Radically Transparent',
    body: 'You get a direct line to the person building your site — not an account manager. Daily updates, no jargon, no surprises. You always know exactly where your project stands.',
    accent: '#8B1010',
    tag: 'Process',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function WhyUs() {
  return (
    <section id="why-us" className="relative" style={{ background: '#080809' }}>
      {/* Top border */}
      <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

      <div style={{ padding: 'clamp(80px,11vw,150px) clamp(24px,5vw,88px)' }}>

        {/* ── Section header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 md:mb-28">
          <div>
            <motion.div className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="w-8 h-px gradient-bg" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(237,232,220,0.35)' }}>Why Us</span>
            </motion.div>
            <motion.div className="overflow-hidden"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.h2 className="font-display italic"
                style={{ fontSize: 'clamp(1.6rem,6.5vw,8rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.95, ease } } }}>
                The standard<br />
                <span className="gradient-text">we hold ourselves to.</span>
              </motion.h2>
            </motion.div>
          </div>

          <motion.div className="lg:max-w-xs"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            <p className="font-body font-light text-sm leading-relaxed mb-6" style={{ color: 'rgba(237,232,220,0.4)' }}>
              We don't compete on price. We compete on outcomes. Four principles that define every project we ship.
            </p>
            <a href="#quote" className="inline-flex items-center gap-2 font-body text-xs tracking-[0.18em] uppercase transition-opacity hover:opacity-70 cursor-pointer"
              style={{ color: 'rgba(237,232,220,0.5)' }}>
              Start a project <ArrowUpRight size={12} />
            </a>
          </motion.div>
        </div>

        {/* ── Feature grid — 2 cols desktop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'rgba(237,232,220,0.07)' }}>
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom border */}
      <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      className="group relative flex flex-col justify-between overflow-hidden"
      style={{ background: '#080809', padding: 'clamp(40px,5vw,64px)', minHeight: 'clamp(280px,30vw,380px)' }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}>

      {/* Background glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 20% 20%, ${feature.accent}0E 0%, transparent 65%)` }} />

      {/* Animated left border on hover */}
      <div className="absolute left-0 top-0 w-px h-0 group-hover:h-full transition-all duration-500 pointer-events-none"
        style={{ background: feature.accent }} />

      {/* Tag pill */}
      <div className="flex items-center justify-between mb-12">
        <span className="font-body text-[10px] tracking-[0.28em] uppercase px-3 py-1.5 rounded-full"
          style={{ background: `${feature.accent}14`, color: feature.accent, border: `1px solid ${feature.accent}28` }}>
          {feature.tag}
        </span>
        <span className="font-display italic" style={{ fontSize: 'clamp(1.2rem,2.5vw,2rem)', color: 'rgba(237,232,220,0.08)', letterSpacing: '-0.02em' }}>
          {feature.num}
        </span>
      </div>

      {/* Content */}
      <div>
        {/* Large ghost number */}
        <div className="overflow-hidden mb-4">
          <h3 className="font-display italic"
            style={{ fontSize: 'clamp(1.8rem,3.2vw,3.2rem)', lineHeight: 1.0, letterSpacing: '-0.025em', color: '#EDE8DC' }}>
            {feature.title}
          </h3>
        </div>
        <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.42)', maxWidth: 420 }}>
          {feature.body}
        </p>
      </div>

      {/* Bottom arrow */}
      <div className="mt-10 flex justify-end">
        <div className="w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
          style={{ border: `1px solid ${feature.accent}40`, background: `${feature.accent}0E` }}>
          <ArrowUpRight size={13} style={{ color: feature.accent }} />
        </div>
      </div>
    </motion.div>
  );
}
