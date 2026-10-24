'use client';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { scrollToHash } from '../../lib/smoothScroll';
import { depositFor, gbp } from '../../pricing';
import { CARE_INCLUDES, CARE_PLANS, carePriceLabel } from '../../commercial';
import { FLAGSHIP } from '../../flagship';

const EASE = [0.16, 1, 0.3, 1] as const;

const tiers = [
  {
    name: 'Essential',
    price: 800,
    carePlanPrice: CARE_PLANS.essential.price,
    tagline: 'A serious site for a serious business.',
    description: 'Perfect for local businesses and new brands ready to compete online.',
    features: [
      'Single landing page — fully custom',
      'No templates. No shortcuts.',
      'Mobile-first & fully responsive',
      'Contact form & lead capture',
      '14-day delivery',
    ],
    cta: 'Start Essential',
    isPopular: false,
  },
  {
    name: 'Signature',
    price: 1600,
    carePlanPrice: CARE_PLANS.signature.price,
    tagline: 'The full Motion Visual experience.',
    description: 'Ideal for hospitality and service brands ready to convert at a higher rate.',
    features: [
      'Up to 5 pages — fully bespoke',
      'Cinematic animations & scroll reveals',
      'Advanced SEO + Edinburgh local SEO',
      'Google Analytics + Tag Manager',
      'Interactive order builder (Lite)',
      '14-day delivery',
    ],
    cta: 'Start Signature',
    isPopular: true,
  },
  {
    name: 'Flagship',
    customPrice: true,
    tagline: FLAGSHIP.tagline,
    description: FLAGSHIP.description,
    features: FLAGSHIP.features,
    cta: 'Enquire about Flagship',
    isPopular: false,
  },
];

const carePlans = [
  { name: CARE_PLANS.essential.name, price: carePriceLabel('essential'), detail: '3 updates per payment period' },
  { name: CARE_PLANS.signature.name, price: carePriceLabel('signature'), detail: '6 updates per payment period · short report each period' },
  { name: CARE_PLANS.flagship.name, price: carePriceLabel('flagship'), detail: 'Scoped with you · up to 12 updates with fair use · quarterly review call' },
];

const careIncludes = CARE_INCLUDES;

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: 'clamp(72px,9vw,124px) clamp(24px,5vw,80px)' }}
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
              style={{ color: 'rgba(237,232,220,0.5)' }}>Investment</span>
            <div className="w-8 h-px gradient-bg" />
          </div>

          <h2 className="font-display italic mb-5"
            style={{ fontSize: 'clamp(2.4rem,5.5vw,7rem)', lineHeight: 0.9, letterSpacing: '-0.025em' }}>
            <span style={{ color: '#EDE8DC' }}>Clear pricing.</span>
            {' '}
            <span className="gradient-text">No surprises.</span>
          </h2>

          <p className="font-body font-light text-sm leading-relaxed mx-auto mb-10"
            style={{ color: 'rgba(237,232,220,0.5)', maxWidth: '44ch' }}>
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
                      <div className="flex items-baseline gap-2 flex-wrap">
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
                            £{tier.price!.toLocaleString('en-GB')}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="font-body text-[11px] mt-1" style={{ color: 'rgba(237,232,220,0.5)' }}>
                    {tier.customPrice ? 'scoped together, on a call' : 'one-off'}
                  </p>
                  {!tier.customPrice && (
                    <p className="font-body text-[11px] mt-1" style={{ color: 'rgba(237,232,220,0.5)' }}>
                      {gbp(depositFor(tier.price!))} deposit to start (25%)
                    </p>
                  )}
                  <p className="font-body text-[11px] mt-2" style={{ color: 'rgba(196,30,30,0.55)' }}>
                    {tier.customPrice ? `+ Care plan from ${gbp(CARE_PLANS.flagship.price)}, scoped with you` : `+ ${gbp(tier.carePlanPrice!)} care plan`}
                  </p>
                </div>

                {/* Tagline — red italic */}
                <p className="font-display italic mb-2"
                  style={{ fontSize: 'clamp(0.9rem,1.3vw,1.05rem)', color: '#C41E1E', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                  {tier.tagline}
                </p>

                {/* Description */}
                <p className="font-body font-light text-xs leading-relaxed mb-6"
                  style={{ color: 'rgba(237,232,220,0.5)' }}>
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
                <a href={tier.customPrice ? '#flagship' : '#quote'} onClick={scrollToHash(tier.customPrice ? '#flagship' : '#quote')}
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

        {/* ── Care plans + what's included — 60/40, deliberately not three equal boxes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5 mt-14">
          <motion.div
            style={{ borderRadius: 16, border: '1px solid rgba(237,232,220,0.08)', background: 'rgba(237,232,220,0.02)', padding: 'clamp(22px,2.6vw,32px)' }}
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: EASE }}>
            <p className="font-display italic mb-1" style={{ fontSize: 'clamp(1.3rem,2vw,1.8rem)', letterSpacing: '-0.02em', color: '#EDE8DC' }}>
              Care plans
            </p>
            <p className="font-body font-light text-xs leading-relaxed mb-5" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Optional, paid by direct debit. Unused updates don't roll over.
            </p>
            <ul className="flex flex-col">
              {carePlans.map(c => (
                <li key={c.name} className="flex items-baseline justify-between gap-4 py-3"
                  style={{ borderTop: '1px solid rgba(237,232,220,0.07)' }}>
                  <span className="font-body text-xs leading-relaxed" style={{ color: 'rgba(237,232,220,0.6)' }}>
                    <span style={{ color: '#EDE8DC' }}>{c.name}</span> — {c.detail}
                  </span>
                  <span className="font-display italic shrink-0" style={{ fontSize: '1.25rem', color: '#EDE8DC' }}>{c.price}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-[11px] mt-4 mb-2 tracking-[0.18em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Every care plan includes
            </p>
            <ul className="flex flex-wrap gap-2">
              {careIncludes.map(i => (
                <li key={i} className="font-body text-[11px] rounded-full"
                  style={{ padding: '5px 12px', border: '1px solid rgba(237,232,220,0.12)', color: 'rgba(237,232,220,0.6)' }}>
                  {i}
                </li>
              ))}
            </ul>
            <p className="font-body font-light text-[11px] leading-relaxed mt-4" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Prefer to prepay a year? Pay for 11 payments and get 12. Moving to a smaller plan later?
              Keep-alive is £30 for hosting, security, backups and monitoring, with no updates — a small
              update is £15 and an extra page £80. Minimum term and notice rules are in our{' '}
              <Link to="/terms" className="underline underline-offset-2">Terms</Link>.
            </p>
          </motion.div>

          <motion.div
            style={{ borderRadius: 16, border: '1px solid rgba(196,30,30,0.3)', background: 'rgba(196,30,30,0.04)', padding: 'clamp(22px,2.6vw,32px)' }}
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}>
            <p className="font-display italic mb-4" style={{ fontSize: 'clamp(1.3rem,2vw,1.8rem)', letterSpacing: '-0.02em', color: '#EDE8DC' }}>
              What's included
            </p>
            <ul className="flex flex-col gap-2.5 mb-4">
              {[
                'Fully custom design — no templates',
                'Two rounds of changes',
                'Your domain registered in your name, first year included',
                'You own the finished site once it’s paid in full',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check size={11} style={{ marginTop: 3, flexShrink: 0, color: '#C41E1E' }} />
                  <span className="font-body font-light text-xs leading-relaxed" style={{ color: 'rgba(237,232,220,0.6)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-[11px] mb-2 tracking-[0.18em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Not in the build price
            </p>
            <p className="font-body font-light text-xs leading-relaxed mb-5" style={{ color: 'rgba(237,232,220,0.5)' }}>
              Care plans, add-ons and third-party costs such as booking tools, SMS, stock photos and
              fonts, which you pay directly.
            </p>
            <p className="font-body text-[11px] mb-2 tracking-[0.18em] uppercase" style={{ color: 'rgba(237,232,220,0.5)' }}>
              When the 14 days start
            </p>
            <p className="font-body font-light text-xs leading-relaxed" style={{ color: 'rgba(237,232,220,0.5)' }}>
              The clock starts once we have your content and your signed agreement. If we're waiting
              on you for content, feedback or approvals, our dates move back by the same amount.
            </p>
          </motion.div>
        </div>

        {/* Upgrade path */}
        <motion.p
          className="font-body font-light text-xs leading-relaxed mx-auto mt-8 text-center"
          style={{ color: 'rgba(237,232,220,0.5)', maxWidth: '78ch' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span style={{ color: 'rgba(237,232,220,0.75)' }}>Upgrade path.</span>{' '}
          Started on Essential? After a full year on Essential with an active care plan (counted from
          launch), you can upgrade to Signature for a one-off £800, less credit for anything you've
          already bought that Signature includes — up to 4 extra pages at £80 each and the Lite order
          builder at £250 — with a minimum of £400. Your care plan moves to {gbp(CARE_PLANS.signature.price)} from the next payment
          period after the fee is paid.
        </motion.p>

        {/* Payment note */}
        <motion.p
          className="text-center font-body font-light text-xs mt-8 mx-auto"
          style={{ color: 'rgba(237,232,220,0.5)', maxWidth: '78ch' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}>
          A deposit of 25% of the build price secures your start date. The balance is
          due within 7 days of us sharing your finished site, and we launch once it has cleared. We never
          charge interest. For 30 days after launch we fix bugs free of charge; after that, support is
          available through an optional care plan or at a quoted price. Flagship payment terms are agreed
          individually.
        </motion.p>

      </div>
    </section>
  );
}
