'use client';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const team = [
  {
    name: 'Amir Hassan',
    role: 'Creative Director',
    bio: "Sets the visual direction and ensures every project reaches the standard we promise. Nothing ships without Amir's eye on it.",
    initials: 'AH',
  },
  {
    name: 'Sorcha MacLeod',
    role: 'Lead Developer',
    bio: 'Builds the technical architecture behind every site — performance, animation, and code quality are her obsession.',
    initials: 'SM',
  },
  {
    name: 'Kieran Ó Briain',
    role: 'UX Strategist',
    bio: "Turns business goals into user flows that convert. He's the reason our sites don't just look good — they perform.",
    initials: 'KB',
  },
  {
    name: 'Priya Nair',
    role: 'Brand & Copy',
    bio: 'Crafts the messaging that makes visitors feel something. Every headline, every CTA is precision-engineered for impact.',
    initials: 'PN',
  },
  {
    name: 'Callum Reid',
    role: 'Motion Designer',
    bio: 'Responsible for every transition, scroll reveal, and micro-interaction. If it moves, Callum made it feel right.',
    initials: 'CR',
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden"
      style={{ background: '#080809', padding: 'clamp(100px,12vw,160px) clamp(24px,5vw,88px)' }}
    >
      {/* Top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      {/* Atmospheric glow */}
      <div className="absolute bottom-0 left-0 w-[700px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(196,144,32,0.07) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 mb-20 md:mb-28 items-end">
          <div>
            <motion.div className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="w-8 h-px gradient-bg" />
              <span className="font-body text-[10px] tracking-[0.32em] uppercase"
                style={{ color: 'rgba(237,232,220,0.35)' }}>
                The Team
              </span>
            </motion.div>

            <motion.div className="overflow-hidden"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.h2 className="font-display italic"
                style={{ fontSize: 'clamp(2.8rem,6.5vw,8rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 0.95, ease } } }}>
                Five minds.<br />
                <span className="gradient-text">One standard.</span>
              </motion.h2>
            </motion.div>
          </div>

          <motion.p
            className="font-body font-light text-sm leading-relaxed lg:max-w-xs lg:pb-3"
            style={{ color: 'rgba(237,232,220,0.38)' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            We're a tight-knit team of five specialists who've worked together since the beginning.
            No hand-offs, no outsourcing. Every project is seen through from brief to live by the same people.
          </motion.p>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px"
          style={{ background: 'rgba(237,232,220,0.07)' }}>
          {team.map((member, i) => (
            <motion.div
              key={i}
              className="flex flex-col gap-6"
              style={{ background: '#080809', padding: 'clamp(28px,3.5vw,44px) clamp(20px,2.5vw,32px)' }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}>

              {/* Initials avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(196,144,32,0.1)', border: '1px solid rgba(196,144,32,0.25)' }}>
                  <span className="font-display italic gradient-text"
                    style={{ fontSize: '0.8rem', letterSpacing: '-0.01em' }}>
                    {member.initials}
                  </span>
                </div>
                {/* Index */}
                <span className="font-body text-[10px] tracking-[0.24em]"
                  style={{ color: 'rgba(237,232,220,0.15)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Name + role */}
              <div>
                <p className="font-display italic"
                  style={{ fontSize: 'clamp(1.1rem,1.8vw,1.5rem)', color: '#EDE8DC', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {member.name}
                </p>
                <p className="font-body text-[10px] tracking-[0.22em] uppercase mt-1.5"
                  style={{ color: 'rgba(196,144,32,0.75)' }}>
                  {member.role}
                </p>
              </div>

              {/* Bio */}
              <p className="font-body font-light text-xs leading-relaxed"
                style={{ color: 'rgba(237,232,220,0.32)' }}>
                {member.bio}
              </p>

            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          className="flex items-center gap-6 mt-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}>
          <div className="h-px flex-1" style={{ background: 'rgba(237,232,220,0.06)' }} />
          <p className="font-body font-light text-xs shrink-0" style={{ color: 'rgba(237,232,220,0.22)' }}>
            Edinburgh-based · Remote-capable · Est. 2023
          </p>
          <div className="h-px flex-1" style={{ background: 'rgba(237,232,220,0.06)' }} />
        </motion.div>

      </div>

      {/* Bottom border */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}
