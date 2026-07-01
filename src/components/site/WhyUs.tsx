'use client';
import { motion } from 'motion/react';
import { PenTool, Code2, Film, TrendingUp, Target, Shield } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const services = [
  {
    num: '01',
    Icon: PenTool,
    title: 'Bespoke Design',
    body: 'Every pixel handcrafted. No templates, no shortcuts. Pure, original design built around your brand DNA.',
  },
  {
    num: '02',
    Icon: Code2,
    title: 'Custom Development',
    body: 'Clean, performant code engineered from scratch. Every interaction, animation, and transition built by hand.',
  },
  {
    num: '03',
    Icon: Film,
    title: 'Cinematic Animation',
    body: 'Scroll-driven narratives, micro-interactions, and transitions that make your brand feel alive.',
  },
  {
    num: '04',
    Icon: TrendingUp,
    title: 'SEO & Performance',
    body: 'Core Web Vitals A+. Lightning-fast load times. Structured data and local SEO that puts you on the map.',
  },
  {
    num: '05',
    Icon: Target,
    title: 'Conversion Strategy',
    body: 'Every layout decision is engineered around psychology, user flow, and measurable outcomes.',
  },
  {
    num: '06',
    Icon: Shield,
    title: 'Enterprise Security',
    body: 'SSL, DDoS protection, secure form handling, and Cloudflare Enterprise delivery on every site.',
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="relative"
      style={{ background: '#080809', padding: 'clamp(80px,11vw,150px) clamp(24px,5vw,88px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Atmospheric glow */}
      <div className="absolute bottom-0 right-0 w-[700px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(196,30,30,0.07) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 xl:gap-24 items-start">

          {/* ── Left: Headline ── */}
          <div className="lg:sticky lg:top-28">
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="w-8 h-px gradient-bg" />
              <span className="font-body text-[10px] tracking-[0.32em] uppercase"
                style={{ color: 'rgba(237,232,220,0.35)' }}>Services</span>
            </motion.div>

            <div className="overflow-hidden mb-8">
              <motion.h2
                className="font-display italic"
                style={{ fontSize: 'clamp(2rem,5.5vw,7rem)', lineHeight: 0.92, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                initial={{ y: '110%' }} whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.95, ease }}>
                The architecture<br />
                behind every<br />
                <span className="gradient-text">build.</span>
              </motion.h2>
            </div>

            <motion.p
              className="font-body font-light text-sm leading-relaxed"
              style={{ color: 'rgba(237,232,220,0.4)', maxWidth: '36ch' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}>
              We don't compete on price. We compete on outcomes. Every project is a bespoke engineering
              effort — designed, built, and optimised to outperform.
            </motion.p>
          </div>

          {/* ── Right: 2×3 service card grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px"
            style={{ background: 'rgba(237,232,220,0.07)' }}>
            {services.map((svc, i) => (
              <motion.div
                key={svc.num}
                className="group relative flex flex-col overflow-hidden"
                style={{ background: '#080809', padding: 'clamp(28px,3vw,40px)', minHeight: 220 }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, ease, delay: i * 0.06 }}>

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(196,30,30,0.08) 0%, transparent 65%)' }} />

                {/* Animated left border */}
                <div className="absolute left-0 top-0 w-px h-0 group-hover:h-full transition-all duration-500 pointer-events-none"
                  style={{ background: '#C41E1E' }} />

                {/* Icon + number row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(196,30,30,0.1)', border: '1px solid rgba(196,30,30,0.18)' }}>
                    <svc.Icon size={16} style={{ color: 'rgba(196,30,30,0.8)' }} />
                  </div>
                  <span className="font-body text-[11px] tracking-[0.2em]"
                    style={{ color: 'rgba(237,232,220,0.12)' }}>{svc.num}</span>
                </div>

                {/* Title */}
                <h3 className="font-display italic mb-3"
                  style={{ fontSize: 'clamp(1.1rem,1.8vw,1.5rem)', color: '#EDE8DC', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {svc.title}
                </h3>

                {/* Body */}
                <p className="font-body font-light text-xs leading-relaxed"
                  style={{ color: 'rgba(237,232,220,0.38)' }}>
                  {svc.body}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}
