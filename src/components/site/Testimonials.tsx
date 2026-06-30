'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: 'Motion Visual didn\'t just build us a website — they built us a brand statement. Our bookings went up 40% in the first month. Edinburgh\'s finest.',
    name: 'James Thornton',
    title: 'Owner, Thomas J Walls Coffee',
    initials: 'JT',
  },
  {
    quote: 'Every single detail was considered. The animations, the typography, the way it loads — it feels like the most expensive site we\'ve ever seen. And it converts.',
    name: 'Priya Kaur',
    title: 'Director, Texture Lounge',
    initials: 'PK',
  },
  {
    quote: 'They delivered in 12 days. Twelve. Our previous agency took 4 months and the result wasn\'t half as good. Motion Visual are on another level.',
    name: 'Marcus Reid',
    title: 'GM, CHE Edinburgh',
    initials: 'MR',
  },
  {
    quote: 'The site has genuinely become a selling point for us. Clients mention it before they even talk about price. That\'s the power of premium design.',
    name: 'Amir Hassan',
    title: 'Founder, S2 Studio Cuts',
    initials: 'AH',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(i => (i + 1) % testimonials.length);

  return (
    <section className="relative overflow-hidden" style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)' }}>
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)' }} />

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex items-center gap-4 mb-12"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-px gradient-bg" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>Testimonials</span>
        </motion.div>

        <div className="relative min-h-[280px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
              className="w-full"
            >
              {/* Quote mark */}
              <div className="font-display italic gradient-text mb-6" style={{ fontSize: '5rem', lineHeight: 1, opacity: 0.4 }}>"</div>

              <blockquote
                className="font-display italic mb-10"
                style={{ fontSize: 'clamp(1.5rem,3.5vw,3rem)', lineHeight: 1.15, letterSpacing: '-0.02em', color: '#F4F1EC' }}
              >
                {testimonials[current].quote}
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                  <span className="font-body text-xs font-medium text-white">{testimonials[current].initials}</span>
                </div>
                <div>
                  <p className="font-body font-medium text-sm" style={{ color: '#F4F1EC' }}>{testimonials[current].name}</p>
                  <p className="font-body text-xs" style={{ color: 'rgba(244,241,236,0.4)' }}>{testimonials[current].title}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-12">
          <button onClick={prev} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Previous">
            <ChevronLeft size={16} style={{ color: 'rgba(244,241,236,0.6)' }} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300"
                style={{
                  width: i === current ? 24 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === current ? '#7C3AED' : 'rgba(244,241,236,0.2)',
                }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Next">
            <ChevronRight size={16} style={{ color: 'rgba(244,241,236,0.6)' }} />
          </button>
        </div>
      </div>
    </section>
  );
}
