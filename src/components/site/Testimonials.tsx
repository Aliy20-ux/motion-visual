'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const testimonials = [
  {
    quote: 'Motion Visual didn\'t just build us a website — they built us a brand statement. Our bookings went up 40% in the first month.',
    name: 'James Thornton',
    title: 'Owner, Thomas J Walls Coffee',
    initials: 'JT',
    stat: '+40%',
    statLabel: 'bookings in month one',
  },
  {
    quote: 'Every single detail was considered. The animations, the typography, the way it loads — it feels like the most expensive site we\'ve ever seen. And it converts.',
    name: 'Priya Kaur',
    title: 'Director, Texture Lounge',
    initials: 'PK',
    stat: '3×',
    statLabel: 'increase in enquiries',
  },
  {
    quote: 'They delivered in 12 days. Our previous agency took 4 months and the result wasn\'t half as good. Motion Visual are on another level entirely.',
    name: 'Marcus Reid',
    title: 'GM, CHE Edinburgh',
    initials: 'MR',
    stat: '12',
    statLabel: 'days from brief to live',
  },
  {
    quote: 'The site has become a selling point for us. Clients mention it before they even talk about price. That\'s the power of premium design.',
    name: 'Amir Hassan',
    title: 'Founder, S2 Studio Cuts',
    initials: 'AH',
    stat: '98%',
    statLabel: 'client satisfaction score',
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(i => (i + 1) % testimonials.length);
  const t = testimonials[current];

  return (
    <section className="relative overflow-hidden" style={{ background: '#080809' }}>
      <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(196,144,32,0.06) 0%, transparent 70%)' }} />

      <div style={{ padding: 'clamp(80px,11vw,150px) clamp(24px,5vw,88px)' }}>
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <motion.div className="flex items-center justify-between mb-16 md:mb-20"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-px gradient-bg" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(237,232,220,0.35)' }}>Client Stories</span>
            </div>
            <span className="font-body text-[10px] tracking-[0.18em] uppercase" style={{ color: 'rgba(237,232,220,0.15)' }}>
              {String(current + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
          </motion.div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20 items-start">

            {/* Quote column */}
            <div className="relative" style={{ minHeight: 340 }}>
              <AnimatePresence mode="wait">
                <motion.div key={current}
                  initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.65, ease }}>

                  {/* Opening quote */}
                  <div className="font-display italic gradient-text select-none mb-6"
                    style={{ fontSize: 'clamp(5rem,10vw,9rem)', lineHeight: 0.85, opacity: 0.28 }} aria-hidden>
                    "
                  </div>

                  <blockquote className="font-display italic"
                    style={{ fontSize: 'clamp(1.6rem,3.2vw,3.4rem)', lineHeight: 1.15, letterSpacing: '-0.022em', color: '#EDE8DC', maxWidth: 900 }}>
                    {t.quote}
                  </blockquote>

                  {/* Attribution */}
                  <div className="flex items-center gap-5 mt-12">
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center shrink-0">
                      <span className="font-body text-xs font-semibold text-white">{t.initials}</span>
                    </div>
                    <div>
                      <p className="font-body font-medium text-sm" style={{ color: '#EDE8DC' }}>{t.name}</p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(237,232,220,0.38)' }}>{t.title}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: stat + controls */}
            <div className="flex flex-col gap-8">
              {/* Stat card */}
              <AnimatePresence mode="wait">
                <motion.div key={current} className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(237,232,220,0.09)', background: 'rgba(237,232,220,0.03)', padding: 'clamp(28px,3vw,40px)' }}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease }}>
                  <p className="font-display italic gradient-text"
                    style={{ fontSize: 'clamp(3rem,5.5vw,5.5rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {t.stat}
                  </p>
                  <p className="font-body text-xs leading-relaxed mt-2" style={{ color: 'rgba(237,232,220,0.38)' }}>
                    {t.statLabel}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex flex-col gap-5">
                {/* Progress dots */}
                <div className="flex items-center gap-2">
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} aria-label={`Testimonial ${i + 1}`}
                      className="transition-all duration-400 cursor-pointer"
                      style={{ height: 3, borderRadius: 2, background: i === current ? 'linear-gradient(135deg,#B07810,#E8C050)' : 'rgba(237,232,220,0.15)', width: i === current ? 28 : 8 }} />
                  ))}
                </div>

                {/* Arrow controls */}
                <div className="flex items-center gap-3">
                  <button onClick={prev}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white/8 cursor-pointer"
                    style={{ border: '1px solid rgba(237,232,220,0.1)' }} aria-label="Previous">
                    <ArrowUpRight size={14} style={{ color: 'rgba(237,232,220,0.45)', transform: 'rotate(225deg)' }} />
                  </button>
                  <button onClick={next}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white/8 cursor-pointer"
                    style={{ border: '1px solid rgba(237,232,220,0.1)' }} aria-label="Next">
                    <ArrowUpRight size={14} style={{ color: 'rgba(237,232,220,0.45)' }} />
                  </button>
                  <span className="font-body text-xs ml-1" style={{ color: 'rgba(237,232,220,0.2)' }}>Edinburgh, Scotland</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}
