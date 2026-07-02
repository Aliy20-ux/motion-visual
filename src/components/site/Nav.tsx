'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#why-us' },
  { label: 'Process', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#quote' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      {/* Floating pill nav */}
      <header className="fixed top-4 left-4 right-4 md:top-5 md:left-6 md:right-6 z-50">
        <motion.div
          className="flex items-center justify-between px-5 md:px-6 rounded-2xl"
          style={{
            height: 58,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
          initial={{
            background: 'rgba(10,10,11,0.65)',
            border: '1px solid rgba(244,241,236,0.06)',
          }}
          animate={{
            background: scrolled ? 'rgba(10,10,11,0.92)' : 'rgba(10,10,11,0.65)',
            border: scrolled
              ? '1px solid rgba(244,241,236,0.12)'
              : '1px solid rgba(244,241,236,0.06)',
          }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group cursor-pointer">
            {/* Mark: crimson M · V */}
            <div className="flex items-baseline gap-0.5 shrink-0">
              <span className="font-display italic leading-none"
                style={{ fontSize: '1.15rem', letterSpacing: '-0.04em', color: '#C41E1E' }}>
                M
              </span>
              <span className="font-body font-light leading-none"
                style={{ fontSize: '0.5rem', color: 'rgba(196,30,30,0.45)', letterSpacing: '0' }}>
                ·
              </span>
              <span className="font-display italic leading-none"
                style={{ fontSize: '1.15rem', letterSpacing: '-0.04em', color: 'rgba(244,241,236,0.75)' }}>
                V
              </span>
            </div>
            {/* Wordmark */}
            <span
              className="font-body text-[10px] tracking-[0.22em] uppercase transition-opacity duration-200 group-hover:opacity-100"
              style={{ color: 'rgba(244,241,236,0.5)' }}
            >
              Motion Visual
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 cursor-pointer"
                style={{ color: 'rgba(244,241,236,0.55)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F4F1EC')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,241,236,0.55)')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {/* Availability indicator */}
              <span className="font-body text-[9px] tracking-[0.16em] uppercase"
                style={{ color: 'rgba(196,30,30,0.7)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                  style={{ background: '#C41E1E', boxShadow: '0 0 5px rgba(196,30,30,0.6)' }} />
                2 spots · July
              </span>
              <a
                href="#quote"
                className="gradient-bg font-body text-[11px] font-medium tracking-[0.14em] uppercase text-white rounded-full transition-all duration-300 hover:opacity-85 hover:scale-105 cursor-pointer flex items-center"
                style={{ padding: '9px 20px' }}
              >
                Start a Project
              </a>
            </div>

            <button
              className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <motion.span className="block w-5 h-px" style={{ background: 'rgba(244,241,236,0.7)' }} animate={menuOpen ? { rotate: 45, y: 5 } : {}} />
              <motion.span className="block w-3.5 h-px" style={{ background: 'rgba(244,241,236,0.7)' }} animate={menuOpen ? { opacity: 0 } : {}} />
              <motion.span className="block w-5 h-px" style={{ background: 'rgba(244,241,236,0.7)' }} animate={menuOpen ? { rotate: -45, y: -5 } : {}} />
            </button>
          </div>
        </motion.div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ background: 'rgba(10,10,11,0.97)', backdropFilter: 'blur(20px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display italic text-5xl py-3 cursor-pointer"
                style={{ color: 'rgba(244,241,236,0.8)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F4F1EC')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,241,236,0.8)')}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#quote"
              onClick={() => setMenuOpen(false)}
              className="mt-10 gradient-bg text-white font-body text-sm tracking-widest uppercase rounded-full px-8 py-4 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
            >
              Start a Project
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
