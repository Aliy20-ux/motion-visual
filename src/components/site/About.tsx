'use client';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const team = [
  {
    name: 'Ali',
    role: 'Web Designer & Developer',
    bio: 'Designs and builds premium websites from concept to launch.',
    letter: 'A',
  },
  {
    name: 'Munib',
    role: 'Web Designer & Developer',
    bio: 'Turns briefs into fully coded, animated websites.',
    letter: 'M',
  },
  {
    name: 'Nadir',
    role: 'Web Designer & Developer',
    bio: 'Builds sites that perform as well as they look.',
    letter: 'N',
  },
  {
    name: 'Robbie',
    role: 'Web Designer & Developer',
    bio: 'Crafts the interactions and transitions that make a site feel alive.',
    letter: 'R',
  },
  {
    name: 'Mia',
    role: 'Web Designer & Developer',
    bio: 'Brings precision and creativity to every build.',
    letter: 'M',
  },
];

const badges = ['No Contractors', 'No Outsourcing', 'Every Project Built In-House'];

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden"
      style={{ background: '#080809', padding: 'clamp(80px,11vw,150px) clamp(24px,5vw,88px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />

      <div className="absolute bottom-0 left-0 w-[700px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(196,30,30,0.09) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* ── Centered header — animate (not whileInView) so it's never invisible ── */}
        <div className="text-center mb-16 md:mb-20">

          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}>
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.32em] uppercase"
              style={{ color: 'rgba(237,232,220,0.35)' }}>The Team</span>
            <div className="w-8 h-px gradient-bg" />
          </motion.div>

          {/* Headline — NO overflow-hidden, NO y:'110%', uses animate not whileInView */}
          <motion.h2
            className="font-display italic mb-6"
            style={{ fontSize: 'clamp(2.4rem,6vw,7.5rem)', lineHeight: 0.9, letterSpacing: '-0.025em' }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.1 }}>
            <span style={{ color: '#EDE8DC' }}>Five minds. </span>
            <span className="gradient-text">One standard.</span>
          </motion.h2>

          <motion.p
            className="font-body font-light text-sm leading-relaxed mx-auto"
            style={{ color: 'rgba(237,232,220,0.4)', maxWidth: '52ch' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.22 }}>
            A tight-knit team of five specialists — no hand-offs, no outsourcing.
            Every project is owned start to finish.
          </motion.p>
        </div>

        {/* ── Team cards — 5 columns ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-10 mb-14">
          {team.map((member, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.6, ease, delay: i * 0.07 }}>

              {/* Circle avatar */}
              <div
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center mb-5"
                style={{
                  background: 'rgba(237,232,220,0.06)',
                  border: '1px solid rgba(237,232,220,0.1)',
                }}>
                <span className="font-display italic"
                  style={{ fontSize: '2.2rem', letterSpacing: '-0.04em', color: 'rgba(237,232,220,0.65)' }}>
                  {member.letter}
                </span>
              </div>

              <p className="font-display italic mb-1.5"
                style={{ fontSize: 'clamp(1rem,1.5vw,1.35rem)', color: '#EDE8DC', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {member.name}
              </p>

              <p className="font-body text-[9px] tracking-[0.22em] uppercase mb-3"
                style={{ color: 'rgba(196,30,30,0.85)' }}>
                {member.role}
              </p>

              <p className="font-body font-light text-xs leading-relaxed"
                style={{ color: 'rgba(237,232,220,0.3)' }}>
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Badge pills ── */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}>
          {badges.map((badge, i) => (
            <span
              key={i}
              className="font-body text-[10px] tracking-[0.22em] uppercase rounded-full"
              style={{
                padding: '10px 22px',
                background: 'transparent',
                border: '1px solid rgba(237,232,220,0.14)',
                color: 'rgba(237,232,220,0.45)',
              }}>
              {badge}
            </span>
          ))}
        </motion.div>

      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.07)' }} />
    </section>
  );
}
