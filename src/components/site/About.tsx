'use client';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const team = [
  {
    name: 'Ali',
    role: 'Web Designer & Developer',
    bio: 'Designs and builds premium websites from concept to launch. Every project is a chance to make something worth remembering.',
    letter: 'A',
  },
  {
    name: 'Munib',
    role: 'Web Designer & Developer',
    bio: 'Turns briefs into fully coded, animated websites. Detail-obsessed and deadline-reliable — every time.',
    letter: 'M',
  },
  {
    name: 'Nadir',
    role: 'Web Designer & Developer',
    bio: 'Builds sites that perform as well as they look. Clean code, sharp design, and nothing left to chance.',
    letter: 'N',
  },
  {
    name: 'Robbie',
    role: 'Web Designer & Developer',
    bio: 'Crafts the interactions and transitions that make a site feel alive. If it moves well, it converts better.',
    letter: 'R',
  },
  {
    name: 'Mia',
    role: 'Web Designer & Developer',
    bio: 'Brings precision and creativity to every build. From layout to launch, every pixel is intentional.',
    letter: 'Mi',
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
        style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(196,30,30,0.07) 0%, transparent 60%)' }} />

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
                style={{ fontSize: 'clamp(1.6rem,6.5vw,8rem)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#EDE8DC' }}
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
            A tight-knit team of five specialists — no hand-offs, no outsourcing.
            Every project is owned start to finish by the same people.
          </motion.p>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px"
          style={{ background: 'rgba(237,232,220,0.07)' }}>
          {team.map((member, i) => (
            <motion.div
              key={i}
              className="group relative flex flex-col overflow-hidden"
              style={{ background: '#080809', minHeight: 'clamp(280px,30vw,360px)' }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}>

              {/* Large editorial letter — fills the top */}
              <div className="relative flex-1 overflow-hidden flex items-end"
                style={{ padding: 'clamp(20px,2.5vw,28px) clamp(20px,2.5vw,28px) 0' }}>
                <motion.span
                  className="font-display italic select-none pointer-events-none block leading-none"
                  style={{
                    fontSize: 'clamp(5.5rem,9vw,9rem)',
                    letterSpacing: '-0.04em',
                    lineHeight: 0.85,
                    background: 'linear-gradient(160deg, rgba(196,30,30,0.22) 0%, rgba(196,30,30,0.06) 60%, transparent 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    transition: 'all 0.6s ease',
                  }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.5, ease }}>
                  {member.letter}
                </motion.span>

                {/* Hover crimson glow behind letter */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(196,30,30,0.07) 0%, transparent 70%)' }} />
              </div>

              {/* Bottom info panel */}
              <div style={{ padding: 'clamp(16px,2vw,24px) clamp(20px,2.5vw,28px) clamp(24px,2.5vw,32px)' }}>
                {/* Thin rule */}
                <div className="mb-4 h-px" style={{ background: 'rgba(237,232,220,0.07)' }} />

                <p className="font-display italic mb-1"
                  style={{ fontSize: 'clamp(1.1rem,1.8vw,1.55rem)', color: '#EDE8DC', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {member.name}
                </p>
                <p className="font-body text-[9px] tracking-[0.24em] uppercase mb-3"
                  style={{ color: 'rgba(196,30,30,0.65)' }}>
                  {member.role}
                </p>
                <p className="font-body font-light text-xs leading-relaxed"
                  style={{ color: 'rgba(237,232,220,0.28)' }}>
                  {member.bio}
                </p>
              </div>

              {/* Animated left border on hover */}
              <div className="absolute left-0 top-0 w-px h-0 group-hover:h-full transition-all duration-500 pointer-events-none"
                style={{ background: 'rgba(196,30,30,0.5)' }} />
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
