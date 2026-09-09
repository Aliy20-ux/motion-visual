'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';
import { scrollToHash, scrollToTarget } from '../../lib/smoothScroll';

// The mobile menu is near-opaque, so starting the scroll the instant a link is tapped just
// hides it happening behind the closing overlay — the user never sees the "smooth" part of
// smooth-scroll, only a jump-cut once the menu clears. Closing the menu first and waiting
// for its own exit transition (250ms) to finish means the scroll plays out on the visible
// page instead.
const MOBILE_MENU_CLOSE_MS = 260;
function handleMobileNavClick(href: string, closeMenu: () => void) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    setTimeout(() => scrollToTarget(href), MOBILE_MENU_CLOSE_MS);
  };
}

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#why-us' },
  { label: 'Process', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#quote' },
];

function MagneticNavCTA({ children, href, className, style, onClick }: {
  children: React.ReactNode; href: string; className?: string; style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    setPos({ x: (e.clientX - rect.left - rect.width / 2) * 0.22, y: (e.clientY - rect.top - rect.height / 2) * 0.3 });
  };
  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className={className}
      style={style}
    >
      {children}
    </motion.a>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  // Full-screen mobile menu behaves like a modal: Escape closes it and focus
  // returns to the trigger that opened it.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  return (
    <>
      {/* Floating pill nav */}
      <header className="fixed top-4 left-4 right-4 md:top-5 md:left-6 md:right-6 z-50">
        <motion.div
          className="flex items-center justify-between px-5 md:px-6 rounded-2xl"
          style={{
            height: 58,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            willChange: 'backdrop-filter',
          }}
          initial={{
            background: 'rgba(10,10,11,0.74)',
            border: '1px solid rgba(244,241,236,0.06)',
          }}
          animate={{
            background: scrolled ? 'rgba(10,10,11,0.92)' : 'rgba(10,10,11,0.74)',
            border: scrolled
              ? '1px solid rgba(244,241,236,0.12)'
              : '1px solid rgba(244,241,236,0.06)',
          }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <img src="/logo-dark.png" alt="Motion Visual" className="h-9 w-9 shrink-0 object-contain" />
            {/* Wordmark */}
            <span
              className="hidden sm:inline font-body text-[10px] tracking-[0.22em] uppercase transition-opacity duration-200 group-hover:opacity-100"
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
                onClick={scrollToHash(link.href)}
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
              <MagneticNavCTA
                href="#quote"
                onClick={scrollToHash('#quote')}
                className="gradient-bg font-body text-[11px] font-medium tracking-[0.14em] uppercase text-white rounded-full transition-opacity duration-300 hover:opacity-85 cursor-pointer flex items-center"
                style={{ padding: '9px 20px' }}
              >
                Start a Project
              </MagneticNavCTA>
            </div>

            <a
              href="https://admin.motion-visual.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Team admin login"
              title="Team admin login"
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors duration-200"
              style={{ border: '1px solid rgba(244,241,236,0.1)', color: 'rgba(244,241,236,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F4F1EC'; e.currentTarget.style.borderColor = 'rgba(244,241,236,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,241,236,0.4)'; e.currentTarget.style.borderColor = 'rgba(244,241,236,0.1)'; }}
            >
              <Lock size={13} strokeWidth={1.75} />
            </a>

            <button
              ref={menuButtonRef}
              className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
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
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
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
                onClick={handleMobileNavClick(link.href, () => setMenuOpen(false))}
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
              onClick={handleMobileNavClick('#quote', () => setMenuOpen(false))}
              className="mt-10 gradient-bg text-white font-body text-sm tracking-widest uppercase rounded-full px-8 py-4 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
            >
              Start a Project
            </motion.a>
            <motion.a
              href="https://admin.motion-visual.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="mt-6 flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase cursor-pointer"
              style={{ color: 'rgba(244,241,236,0.35)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Lock size={11} strokeWidth={1.75} /> Team Admin
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
