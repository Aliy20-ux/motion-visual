'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenisInstance } from '../../lib/smoothScroll';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // Touch devices already have great native momentum scrolling handled by the
    // OS compositor at zero JS cost. Re-implementing scroll physics in JS (Lenis)
    // on top of that is pure overhead and was the single biggest cause of scroll
    // jank on CPU-constrained phones. Keep Lenis for desktop mouse-wheel only,
    // where it's actually improving on the native scroll feel.
    if (reducedMotion || isTouch) {
      let ticking = false;
      const updateProgress = () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        doc.style.setProperty('--scroll-progress', String(max > 0 ? doc.scrollTop / max : 0));
        ticking = false;
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateProgress);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });
    setLenisInstance(lenis);

    // Drive the CSS scroll progress bar
    lenis.on('scroll', ({ progress }: { progress: number }) => {
      document.documentElement.style.setProperty('--scroll-progress', String(progress));
    });

    let raf: number;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return <>{children}</>;
}
