'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#why-us' },
  { label: 'Results', href: '#results' },
  { label: 'Contact', href: '#quote' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10"
        style={{ height: 72 }}
        animate={{ background: scrolled ? 'rgba(10,10,11,0.85)' : 'transparent' }}
        transition={{ duration: 0.4 }}
      >
        {scrolled && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(244,241,236,0.06)' }}
          />
        )}

        {/* Logo */}
        <a href="/" className="relative z-10 flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
            <span className="font-display font-medium text-sm text-white">M</span>
          </div>
          <span className="font-body font-medium text-sm tracking-[0.12em] uppercase" style={{ color: 'rgba(244,241,236,0.85)' }}>
            Motion Visual
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="relative z-10 hidden md:flex items-center gap-8">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-xs tracking-[0.15em] uppercase transition-colors duration-200"
              style={{ color: 'rgba(244,241,236,0.45)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F4F1EC')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,241,236,0.45)')}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#quote"
            className="gradient-bg font-body text-xs font-medium tracking-[0.12em] uppercase text-white rounded-full transition-all duration-300 hover:opacity-90 hover:scale-105"
            style={{ padding: '10px 22px' }}
          >
            Get a Quote
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="relative z-10 md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <motion.span className="block w-6 h-px bg-off-white/70" animate={menuOpen ? { rotate: 45, y: 5 } : {}} />
          <motion.span className="block w-4 h-px bg-off-white/70" animate={menuOpen ? { opacity: 0 } : {}} />
          <motion.span className="block w-6 h-px bg-off-white/70" animate={menuOpen ? { rotate: -45, y: -5 } : {}} />
        </button>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ background: '#0A0A0B' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display italic text-5xl text-off-white/80 hover:text-off-white py-3 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#quote"
              onClick={() => setMenuOpen(false)}
              className="mt-8 gradient-bg text-white font-body text-sm tracking-wider uppercase rounded-full px-8 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Get a Quote
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
