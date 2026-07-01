'use client';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#why-us' },
  { label: 'Results', href: '#results' },
  { label: 'Contact', href: '#quote' },
];

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export default function Footer() {
  return (
    <>
      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden" style={{ background: '#0A0A0B' }}>
        <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />

        {/* Subtle glow — top left only */}
        <div className="absolute top-0 left-0 w-[600px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(196,30,30,0.08) 0%, transparent 65%)' }} />

        <div className="relative" style={{ padding: 'clamp(80px,11vw,160px) clamp(24px,5vw,88px)' }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 lg:gap-24 items-end">

            {/* Left — headline */}
            <div>
              <motion.div className="flex items-center gap-4 mb-10"
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <div className="w-8 h-px gradient-bg" />
                <span className="font-body text-[10px] tracking-[0.32em] uppercase"
                  style={{ color: 'rgba(237,232,220,0.3)' }}>
                  Ready to begin?
                </span>
              </motion.div>

              <motion.div className="overflow-hidden"
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                <motion.h2 className="font-display italic"
                  style={{ fontSize: 'clamp(2rem,9vw,12rem)', lineHeight: 0.88, letterSpacing: '-0.028em', color: '#EDE8DC' }}
                  variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1.0, ease } } }}>
                  Let's build
                </motion.h2>
              </motion.div>
              <motion.div className="overflow-hidden"
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                <motion.h2 className="font-display italic"
                  style={{ fontSize: 'clamp(2rem,9vw,12rem)', lineHeight: 0.88, letterSpacing: '-0.028em', color: '#EDE8DC' }}
                  variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1.0, ease, delay: 0.1 } } }}>
                  something
                </motion.h2>
              </motion.div>
              <motion.div className="overflow-hidden"
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                <motion.h2 className="font-display italic gradient-text"
                  style={{ fontSize: 'clamp(3.5rem,9vw,12rem)', lineHeight: 0.88, letterSpacing: '-0.028em' }}
                  variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1.0, ease, delay: 0.2 } } }}>
                  remarkable.
                </motion.h2>
              </motion.div>
            </div>

            {/* Right — contact details + CTA */}
            <motion.div
              className="flex flex-col gap-10 lg:pb-4 lg:min-w-[280px]"
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.85, ease, delay: 0.35 }}>

              <div className="flex flex-col gap-3">
                <span className="font-body text-[10px] tracking-[0.28em] uppercase"
                  style={{ color: 'rgba(237,232,220,0.25)' }}>
                  Get in touch
                </span>
                <a href="mailto:hello@motionvisual.co.uk"
                  className="font-body text-sm transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(237,232,220,0.55)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                  hello@motionvisual.co.uk
                </a>
                <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.2)' }}>
                  Edinburgh, Scotland
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <a href="#quote"
                  className="gradient-bg inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold text-sm cursor-pointer transition-all hover:opacity-90 hover:scale-[1.03] duration-200"
                  style={{ padding: '16px 36px', color: '#F0EDED' }}>
                  Start Your Project <ArrowUpRight size={14} />
                </a>
                <a href="mailto:hello@motionvisual.co.uk"
                  className="font-body text-xs text-center transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(237,232,220,0.3)', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                  or email us directly
                </a>
              </div>
            </motion.div>

          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(237,232,220,0.07)' }} />
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#080809' }}>

        {/* Main footer grid */}
        <div style={{ padding: 'clamp(56px,7vw,96px) clamp(24px,5vw,88px)' }}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 md:gap-20">

            {/* Brand column */}
            <div className="flex flex-col gap-6 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-baseline gap-0.5 shrink-0">
                  <span className="font-display italic leading-none"
                    style={{ fontSize: '1.15rem', letterSpacing: '-0.04em', color: '#C41E1E' }}>
                    M
                  </span>
                  <span className="font-body font-light leading-none"
                    style={{ fontSize: '0.5rem', color: 'rgba(196,30,30,0.4)', letterSpacing: '0' }}>
                    ·
                  </span>
                  <span className="font-display italic leading-none"
                    style={{ fontSize: '1.15rem', letterSpacing: '-0.04em', color: 'rgba(237,232,220,0.65)' }}>
                    V
                  </span>
                </div>
                <span className="font-body text-[10px] tracking-[0.22em] uppercase"
                  style={{ color: 'rgba(237,232,220,0.5)' }}>
                  Motion Visual
                </span>
              </div>
              <p className="font-body font-light text-xs leading-relaxed"
                style={{ color: 'rgba(237,232,220,0.28)' }}>
                Edinburgh's premium web design agency. Award-quality sites delivered in days, not months.
              </p>
              <span className="gradient-text font-display italic"
                style={{ fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                Edinburgh-born. Internet-renowned.
              </span>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-5">
              <span className="font-body text-[9px] tracking-[0.32em] uppercase"
                style={{ color: 'rgba(237,232,220,0.2)' }}>
                Navigate
              </span>
              <nav className="flex flex-col gap-3">
                {navLinks.map(link => (
                  <a key={link.label} href={link.href}
                    className="font-body text-sm transition-opacity hover:opacity-80 cursor-pointer w-fit"
                    style={{ color: 'rgba(237,232,220,0.45)' }}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-5">
              <span className="font-body text-[9px] tracking-[0.32em] uppercase"
                style={{ color: 'rgba(237,232,220,0.2)' }}>
                Contact
              </span>
              <div className="flex flex-col gap-3">
                <a href="mailto:hello@motionvisual.co.uk"
                  className="font-body text-sm transition-opacity hover:opacity-80 cursor-pointer w-fit"
                  style={{ color: 'rgba(237,232,220,0.45)' }}>
                  hello@motionvisual.co.uk
                </a>
                <span className="font-body text-sm"
                  style={{ color: 'rgba(237,232,220,0.28)' }}>
                  Edinburgh, Scotland
                </span>
                <a href="#quote"
                  className="inline-flex items-center gap-1.5 font-body text-xs mt-2 transition-opacity hover:opacity-80 cursor-pointer w-fit"
                  style={{ color: 'rgba(196,30,30,0.7)' }}>
                  Get a quote <ArrowUpRight size={11} />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(237,232,220,0.05)', padding: '20px clamp(24px,5vw,88px)' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-body text-xs" style={{ color: 'rgba(237,232,220,0.18)' }}>
              © 2026 Motion Visual Agency Ltd
            </span>
            <div className="flex items-center gap-5">
              {legalLinks.map(link => (
                <a key={link.label} href={link.href}
                  className="font-body text-xs transition-opacity hover:opacity-70 cursor-pointer"
                  style={{ color: 'rgba(237,232,220,0.18)' }}>
                  {link.label}
                </a>
              ))}
              <a href="/admin"
                className="font-body text-xs transition-opacity hover:opacity-70 cursor-pointer"
                style={{ color: 'rgba(196,30,30,0.28)' }}>
                Admin
              </a>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
}
