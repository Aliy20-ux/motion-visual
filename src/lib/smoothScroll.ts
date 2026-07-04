import type Lenis from 'lenis';

// Set by SmoothScroll.tsx whenever it creates/destroys its Lenis instance, so any
// in-page anchor link anywhere in the tree can trigger the exact same buttery,
// exponential-ease scroll physics already used for wheel scrolling — instead of
// the browser's default instant jump (or its own, differently-eased smooth scroll).
let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

// Height of the floating pill nav plus breathing room, so a scrolled-to section's
// heading doesn't land tucked directly under it.
const NAV_OFFSET = 96;

export function scrollToHash(hash: string) {
  return (e: React.MouseEvent) => {
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();

    if (lenisInstance) {
      lenisInstance.scrollTo(target as HTMLElement, {
        offset: -NAV_OFFSET,
        duration: 1.3,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      // Touch devices and prefers-reduced-motion never create a Lenis instance
      // (see SmoothScroll.tsx) — fall back to native smooth scroll.
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };
}
