'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import confetti from 'canvas-confetti';
import { Check, Star } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: 'spring' as const, stiffness: 100, damping: 30 };

const tiers = [
  {
    name: 'ESSENTIAL',
    projectPrice: 3995,
    retainerPrice: 895,
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
    name: 'SIGNATURE',
    projectPrice: 7500,
    retainerPrice: 1795,
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
    name: 'FLAGSHIP',
    projectPrice: 16000,
    retainerPrice: 3595,
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
  const [isRetainer, setIsRetainer] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const switchRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setDesktop(mq.matches);
    const h = () => setDesktop(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsRetainer(checked);
    if (checked && switchRef.current) {
      const r = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
        colors: ['#C41E1E', '#E83838', '#C8C8C8', '#EDE8DC'],
        ticks: 200, gravity: 1.1, decay: 0.92, startVelocity: 28,
      });
    }
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: 'clamp(100px,12vw,160px) clamp(24px,5vw,80px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Radial glow — centred */}
      <div className="absolute inset-0 pointer-events-none flex items-start justify-center">
        <div style={{
          width: 900, height: 500, flexShrink: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.11) 0%, transparent 65%)',
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── Header ── always visible, animate on enter */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE }}>

          {/* Section label */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'rgba(237,232,220,0.35)' }}>Investment</span>
            <div className="w-8 h-px gradient-bg" />
          </div>

          {/* Headline */}
          <h2 className="font-display italic mb-5"
            style={{ fontSize: 'clamp(2.2rem,5.5vw,7rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}>
            Clear pricing.<br />
            <span className="gradient-text">No surprises.</span>
          </h2>

          <p className="font-body font-light text-sm leading-relaxed mx-auto mb-10"
            style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '42ch' }}>
            One-off project or monthly retainer — toggle to compare.
            Book a free call and we'll give you an exact number within 24 hours.
          </p>

          {/* ── Toggle — 21st.dev style: switch LEFT, label RIGHT ── */}
          <div className="flex items-center justify-center gap-3">
            <button
              ref={switchRef}
              type="button"
              role="switch"
              aria-checked={isRetainer}
              onClick={() => handleToggle(!isRetainer)}
              className="relative flex-shrink-0 cursor-pointer"
              style={{
                width: 44, height: 26, borderRadius: 13, border: 'none',
                background: isRetainer
                  ? 'linear-gradient(135deg,#8B1010,#C41E1E)'
                  : 'rgba(237,232,220,0.15)',
                transition: 'background 0.3s',
              }}>
              <motion.span
                style={{
                  display: 'block', position: 'absolute', top: 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#EDE8DC', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
                animate={{ left: isRetainer ? 21 : 3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            </button>
            <span className="font-body text-sm" style={{ color: 'rgba(237,232,220,0.6)' }}>
              Monthly retainer{' '}
              <span className="font-medium" style={{ color: '#C41E1E' }}>(Save 30%)</span>
            </span>
          </div>
        </motion.div>

        {/* ── Cards ──
            Non-popular cards use mt-5 so they sit 20px lower.
            Popular card animates to y:-20 so it sits 20px ABOVE the grid baseline.
            Combined visual lift: 40px. Badge floats at the top border of the popular card.
        ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`relative flex flex-col${!tier.isPopular && desktop ? ' mt-5' : ''}`}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{
                opacity: 1,
                y: tier.isPopular && desktop ? -20 : 0,
                scale: !tier.isPopular && desktop ? 0.97 : 1,
              }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ ...SPRING, opacity: { duration: 0.5 }, delay: 0.4 + i * 0.08 }}>

              {/* ── "★ Popular" badge — centred at the top border of the popular card ── */}
              {tier.isPopular && (
                <div className="absolute -top-[14px] left-0 right-0 flex justify-center z-20 pointer-events-none">
                  <div className="inline-flex items-center gap-1.5 gradient-bg rounded-full px-4 py-1.5">
                    <Star size={9} style={{ color: '#F0EDED', fill: '#F0EDED' }} />
                    <span className="font-body font-semibold text-[9px] tracking-[0.22em] uppercase"
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
                    ? '2px solid rgba(196,30,30,0.42)'
                    : '1px solid rgba(237,232,220,0.08)',
                  background: tier.isPopular
                    ? 'rgba(196,30,30,0.055)'
                    : 'rgba(237,232,220,0.02)',
                  boxShadow: tier.isPopular
                    ? '0 0 80px rgba(196,30,30,0.13), 0 20px 60px rgba(0,0,0,0.55)'
                    : '0 4px 20px rgba(0,0,0,0.3)',
                  /* Extra top padding on popular to clear the badge */
                  padding: tier.isPopular
                    ? '36px clamp(22px,2.8vw,32px) clamp(28px,3vw,36px)'
                    : 'clamp(28px,3vw,36px) clamp(22px,2.8vw,32px)',
                }}>

                {/* Top accent line */}
                {tier.isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] gradient-bg"
                    style={{ borderRadius: '14px 14px 0 0' }} />
                )}

                {/* Tier name */}
                <p className="font-body text-[10px] tracking-[0.32em] uppercase mb-5"
                  style={{ color: tier.isPopular ? 'rgba(196,30,30,0.85)' : 'rgba(237,232,220,0.28)' }}>
                  {tier.name}
                </p>

                {/* Price */}
                <div className="mb-1.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-body text-[10px]" style={{ color: 'rgba(237,232,220,0.28)' }}>from</span>
                    <span
                      className={`font-display italic${tier.isPopular ? ' gradient-text' : ''}`}
                      style={{
                        fontSize: 'clamp(2.4rem,4.2vw,3.8rem)',
                        letterSpacing: '-0.03em', lineHeight: 1,
                        color: tier.isPopular ? undefined : '#EDE8DC',
                      }}>
                      £<NumberFlow
                        value={isRetainer ? tier.retainerPrice : tier.projectPrice}
                        format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                        transformTiming={{ duration: 500, easing: 'ease-out' }}
                        willChange
                      />
                    </span>
                    {isRetainer && (
                      <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.3)' }}>/mo</span>
                    )}
                  </div>
                  <p className="font-body text-[10px] mt-1 tracking-[0.06em]"
                    style={{ color: 'rgba(237,232,220,0.2)' }}>
                    {isRetainer ? 'billed monthly' : 'one-off payment'}
                  </p>
                </div>

                <p className="font-body font-medium text-xs mt-5 mb-1"
                  style={{ color: 'rgba(237,232,220,0.6)' }}>
                  {tier.tagline}
                </p>
                <p className="font-body font-light text-xs leading-relaxed mb-6"
                  style={{ color: 'rgba(237,232,220,0.22)' }}>
                  {tier.description}
                </p>

                <div className="mb-6" style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

                <ul className="flex flex-col gap-3 flex-1 mb-9">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Check size={12} style={{
                        marginTop: 3, flexShrink: 0,
                        color: tier.isPopular ? '#C41E1E' : 'rgba(237,232,220,0.28)',
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
                    padding: '14px 24px', borderRadius: 10,
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
