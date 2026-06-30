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
    <section
      className="relative overflow-hidden"
      style={{ padding: 'clamp(80px,12vw,160px) clamp(20px,5vw,80px)' }}
    >
      {/* Background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <motion.div
          className="flex items-center justify-between mb-16 md:mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>
              Client Stories
            </span>
          </div>
          <span
            className="font-body text-[10px] tracking-[0.15em] uppercase"
            style={{ color: 'rgba(244,241,236,0.15)' }}
          >
            {String(current + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-start">
          {/* Quote column */}
          <div className="relative min-h-[320px] md:min-h-[260px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.65, ease }}
              >
                {/* Opening quote mark */}
                <div
                  className="font-display italic gradient-text mb-6 select-none"
                  style={{ fontSize: 'clamp(4rem,8vw,8rem)', lineHeight: 1, opacity: 0.35 }}
                  aria-hidden
                >
                  "
                </div>

                <blockquote
                  className="font-display italic"
                  style={{
                    fontSize: 'clamp(1.6rem,3.5vw,3.2rem)',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    color: '#F4F1EC',
                  }}
                >
                  {t.quote}
                </blockquote>

                {/* Attribution */}
                <div className="flex items-center gap-5 mt-10">
                  <div className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center shrink-0">
                    <span className="font-body text-xs font-semibold text-white">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-body font-medium text-sm" style={{ color: '#F4F1EC' }}>
                      {t.name}
                    </p>
                    <p className="font-body text-xs mt-0.5" style={{ color: 'rgba(244,241,236,0.4)' }}>
                      {t.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right column: stat + controls */}
          <div className="flex flex-col gap-10">
            {/* Stat card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                className="glass rounded-2xl p-8"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease }}
              >
                <p
                  className="font-display italic gradient-text"
                  style={{ fontSize: 'clamp(3rem,5vw,5rem)', letterSpacing: '-0.03em', lineHeight: 1 }}
                >
                  {t.stat}
                </p>
                <p
                  className="font-body text-xs leading-relaxed mt-2"
                  style={{ color: 'rgba(244,241,236,0.4)' }}
                >
                  {t.statLabel}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex flex-col gap-6">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Testimonial ${i + 1}`}
                    className="transition-all duration-400"
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: i === current
                        ? 'linear-gradient(135deg,#7C3AED,#06B6D4)'
                        : 'rgba(244,241,236,0.15)',
                      width: i === current ? 28 : 8,
                    }}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prev}
                  className="w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Previous"
                >
                  <ArrowUpRight
                    size={14}
                    style={{ color: 'rgba(244,241,236,0.5)', transform: 'rotate(225deg)' }}
                  />
                </button>
                <button
                  onClick={next}
                  className="w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Next"
                >
                  <ArrowUpRight size={14} style={{ color: 'rgba(244,241,236,0.5)' }} />
                </button>
                <span className="font-body text-xs ml-2" style={{ color: 'rgba(244,241,236,0.25)' }}>
                  Edinburgh, Scotland
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
