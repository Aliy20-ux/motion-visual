'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import confetti from 'canvas-confetti';
import { Check, Star } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Pricing data ── */
interface PricingTier {
  name: string;
  projectPrice: number;
  retainerPrice: number;
  tagline: string;
  description: string;
  features: string[];
  cta: string;
  isPopular: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Essential',
    projectPrice: 3995,
    retainerPrice: 895,
    tagline: 'A serious site for a serious business.',
    description: 'Perfect for local businesses and new brands ready to compete online.',
    features: [
      'Up to 5 pages — fully custom',
      'No templates, no shortcuts',
      'Mobile-first, fully responsive',
      'On-page SEO + Google Analytics',
      'Contact form & lead capture',
      '14-day delivery guarantee',
    ],
    cta: 'Start Essential',
    isPopular: false,
  },
  {
    name: 'Signature',
    projectPrice: 7500,
    retainerPrice: 1795,
    tagline: 'The full Motion Visual experience.',
    description: 'Ideal for hospitality and service brands ready to convert at a higher rate.',
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
    isPopular: true,
  },
  {
    name: 'Flagship',
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

/* ── Animated toggle ── */
function BillingToggle({
  isProject,
  onChange,
  switchRef,
}: {
  isProject: boolean;
  onChange: (v: boolean) => void;
  switchRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className="font-body text-xs tracking-wide cursor-pointer select-none"
        style={{ color: isProject ? '#EDE8DC' : 'rgba(237,232,220,0.35)' }}
        onClick={() => onChange(true)}>
        One-off project
      </span>

      {/* Track */}
      <button
        ref={switchRef}
        type="button"
        role="switch"
        aria-checked={!isProject}
        onClick={() => onChange(!isProject)}
        className="relative cursor-pointer"
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: isProject ? 'rgba(237,232,220,0.12)' : 'linear-gradient(135deg,#8B1010,#C41E1E)',
          border: 'none',
          flexShrink: 0,
          transition: 'background 0.35s',
        }}>
        <motion.div
          style={{
            position: 'absolute', top: 2, width: 20, height: 20,
            borderRadius: '50%', background: '#F0EDED',
          }}
          animate={{ left: isProject ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </button>

      <span
        className="font-body text-xs tracking-wide cursor-pointer select-none"
        style={{ color: !isProject ? '#EDE8DC' : 'rgba(237,232,220,0.35)' }}
        onClick={() => onChange(false)}>
        Monthly retainer{' '}
        <span style={{ color: '#C41E1E' }}>Save 30%</span>
      </span>
    </div>
  );
}

/* ── Main component ── */
export default function Pricing() {
  const [isProject, setIsProject] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const switchRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleToggle = (toProject: boolean) => {
    setIsProject(toProject);
    if (!toProject && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 65,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#C41E1E', '#E83838', '#C8C8C8', '#EDE8DC'],
        ticks: 220,
        gravity: 1.2,
        decay: 0.93,
        startVelocity: 30,
        shapes: ['circle'],
      });
    }
  };

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
        <div className="text-center mb-14 md:mb-16">
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

          <div className="overflow-hidden mb-6">
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
            className="font-body font-light text-sm leading-relaxed mx-auto mb-10"
            style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '46ch' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            One-off project price or an ongoing monthly retainer — toggle to compare. Book a free call and we'll give you an exact number within 24 hours.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4 }}>
            <BillingToggle isProject={isProject} onChange={handleToggle} switchRef={switchRef} />
          </motion.div>
        </div>

        {/* ── Tier cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-center md:px-0">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className="relative flex flex-col"
              style={{
                borderRadius: 20,
                background: tier.isPopular ? 'rgba(196,30,30,0.05)' : 'rgba(237,232,220,0.025)',
                border: tier.isPopular
                  ? '2px solid rgba(196,30,30,0.45)'
                  : '1px solid rgba(237,232,220,0.09)',
                padding: tier.isPopular
                  ? 'clamp(40px,4vw,56px) clamp(28px,3vw,40px)'
                  : 'clamp(32px,3.5vw,48px) clamp(24px,2.5vw,36px)',
                zIndex: tier.isPopular ? 10 : 0,
                marginTop: tier.isPopular ? 0 : isDesktop ? 20 : 0,
              }}
              initial={{ y: 50, opacity: 0 }}
              whileInView={
                isDesktop
                  ? {
                      y: tier.isPopular ? -20 : 0,
                      opacity: 1,
                      x: i === 2 ? -16 : i === 0 ? 16 : 0,
                      scale: i === 0 || i === 2 ? 0.95 : 1.0,
                    }
                  : { y: 0, opacity: 1 }
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.5,
                type: 'spring',
                stiffness: 100,
                damping: 30,
                delay: 0.3 + i * 0.08,
              }}>

              {/* Top gradient line for popular */}
              {tier.isPopular && (
                <div className="absolute top-0 left-0 right-0 h-[2px] gradient-bg"
                  style={{ borderRadius: '20px 20px 0 0' }} />
              )}

              {/* Popular badge */}
              {tier.isPopular && (
                <div className="absolute top-0 right-0"
                  style={{
                    background: 'linear-gradient(135deg,#8B1010,#C41E1E)',
                    padding: '5px 14px 5px 10px',
                    borderRadius: '0 18px 0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Star size={11} style={{ color: '#F0EDED', fill: '#F0EDED' }} />
                  <span className="font-body text-[10px] tracking-[0.18em] uppercase font-semibold"
                    style={{ color: '#F0EDED' }}>
                    Popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p className="font-body text-[10px] tracking-[0.32em] uppercase mb-5"
                style={{ color: tier.isPopular ? 'rgba(196,30,30,0.9)' : 'rgba(237,232,220,0.32)' }}>
                {tier.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-body text-[10px] tracking-wide"
                  style={{ color: 'rgba(237,232,220,0.28)' }}>from</span>
                <span
                  className={`font-display italic ${tier.isPopular ? 'gradient-text' : ''}`}
                  style={{
                    fontSize: 'clamp(2.4rem,4.5vw,3.8rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    color: tier.isPopular ? undefined : '#EDE8DC',
                  }}>
                  £<NumberFlow
                    value={isProject ? tier.projectPrice : tier.retainerPrice}
                    format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                    transformTiming={{ duration: 600, easing: 'ease-out' }}
                    willChange
                  />
                </span>
                {!isProject && (
                  <span className="font-body text-xs"
                    style={{ color: 'rgba(237,232,220,0.3)', letterSpacing: '0.02em' }}>
                    /mo
                  </span>
                )}
              </div>

              <p className="font-body text-[10px] mb-4"
                style={{ color: 'rgba(237,232,220,0.25)' }}>
                {isProject ? 'one-off payment' : 'billed monthly'}
              </p>

              <p className="font-body font-medium text-xs mb-1.5"
                style={{ color: 'rgba(237,232,220,0.55)' }}>
                {tier.tagline}
              </p>
              <p className="font-body font-light text-xs leading-relaxed mb-7"
                style={{ color: 'rgba(237,232,220,0.22)' }}>
                {tier.description}
              </p>

              {/* Divider */}
              <div className="mb-7" style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1 mb-10">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check
                      size={13}
                      style={{
                        color: tier.isPopular ? '#C41E1E' : 'rgba(237,232,220,0.35)',
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
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
                className="inline-flex items-center justify-center gap-2 rounded-full font-body text-xs font-semibold cursor-pointer transition-all duration-200"
                style={{
                  padding: '15px 28px',
                  background: tier.isPopular ? 'linear-gradient(135deg,#8B1010,#C41E1E)' : 'transparent',
                  color: tier.isPopular ? '#F0EDED' : 'rgba(237,232,220,0.6)',
                  border: tier.isPopular ? 'none' : '1px solid rgba(237,232,220,0.14)',
                }}>
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Reassurance */}
        <motion.p
          className="text-center font-body font-light text-xs mt-14"
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
