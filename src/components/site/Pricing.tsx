'use client';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const tiers = [
  {
    name: 'Essential',
    from: '£3,995',
    tagline: 'A serious site for a serious business.',
    ideal: 'Ideal for local businesses, sole traders, and new brands ready to compete online.',
    features: [
      'Up to 5 pages — fully custom',
      'No templates, no shortcuts',
      'Mobile-first, fully responsive',
      'On-page SEO + Google Analytics',
      'Contact form & lead capture',
      '14-day delivery guarantee',
    ],
    cta: 'Start Essential',
    highlight: false,
  },
  {
    name: 'Signature',
    from: '£7,500',
    tagline: 'The full Motion Visual experience.',
    ideal: 'Ideal for hospitality, service brands, and businesses ready to convert at a higher rate.',
    features: [
      'Up to 12 pages — fully bespoke',
      'Cinematic animations & scroll reveals',
      'Advanced SEO + Edinburgh local SEO',
      'CMS — edit your content anytime',
      'Booking or reservation system',
      'Google Analytics + Tag Manager',
      '14-day delivery guarantee',
    ],
    cta: 'Start Signature',
    highlight: true,
  },
  {
    name: 'Flagship',
    from: '£16,000',
    tagline: 'When you need to own your market.',
    ideal: 'Ideal for premium brands, multi-location businesses, and high-traffic e-commerce.',
    features: [
      'Unlimited pages — no scope ceiling',
      'Custom 3D / WebGL hero experience',
      'Full e-commerce or ordering system',
      'Performance engineering to Core Web Vitals A+',
      'Cloudflare Enterprise delivery',
      'Dedicated project lead — direct access',
      '21–28 day delivery / phased if needed',
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

      {/* Centred atmospheric glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.08) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-20 md:mb-24">
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

          <div className="overflow-hidden">
            <motion.h2 className="font-display italic"
              style={{ fontSize: 'clamp(1.6rem,6.5vw,8rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
              initial={{ y: '110%' }} whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.95, ease }}>
              Clear pricing.<br />
              <span className="gradient-text">No surprises.</span>
            </motion.h2>
          </div>

          <motion.p
            className="font-body font-light text-sm leading-relaxed mx-auto mt-7"
            style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '46ch' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            Every project is scoped individually — these are starting points.
            Book a free call and we'll give you an exact number within 24 hours.
          </motion.p>
        </div>

        {/* ── Tier cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col rounded-2xl"
              style={{
                background: tier.highlight ? 'rgba(196,30,30,0.045)' : 'rgba(237,232,220,0.02)',
                border: tier.highlight
                  ? '1px solid rgba(196,30,30,0.32)'
                  : '1px solid rgba(237,232,220,0.09)',
                padding: 'clamp(36px,3.5vw,52px) clamp(28px,2.8vw,40px)',
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.75, ease, delay: i * 0.1 }}>

              {/* Top gradient accent line for highlight */}
              {tier.highlight && (
                <div className="absolute top-0 left-0 right-0 h-[2px] gradient-bg rounded-t-2xl" />
              )}

              {/* Most Popular badge — inside card, top right */}
              {tier.highlight && (
                <div className="absolute top-5 right-5">
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase rounded-full px-3 py-1"
                    style={{
                      background: 'rgba(196,30,30,0.14)',
                      border: '1px solid rgba(196,30,30,0.28)',
                      color: 'rgba(196,30,30,0.9)',
                    }}>
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p className="font-body text-[10px] tracking-[0.3em] uppercase mb-5"
                style={{ color: tier.highlight ? 'rgba(196,30,30,0.85)' : 'rgba(237,232,220,0.3)' }}>
                {tier.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-body text-[10px] tracking-[0.1em] uppercase"
                  style={{ color: 'rgba(237,232,220,0.28)' }}>from</span>
                <span
                  className={`font-display italic ${tier.highlight ? 'gradient-text' : ''}`}
                  style={{
                    fontSize: 'clamp(2.4rem,4.5vw,4rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    color: tier.highlight ? undefined : '#EDE8DC',
                  }}>
                  {tier.from}
                </span>
              </div>

              <p className="font-body font-medium text-xs mb-1.5" style={{ color: 'rgba(237,232,220,0.55)' }}>
                {tier.tagline}
              </p>
              <p className="font-body font-light text-xs mb-8 leading-relaxed" style={{ color: 'rgba(237,232,220,0.25)' }}>
                {tier.ideal}
              </p>

              {/* Divider */}
              <div className="mb-8" style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

              {/* Features */}
              <ul className="flex flex-col gap-3.5 flex-1 mb-10">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className="w-[5px] h-[5px] rounded-full mt-1 shrink-0 gradient-bg" />
                    <span className="font-body font-light text-xs leading-relaxed"
                      style={{ color: 'rgba(237,232,220,0.5)' }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#quote"
                className={`inline-flex items-center justify-center gap-2 rounded-full font-body text-xs font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 ${tier.highlight ? 'gradient-bg' : ''}`}
                style={{
                  padding: '15px 28px',
                  color: tier.highlight ? '#F0EDED' : 'rgba(237,232,220,0.6)',
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
