'use client';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const tiers = [
  {
    name: 'Essential',
    from: '£2,400',
    tagline: 'A serious site for a serious business.',
    ideal: 'Ideal for local businesses, sole traders, and new brands.',
    features: [
      'Up to 5 pages',
      'Custom design — no templates',
      'Mobile-first, fully responsive',
      'Basic SEO setup',
      'Contact form & lead capture',
      '14-day delivery',
    ],
    cta: 'Start Essential',
    highlight: false,
  },
  {
    name: 'Signature',
    from: '£4,800',
    tagline: 'The full Motion Visual experience.',
    ideal: 'Ideal for growing brands, hospitality, and service businesses.',
    features: [
      'Up to 12 pages',
      'Cinematic animations & transitions',
      'Advanced SEO + Local SEO',
      'CMS integration',
      'Booking / reservation system',
      'Google Analytics + Tag Manager',
      '14-day delivery',
    ],
    cta: 'Start Signature',
    highlight: true,
  },
  {
    name: 'Flagship',
    from: '£9,500',
    tagline: 'When you need to own your market.',
    ideal: 'Ideal for premium brands, multi-location, or high-traffic sites.',
    features: [
      'Unlimited pages',
      'Custom 3D / WebGL elements',
      'E-commerce or ordering system',
      'Performance engineering',
      'Ongoing retainer available',
      'Priority support & SLA',
      'Dedicated project lead',
    ],
    cta: 'Start Flagship',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: 'clamp(100px,12vw,160px) clamp(24px,5vw,88px)' }}
    >
      {/* Top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Atmospheric glow — centred */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.07) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20 md:mb-28">
          <motion.div className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'rgba(237,232,220,0.35)' }}>
              Investment
            </span>
            <div className="w-8 h-px gradient-bg" />
          </motion.div>

          <motion.div className="overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
            <motion.h2 className="font-display italic"
              style={{ fontSize: 'clamp(1.6rem,6.5vw,8rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
              variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.95, ease } } }}>
              Clear pricing.<br />
              <span className="gradient-text">No surprises.</span>
            </motion.h2>
          </motion.div>

          <motion.p
            className="font-body font-light text-sm leading-relaxed mx-auto mt-8"
            style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '48ch' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            Every project is scoped individually — these are starting points.
            Book a free call and we'll give you an exact number within 24 hours.
          </motion.p>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ background: 'rgba(237,232,220,0.07)' }}>
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col"
              style={{
                background: tier.highlight ? 'rgba(196,30,30,0.04)' : '#0A0A0B',
                padding: `${tier.highlight ? 'clamp(52px,4.5vw,72px)' : 'clamp(36px,4.5vw,56px)'} clamp(24px,3vw,40px) clamp(36px,4.5vw,56px)`,
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.75, ease, delay: i * 0.1 }}>

              {/* Popular badge */}
              {tier.highlight && (
                <div className="absolute -top-px left-0 right-0 h-px gradient-bg" />
              )}
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="gradient-bg font-body text-[10px] tracking-[0.22em] uppercase rounded-full px-4 py-1.5"
                    style={{ color: '#F0EDED' }}>
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p className="font-body text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: tier.highlight ? 'rgba(196,30,30,0.85)' : 'rgba(237,232,220,0.3)' }}>
                {tier.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-body text-[10px] tracking-[0.1em] uppercase"
                  style={{ color: 'rgba(237,232,220,0.28)' }}>from</span>
                <span className={`font-display italic ${tier.highlight ? 'gradient-text' : ''}`}
                  style={{ fontSize: 'clamp(2.2rem,4.5vw,3.8rem)', letterSpacing: '-0.03em', lineHeight: 1, color: tier.highlight ? undefined : '#EDE8DC' }}>
                  {tier.from}
                </span>
              </div>

              <p className="font-body font-light text-xs mb-2" style={{ color: 'rgba(237,232,220,0.45)' }}>
                {tier.tagline}
              </p>
              <p className="font-body font-light text-xs mb-8" style={{ color: 'rgba(237,232,220,0.22)' }}>
                {tier.ideal}
              </p>

              {/* Divider */}
              <div className="mb-8" style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1 mb-10">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0 gradient-bg" />
                    <span className="font-body font-light text-xs leading-relaxed"
                      style={{ color: 'rgba(237,232,220,0.45)' }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a href="#quote"
                className={`inline-flex items-center justify-center gap-2 rounded-full font-body text-xs font-semibold cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02] duration-200 ${tier.highlight ? 'gradient-bg' : ''}`}
                style={{
                  padding: '14px 28px',
                  color: tier.highlight ? '#F0EDED' : 'rgba(237,232,220,0.65)',
                  border: tier.highlight ? 'none' : '1px solid rgba(237,232,220,0.14)',
                }}>
                {tier.cta} <ArrowUpRight size={11} />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Reassurance note */}
        <motion.p
          className="text-center font-body font-light text-xs mt-12"
          style={{ color: 'rgba(237,232,220,0.2)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}>
          All projects include hosting setup, domain configuration, and 30 days post-launch support.
          Payment split across project milestones — never 100% upfront.
        </motion.p>

      </div>
    </section>
  );
}
