'use client';
import { motion, type Variants } from 'motion/react';
import { Zap, Gem, TrendingUp, Shield } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Days, Not Months',
    body: 'We move at startup speed. Most agencies take 3–6 months. We deliver fully bespoke, award-tier sites in weeks — without cutting corners.',
    accent: '#7C3AED',
  },
  {
    icon: Gem,
    title: 'Obsessively Crafted',
    body: 'Every micro-interaction, easing curve, and typographic choice is deliberate. We obsess over the 1% details that visitors feel but never consciously notice.',
    accent: '#06B6D4',
  },
  {
    icon: TrendingUp,
    title: 'Built to Convert',
    body: 'Beautiful means nothing if it doesn\'t perform. We engineer every layout decision around psychology, user flow, and measurable outcomes.',
    accent: '#7C3AED',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    body: 'Enterprise-grade auth, encrypted data flows, and hardened Cloudflare infrastructure. Your client\'s data is as protected as your reputation.',
    accent: '#06B6D4',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function WhyUs() {
  return (
    <section id="why-us" className="relative py-32 md:py-40" style={{ padding: 'clamp(80px,12vw,160px) clamp(20px,5vw,80px)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-px gradient-bg" />
          <span className="font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(244,241,236,0.35)' }}>Why Us</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="font-display italic mb-20"
          style={{ fontSize: 'clamp(2.5rem,7vw,7rem)', lineHeight: 0.92, letterSpacing: '-0.02em', color: '#F4F1EC' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
        >
          The standard<br />
          <span className="gradient-text">we hold ourselves to.</span>
        </motion.h2>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ background: 'rgba(244,241,236,0.06)' }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="group relative overflow-hidden p-10 lg:p-14 flex flex-col gap-5 cursor-pointer"
              style={{ background: '#0A0A0B' }}
              whileHover={{ background: '#111114' }}
              transition={{ duration: 0.3 }}
            >
              {/* Hover accent blob */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ background: f.accent, filter: 'blur(40px)' }}
              />

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center glass" style={{ border: `1px solid ${f.accent}22` }}>
                <f.icon size={20} style={{ color: f.accent }} />
              </div>

              {/* Number */}
              <span className="font-body text-[10px] tracking-[0.3em] uppercase absolute top-8 right-10" style={{ color: 'rgba(244,241,236,0.15)' }}>
                0{i + 1}
              </span>

              {/* Text */}
              <h3 className="font-display italic text-2xl md:text-3xl" style={{ color: '#F4F1EC', letterSpacing: '-0.02em' }}>
                {f.title}
              </h3>
              <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'rgba(244,241,236,0.5)' }}>
                {f.body}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                style={{ background: `linear-gradient(to right, ${f.accent}, transparent)` }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
