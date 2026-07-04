'use client';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const tiers = [
  {
    name: 'Essential',
    priceMin: 1499,
    priceMax: 3499,
    carePlanPrice: 59.99,
    tagline: 'A serious site for a serious business.',
    description: 'Perfect for local businesses and new brands ready to compete online.',
    features: [
      'Up to 5 pages — fully custom',
      'No templates. No shortcuts.',
      'Mobile-first & fully responsive',
      'On-page SEO + Google Analytics',
      'Contact form & lead capture',
      '14-day delivery guarantee',
    ],
    cta: 'Start Essential',
    isPopular: false,
  },
  {
    name: 'Signature',
    priceMin: 3999,
    priceMax: 6999,
    carePlanPrice: 124.99,
    tagline: 'The full Motion Visual experience.',
    description: 'Ideal for hospitality and service brands ready to convert at a higher rate.',
    features: [
      'Up to 12 pages — fully bespoke',
      'Cinematic animations & scroll reveals',
      'Advanced SEO + Edinburgh local SEO',
      'CMS — edit your own content',
      'Booking or reservation system',
      'Google Analytics + Tag Manager',
      '14-day delivery guarantee',
    ],
    cta: 'Start Signature',
    isPopular: true,
  },
  {
    name: 'Flagship',
    customPrice: true,
    tagline: 'When you need to own your market.',
    description: 'For premium brands, multi-location businesses, and high-traffic e-commerce.',
    features: [
      'Unlimited pages — no scope ceiling',
      'Custom 3D / WebGL hero experience',
      'Full e-commerce or ordering system',
      'Performance to Core Web Vitals A+',
      'Cloudflare Enterprise delivery',
      'Dedicated project lead — direct access',
      '21–28 day delivery / phased if needed',
    ],
    cta: 'Start Flagship',
    isPopular: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: 'clamp(100px,12vw,160px) clamp(24px,5vw,80px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none flex items-start justify-center">
        <div style={{
          width: 900, height: 500, flexShrink: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.1) 0%, transparent 65%)',
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE }}>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'rgba(237,232,220,0.35)' }}>Investment</span>
            <div className="w-8 h-px gradient-bg" />
          </div>

          <h2 className="font-display italic mb-5"
            style={{ fontSize: 'clamp(2.4rem,5.5vw,7rem)', lineHeight: 0.9, letterSpacing: '-0.025em' }}>
            <span style={{ color: '#EDE8DC' }}>Clear pricing.</span>
            {' '}
            <span className="gradient-text">No surprises.</span>
          </h2>

          <p className="font-body font-light text-sm leading-relaxed mx-auto mb-10"
            style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '44ch' }}>
            One-off project pricing, no ongoing retainer.
            Book a free call and we'll give you an exact number within 24 hours.
          </p>
        </motion.div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className="relative flex flex-col"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}>

              {/* POPULAR badge — centred at top border */}
              {tier.isPopular && (
                <div className="absolute -top-[14px] left-0 right-0 flex justify-center z-20 pointer-events-none">
                  <div className="inline-flex items-center gradient-bg rounded-full px-4 py-1.5">
                    <span className="font-body font-semibold text-[10px] tracking-[0.22em] uppercase"
                      style={{ color: '#F0EDED' }}>Popular</span>
                  </div>
                </div>
              )}

              {/* Card shell */}
              <div
                className="relative flex flex-col flex-1"
                style={{
                  borderRadius: 16,
                  border: tier.isPopular
                    ? '1.5px solid rgba(196,30,30,0.45)'
                    : '1px solid rgba(237,232,220,0.08)',
                  background: tier.isPopular
                    ? 'rgba(196,30,30,0.045)'
                    : 'rgba(237,232,220,0.02)',
                  boxShadow: tier.isPopular
                    ? '0 0 70px rgba(196,30,30,0.12), 0 16px 48px rgba(0,0,0,0.5)'
                    : '0 4px 20px rgba(0,0,0,0.3)',
                  padding: tier.isPopular
                    ? '36px clamp(20px,2.5vw,30px) clamp(26px,2.8vw,34px)'
                    : 'clamp(26px,2.8vw,34px) clamp(20px,2.5vw,30px)',
                }}>

                {/* Top accent line on popular */}
                {tier.isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] gradient-bg"
                    style={{ borderRadius: '14px 14px 0 0' }} />
                )}

                {/* Tier name */}
                <p className="font-display italic mb-4"
                  style={{
                    fontSize: 'clamp(1.4rem,2.2vw,2rem)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    color: '#EDE8DC',
                  }}>
                  {tier.name}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    {tier.customPrice ? (
                      <span
                        className="font-display italic"
                        style={{
                          fontSize: 'clamp(2.6rem,4.5vw,4.2rem)',
                          letterSpacing: '-0.03em',
                          lineHeight: 1,
                          color: '#EDE8DC',
                        }}
                      >
                        Custom
                      </span>
                    ) : (
                      <span
                        className="font-display italic"
                        style={{
                          fontSize: 'clamp(1.7rem,3vw,2.6rem)',
                          letterSpacing: '-0.02em',
                          lineHeight: 1,
                          color: tier.isPopular ? undefined : '#EDE8DC',
                        }}
                      >
                        <span className={tier.isPopular ? 'gradient-text' : undefined}>
                          £{tier.priceMin!.toLocaleString('en-GB')}–£{tier.priceMax!.toLocaleString('en-GB')}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[11px] mt-1" style={{ color: 'rgba(237,232,220,0.25)' }}>
                    {tier.customPrice ? 'scoped together, on a call' : 'one-off'}
                  </p>
                  <p className="font-body text-[11px] mt-2" style={{ color: 'rgba(196,30,30,0.55)' }}>
                    + Care plan {tier.customPrice ? '— custom, scoped with you' : `from £${tier.carePlanPrice}/mo`}
                  </p>
                </div>

                {/* Tagline — red italic */}
                <p className="font-display italic mb-2"
                  style={{ fontSize: 'clamp(0.9rem,1.3vw,1.05rem)', color: '#C41E1E', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                  {tier.tagline}
                </p>

                {/* Description */}
                <p className="font-body font-light text-xs leading-relaxed mb-6"
                  style={{ color: 'rgba(237,232,220,0.3)' }}>
                  {tier.description}
                </p>

                {/* Divider */}
                <div className="mb-6" style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Check size={11} style={{
                        marginTop: 3, flexShrink: 0,
                        color: tier.isPopular ? '#C41E1E' : 'rgba(196,30,30,0.5)',
                      }} />
                      <span className="font-body font-light text-xs leading-relaxed"
                        style={{ color: 'rgba(237,232,220,0.5)' }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a href="#quote"
                  className="inline-flex items-center justify-center font-body text-xs font-semibold cursor-pointer transition-opacity duration-200 hover:opacity-85"
                  style={{
                    padding: '14px 24px', borderRadius: 999,
                    background: tier.isPopular ? 'linear-gradient(135deg,#8B1010,#C41E1E)' : 'transparent',
                    color: tier.isPopular ? '#F0EDED' : 'rgba(237,232,220,0.5)',
                    border: tier.isPopular ? 'none' : '1px solid rgba(237,232,220,0.12)',
                    letterSpacing: '0.05em',
                  }}>
                  {tier.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          className="text-center font-body font-light text-xs mt-14"
          style={{ color: 'rgba(237,232,220,0.16)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}>
          All projects include hosting setup, domain configuration, and 30 days post-launch support.
          Payment split across milestones — never 100% upfront.
        </motion.p>

      </div>
    </section>
  );
}
