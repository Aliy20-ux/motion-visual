---
name: scroll-experience
description: "Build scroll-driven experiences that stay smooth and accessible — scroll-linked animation, parallax, pinned/sticky narrative sections, progress indicators, reveals. Use when: scroll animation, parallax, scroll storytelling, sticky section, scroll progress, cinematic website. Covers Framer Motion, CSS scroll-timeline, and GSAP ScrollTrigger, plus fixes for scroll jank, mobile parallax breakage, and reduced-motion."
source: vibeship-spawner-skills (Apache 2.0), rewritten and corrected
---

# Scroll Experience

Scrolling is the one interaction every visitor already knows. Scroll-driven design
enhances that gesture — it must never take it away. Every pattern below is
scrub-linked (animation progress = scroll position), so the user keeps full
control, animations are interruptible by construction, and there is nothing to
"wait for."

## Decision Ladder — pick the lightest tool that works

1. **CSS `animation-timeline: view()`** — simple reveals, no JS, zero bundle cost.
   Check support; ship a visible no-animation fallback (`@supports`).
2. **Framer Motion `useScroll` + `useTransform`** — React projects. Composes with
   existing motion values, unmounts cleanly, respects `useReducedMotion`.
3. **GSAP ScrollTrigger** — complex choreography: pinning, scrubbed timelines,
   horizontal sections. Worth its weight only when 2+ elements must coordinate.
4. **Lenis** — smooth-scroll feel only. Never pair with scroll hijacking.

## Core Patterns

### Scroll-linked value (Framer Motion — preferred in React)

```jsx
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

function ParallaxImage({ src, alt }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // element enters → element leaves
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.img src={src} alt={alt} style={{ y }} />
    </div>
  );
}
```

Key details that separate this from a naive version:
- `target` + `offset` scope progress to the element, not the whole page.
- Reduced motion collapses the transform range to zero instead of unmounting —
  layout stays identical.
- Parent `overflow-hidden` absorbs the travel so parallax never causes layout
  shift or scrollbar growth.

### CSS-native reveal (no JS)

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(24px); }
}
@supports (animation-timeline: view()) {
  .reveal-on-scroll {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 35%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll { animation: none; }
}
```

### Sticky narrative section (CSS does the pinning)

```jsx
// Container height = pin duration. 250-300svh reads well; beyond 400svh feels like a hostage situation.
// svh, not vh — mobile URL bars make vh-based triggers recalc mid-gesture (see "Parallax breaks on mobile" below).
<section className="relative h-[280svh]">
  <div className="sticky top-0 flex h-svh items-center">
    {/* Swap content here based on scrollYProgress bands: [0-.33], [.33-.66], [.66-1] */}
  </div>
</section>
```

Prefer `position: sticky` over GSAP `pin: true` — no scroll-position math, no
resize recalculation, no layout thrash. Reach for GSAP pinning only when the
pinned element itself needs a scrubbed timeline of many coordinated tweens.

### Parallax depth (layer speeds)

| Layer | Travel vs scroll | Note |
|---|---|---|
| Background | 0.15–0.3× | Big, soft, low-contrast |
| Midground | 0.5× | |
| Content | 1× | Text always scrolls natively — never parallax body copy |
| Accent/floating | 1.1–1.2× | One element max; more reads as noise |

### Progress indicator

Spring-smoothed, transform-only, hidden for reduced motion:

```jsx
const { scrollYProgress } = useScroll();
const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
// <motion.div style={{ scaleX }} className="fixed top-0 h-[2px] w-full origin-left" />
```

## Story structure

Hook (full viewport) → Context → Journey (scroll-driven) → Climax (one dramatic
moment — spend the animation budget here) → Resolution (CTA, calm). One climax
per page. If everything is cinematic, nothing is.

## Sharp edges and their actual fixes

**Scroll jank.** Cause: animating layout properties (`top`, `height`, `margin`)
or reading layout in a scroll handler. Fix: animate only `transform`/`opacity`;
never attach raw `scroll` listeners — `useScroll` and ScrollTrigger batch reads
via rAF. If a scrubbed filter/blur stutters, pre-render it (e.g. two stacked
images cross-fading beats an animated `filter: blur()`).

**Parallax breaks on mobile.** Cause: URL-bar show/hide resizes the viewport,
recalculating trigger positions mid-gesture; `background-attachment: fixed` is
broken on iOS. Fix: size trigger containers with `svh`/`lvh` not `vh`; use
transform-based parallax, never `background-attachment: fixed`; reduce or drop
parallax below `md:` — depth cues read poorly on small screens anyway.

**Reduced-motion.** Scroll-linked ≠ exempt. Collapse transform ranges to zero
(keep opacity fades if gentle), keep all content reachable by plain scrolling,
and never gate content visibility behind an animation that reduced-motion turns
off — `both`/`forwards` fill modes with a visible end state, or opacity ranges
that end at 1.

**Content hostage.** If a user scrolls fast, every word must still be readable
at rest. Test: throw the scrollbar to the bottom instantly — is anything stuck
mid-transition, invisible, or overlapped? Scrubbed animations pass this by
construction; time-based `whileInView` animations with long delays fail it.

## Anti-patterns (hard bans)

- **Scroll hijacking** — overriding wheel delta, snap-jacking to full sections,
  "wait for the animation" scrolling. Users leave.
- **Animation overload** — more than ~2 concurrently moving elements in a
  viewport competes for attention. Static is a valid design choice.
- **Desktop-only design** — build the mobile scroll experience first; add depth
  upward. Test on a real phone: 60fps there or cut the effect.
- **Fake scrollbars / custom scroll containers** for the main document — breaks
  find-in-page, keyboard nav, screen readers, and back-button scroll restoration.

## Definition of done

- [ ] 60fps on a mid-range phone (DevTools CPU 4× throttle as proxy)
- [ ] `prefers-reduced-motion` produces a complete, readable page
- [ ] Instant-scroll-to-bottom leaves no broken intermediate states
- [ ] No horizontal overflow introduced at any scroll position
- [ ] Only `transform`/`opacity` animated; zero raw scroll listeners
