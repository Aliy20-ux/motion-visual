'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import confetti from 'canvas-confetti';
import { Check, Star } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

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
    description: 'For local businesses and new brands ready to compete online.',
    features: [
      'Up to 5 pages — fully custom',
      'No templates. No shortcuts.',
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
    description: 'For hospitality and service brands ready to convert at a higher rate.',
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

/* ── Billing toggle ── */
function BillingToggle({
  isProject, onChange, switchRef,
}: {
  isProject: boolean;
  onChange: (v: boolean) => void;
  switchRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="inline-flex items-center gap-5 rounded-full"
      style={{
        background: 'rgba(237,232,220,0.04)',
        border: '1px solid rgba(237,232,220,0.09)',
        padding: '10px 22px',
      }}>

      <button type="button" onClick={() => onChange(true)}
        className="font-body text-xs cursor-pointer select-none"
        style={{ color: isProject ? '#EDE8DC' : 'rgba(237,232,220,0.32)', background: 'none', border: 'none' }}>
        One-off project
      </button>

      {/* Switch track */}
      <button
        ref={switchRef} type="button" role="switch" aria-checked={!isProject}
        onClick={() => onChange(!isProject)}
        className="relative flex-shrink-0 cursor-pointer"
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none',
          background: isProject ? 'rgba(237,232,220,0.15)' : 'linear-gradient(135deg,#8B1010,#C41E1E)',
          transition: 'background 0.3s',
        }}>
        <motion.span
          style={{
            position: 'absolute', top: 2, width: 20, height: 20,
            borderRadius: '50%', background: '#EDE8DC',
            boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          }}
          animate={{ left: isProject ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      </button>

      <button type="button" onClick={() => onChange(false)}
        className="font-body text-xs cursor-pointer select-none"
        style={{ color: !isProject ? '#EDE8DC' : 'rgba(237,232,220,0.32)', background: 'none', border: 'none' }}>
        Monthly retainer{' '}
        <span style={{ color: '#C41E1E' }}>–30%</span>
      </button>
    </div>
  );
}

/* ── Main ── */
export default function Pricing() {
  const [isProject, setIsProject] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const switchRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setDesktop(mq.matches);
    const h = () => setDesktop(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const handleToggle = (toProject: boolean) => {
    setIsProject(toProject);
    if (!toProject && switchRef.current) {
      const r = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 70, spread: 70,
        origin: {
          x: (r.left + r.width / 2) / window.innerWidth,
          y: (r.top + r.height / 2) / window.innerHeight,
        },
        colors: ['#C41E1E', '#E83838', '#C8C8C8', '#EDE8DC'],
        ticks: 220, gravity: 1.1, decay: 0.92, startVelocity: 28,
      });
    }
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden"
      style={{ background: '#0A0A0B', padding: 'clamp(100px,12vw,160px) clamp(24px,5vw,88px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: 900, height: 600, background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.09) 0%, transparent 62%)' }} />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ─── Header — always visible, no opacity trap ─── */}
        <div className="text-center mb-16">

          {/* Section label */}
          <motion.div className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}>
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'rgba(237,232,220,0.35)' }}>Investment</span>
            <div className="w-8 h-px gradient-bg" />
          </motion.div>

          {/* Headline — always rendered, only fades in */}
          <motion.h2
            className="font-display italic mb-6"
            style={{ fontSize: 'clamp(2.2rem,5.5vw,7rem)', lineHeight: 0.92, letterSpacing: '-0.025em', color: '#EDE8DC' }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.18 }}>
            Clear pricing.<br />
            <span className="gradient-text">No surprises.</span>
          </motion.h2>

          <motion.p
            className="font-body font-light text-sm leading-relaxed mx-auto mb-10"
            style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '44ch' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}>
            One-off project or monthly retainer — toggle to compare.
            Book a free call and we'll confirm your exact number within 24 hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}>
            <BillingToggle isProject={isProject} onChange={handleToggle} switchRef={switchRef} />
          </motion.div>
        </div>

        {/* ─── Cards grid ───
            items-stretch (default) so all three columns are same height.
            The popular card is elevated with a static CSS translateY — no animation fights. ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className="flex flex-col"
              /* Static elevation — popular card sits 16px higher than siblings.
                 No whileInView y-transform so the layout never jumps. */
              style={{
                transform: tier.isPopular && desktop ? 'translateY(-16px)' : 'none',
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: tier.isPopular && desktop ? -16 : 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.65, ease, delay: i * 0.1 }}>

              {/* Card */}
              <div
                className="relative flex flex-col h-full"
                style={{
                  borderRadius: 18,
                  background: tier.isPopular ? 'rgba(196,30,30,0.055)' : 'rgba(237,232,220,0.02)',
                  border: tier.isPopular ? '2px solid rgba(196,30,30,0.4)' : '1px solid rgba(237,232,220,0.08)',
                  boxShadow: tier.isPopular
                    ? '0 0 80px rgba(196,30,30,0.12), 0 20px 60px rgba(0,0,0,0.55)'
                    : '0 4px 24px rgba(0,0,0,0.28)',
                  padding: 'clamp(28px,3.5vw,44px) clamp(22px,2.8vw,34px)',
                }}>

                {/* Top gradient accent */}
                {tier.isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] gradient-bg"
                    style={{ borderRadius: '18px 18px 0 0' }} />
                )}

                {/* Most Popular badge — inside the card, top */}
                {tier.isPopular ? (
                  <div className="flex justify-between items-center mb-6">
                    <p className="font-body text-[10px] tracking-[0.32em] uppercase"
                      style={{ color: 'rgba(196,30,30,0.85)' }}>
                      {tier.name}
                    </p>
                    <div className="inline-flex items-center gap-1.5 gradient-bg rounded-full px-3 py-1">
                      <Star size={9} style={{ color: '#F0EDED', fill: '#F0EDED' }} />
                      <span className="font-body text-[9px] tracking-[0.2em] uppercase font-semibold"
                        style={{ color: '#F0EDED' }}>Popular</span>
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-[10px] tracking-[0.32em] uppercase mb-6"
                    style={{ color: 'rgba(237,232,220,0.28)' }}>
                    {tier.name}
                  </p>
                )}

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-body text-[10px]" style={{ color: 'rgba(237,232,220,0.28)' }}>from</span>
                    <span
                      className={`font-display italic ${tier.isPopular ? 'gradient-text' : ''}`}
                      style={{
                        fontSize: 'clamp(2.4rem,4.5vw,3.8rem)',
                        letterSpacing: '-0.03em', lineHeight: 1,
                        color: tier.isPopular ? undefined : '#EDE8DC',
                      }}>
                      £<NumberFlow
                        value={isProject ? tier.projectPrice : tier.retainerPrice}
                        format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                        transformTiming={{ duration: 500, easing: 'ease-out' }}
                        willChange
                      />
                    </span>
                    {!isProject && (
                      <span className="font-body text-xs font-light" style={{ color: 'rgba(237,232,220,0.3)' }}>/mo</span>
                    )}
                  </div>
                  <p className="font-body text-[10px] mt-1 tracking-[0.06em]"
                    style={{ color: 'rgba(237,232,220,0.2)' }}>
                    {isProject ? 'ONE-OFF PAYMENT' : 'BILLED MONTHLY'}
                  </p>
                </div>

                <p className="font-body font-medium text-xs mb-1" style={{ color: 'rgba(237,232,220,0.6)' }}>
                  {tier.tagline}
                </p>
                <p className="font-body font-light text-xs leading-relaxed mb-7" style={{ color: 'rgba(237,232,220,0.22)' }}>
                  {tier.description}
                </p>

                <div className="mb-7" style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

                <ul className="flex flex-col gap-3 flex-1 mb-10">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check size={12}
                        style={{ marginTop: 3, flexShrink: 0, color: tier.isPopular ? '#C41E1E' : 'rgba(237,232,220,0.28)' }} />
                      <span className="font-body font-light text-xs leading-relaxed"
                        style={{ color: 'rgba(237,232,220,0.5)' }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <a href="#quote"
                  className="inline-flex items-center justify-center font-body text-xs font-semibold cursor-pointer transition-opacity duration-200 hover:opacity-85"
                  style={{
                    padding: '14px 24px',
                    borderRadius: 10,
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
        <p className="text-center font-body font-light text-xs mt-14"
          style={{ color: 'rgba(237,232,220,0.18)' }}>
          All projects include hosting, domain config &amp; 30 days post-launch support.
          Payment split across milestones — never 100% upfront.
        </p>

      </div>
    </section>
  );
}
