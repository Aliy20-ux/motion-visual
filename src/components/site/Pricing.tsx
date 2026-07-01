'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import confetti from 'canvas-confetti';
import { Check, Star } from 'lucide-react';

const spring = { type: 'spring' as const, stiffness: 90, damping: 28, delay: 0.35 };
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

/* ── Toggle ── */
function BillingToggle({
  isProject, onChange, switchRef,
}: {
  isProject: boolean;
  onChange: (v: boolean) => void;
  switchRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="inline-flex items-center gap-4 rounded-full"
      style={{
        background: 'rgba(237,232,220,0.04)',
        border: '1px solid rgba(237,232,220,0.08)',
        padding: '10px 20px',
      }}>
      <span
        className="font-body text-xs cursor-pointer select-none transition-colors duration-200"
        style={{ color: isProject ? '#EDE8DC' : 'rgba(237,232,220,0.3)' }}
        onClick={() => onChange(true)}>
        One-off project
      </span>

      <button
        ref={switchRef}
        type="button"
        role="switch"
        aria-checked={!isProject}
        onClick={() => onChange(!isProject)}
        className="relative flex-shrink-0 cursor-pointer"
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: isProject ? 'rgba(237,232,220,0.14)' : 'linear-gradient(135deg,#8B1010,#C41E1E)',
          border: 'none',
          transition: 'background 0.35s ease',
        }}>
        <motion.div
          style={{
            position: 'absolute', top: 2, width: 20, height: 20,
            borderRadius: '50%', background: '#EDE8DC', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
          animate={{ left: isProject ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      </button>

      <span
        className="font-body text-xs cursor-pointer select-none transition-colors duration-200"
        style={{ color: !isProject ? '#EDE8DC' : 'rgba(237,232,220,0.3)' }}
        onClick={() => onChange(false)}>
        Monthly retainer
        <span style={{ color: '#C41E1E', marginLeft: 5 }}>Save 30%</span>
      </span>
    </div>
  );
}

/* ── Main ── */
export default function Pricing() {
  const [isProject, setIsProject] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const switchRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const h = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const handleToggle = (toProject: boolean) => {
    setIsProject(toProject);
    if (!toProject && switchRef.current) {
      const r = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: {
          x: (r.left + r.width / 2) / window.innerWidth,
          y: (r.top + r.height / 2) / window.innerHeight,
        },
        colors: ['#C41E1E', '#E83838', '#C8C8C8', '#EDE8DC', '#8B1010'],
        ticks: 220,
        gravity: 1.1,
        decay: 0.92,
        startVelocity: 28,
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
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Centred glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 800, height: 600,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(196,30,30,0.1) 0%, transparent 65%)',
        }} />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Header — fully visible, no clip animation ── */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease }}>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'rgba(237,232,220,0.35)' }}>
              Investment
            </span>
            <div className="w-8 h-px gradient-bg" />
          </div>

          <h2 className="font-display italic mb-6"
            style={{ fontSize: 'clamp(2rem,6.5vw,8rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}>
            Clear pricing.<br />
            <span className="gradient-text">No surprises.</span>
          </h2>

          <p className="font-body font-light text-sm leading-relaxed mx-auto mb-10"
            style={{ color: 'rgba(237,232,220,0.38)', maxWidth: '46ch' }}>
            One-off project or an ongoing monthly retainer — toggle to compare.
            Book a free call and we'll confirm your exact number within 24 hours.
          </p>

          <BillingToggle isProject={isProject} onChange={handleToggle} switchRef={switchRef} />
        </motion.div>

        {/* ── Cards ──
            pt-8 gives headroom so the elevated Signature card doesn't clip into the header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 items-end">
          {tiers.map((tier, i) => {
            const isOuter = i === 0 || i === 2;
            return (
              <motion.div
                key={tier.name}
                className="relative flex flex-col"
                style={{ borderRadius: 20 }}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{
                  opacity: 1,
                  y: tier.isPopular ? -20 : 0,
                  scale: isOuter && isDesktop ? 0.94 : 1,
                }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ ...spring, delay: 0.25 + i * 0.1 }}>

                {/* Card shell */}
                <div
                  className="relative flex flex-col h-full"
                  style={{
                    borderRadius: 20,
                    background: tier.isPopular
                      ? 'rgba(196,30,30,0.06)'
                      : 'rgba(237,232,220,0.025)',
                    border: tier.isPopular
                      ? '2px solid rgba(196,30,30,0.42)'
                      : '1px solid rgba(237,232,220,0.09)',
                    padding: 'clamp(32px,3.5vw,48px) clamp(24px,3vw,36px)',
                    // Crimson glow on popular
                    boxShadow: tier.isPopular
                      ? '0 0 60px rgba(196,30,30,0.14), 0 24px 60px rgba(0,0,0,0.5)'
                      : '0 8px 32px rgba(0,0,0,0.3)',
                  }}>

                  {/* Top gradient line */}
                  {tier.isPopular && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] gradient-bg"
                      style={{ borderRadius: '20px 20px 0 0' }} />
                  )}

                  {/* Popular badge */}
                  {tier.isPopular && (
                    <div className="absolute top-0 right-5 -translate-y-1/2">
                      <div className="inline-flex items-center gap-1.5 rounded-full gradient-bg px-4 py-1.5">
                        <Star size={10} style={{ color: '#F0EDED', fill: '#F0EDED' }} />
                        <span className="font-body text-[10px] tracking-[0.2em] uppercase font-semibold"
                          style={{ color: '#F0EDED' }}>
                          Most Popular
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tier name */}
                  <p className="font-body text-[10px] tracking-[0.32em] uppercase mb-6"
                    style={{ color: tier.isPopular ? 'rgba(196,30,30,0.85)' : 'rgba(237,232,220,0.28)' }}>
                    {tier.name}
                  </p>

                  {/* Price */}
                  <div className="mb-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-body text-[10px] tracking-wide"
                        style={{ color: 'rgba(237,232,220,0.28)' }}>from</span>
                      <span
                        className={`font-display italic ${tier.isPopular ? 'gradient-text' : ''}`}
                        style={{
                          fontSize: 'clamp(2.6rem,4.8vw,4.2rem)',
                          letterSpacing: '-0.03em',
                          lineHeight: 1,
                          color: tier.isPopular ? undefined : '#EDE8DC',
                        }}>
                        £<NumberFlow
                          value={isProject ? tier.projectPrice : tier.retainerPrice}
                          format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                          transformTiming={{ duration: 550, easing: 'ease-out' }}
                          willChange
                        />
                      </span>
                      {!isProject && (
                        <span className="font-body text-sm font-light"
                          style={{ color: 'rgba(237,232,220,0.3)' }}>
                          /mo
                        </span>
                      )}
                    </div>
                    <p className="font-body text-[10px] mt-1"
                      style={{ color: 'rgba(237,232,220,0.22)', letterSpacing: '0.06em' }}>
                      {isProject ? 'ONE-OFF PAYMENT' : 'BILLED MONTHLY'}
                    </p>
                  </div>

                  {/* Tagline */}
                  <p className="font-body font-medium text-xs mt-5 mb-1"
                    style={{ color: 'rgba(237,232,220,0.6)' }}>
                    {tier.tagline}
                  </p>
                  <p className="font-body font-light text-xs leading-relaxed mb-7"
                    style={{ color: 'rgba(237,232,220,0.22)' }}>
                    {tier.description}
                  </p>

                  {/* Divider */}
                  <div className="mb-7" style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

                  {/* Features */}
                  <ul className="flex flex-col gap-3.5 flex-1 mb-10">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check
                          size={13}
                          style={{
                            marginTop: 2,
                            flexShrink: 0,
                            color: tier.isPopular ? '#C41E1E' : 'rgba(237,232,220,0.3)',
                          }}
                        />
                        <span className="font-body font-light text-xs leading-relaxed"
                          style={{ color: 'rgba(237,232,220,0.52)' }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href="#quote"
                    className="inline-flex items-center justify-center gap-2 font-body text-xs font-semibold cursor-pointer transition-all duration-200 hover:opacity-90"
                    style={{
                      padding: '15px 28px',
                      borderRadius: 12,
                      background: tier.isPopular
                        ? 'linear-gradient(135deg,#8B1010,#C41E1E)'
                        : 'transparent',
                      color: tier.isPopular ? '#F0EDED' : 'rgba(237,232,220,0.55)',
                      border: tier.isPopular ? 'none' : '1px solid rgba(237,232,220,0.13)',
                      letterSpacing: '0.04em',
                    }}>
                    {tier.cta}
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance */}
        <motion.p
          className="text-center font-body font-light text-xs mt-16"
          style={{ color: 'rgba(237,232,220,0.18)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}>
          All projects include hosting setup, domain configuration, and 30 days post-launch support.<br className="hidden md:block" />
          Payment split across project milestones — never 100% upfront.
        </motion.p>

      </div>
    </section>
  );
}
