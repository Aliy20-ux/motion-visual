---
name: web-design-guidelines
description: Audit UI code against Web Interface Guidelines — interactions, forms, animation, typography, layout, performance, accessibility. Use when asked to "review my UI", "audit design", "review UX", "check my site against best practices", or before shipping any user-facing page. Works offline; optionally refreshes rules from the upstream source.
argument-hint: <file-or-pattern>
---

# Web Interface Guidelines Review

Audit files against the ruleset below. Report findings as terse `file:line — rule — fix`
lines, ordered by severity. Only report violations, not passes. If no files are
specified: audit the files changed on the current branch (`git diff` + `git status`);
if not in a git repo or nothing changed, audit everything under `src/` (or the
project's equivalent source directory). Only ask when neither of those exists.

**Optional freshness step:** if network is available, fetch
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
and merge any rules not covered below. Never skip the audit because the fetch failed —
the ruleset here is the working baseline.

## Interactions

- Clickable elements use `<button>`/`<a>` — never bare `div onClick`. Links that
  navigate are `<a href>` (⌘-click must work); buttons that act are `<button>`.
- Every interactive element: visible focus state (`focus-visible:`, never remove
  outlines without replacement), `cursor-pointer`, and ≥44×44px touch target
  (visual size can be smaller with padded hit area).
- Hover-only affordances have a touch/keyboard equivalent. Hover styles behind
  `@media (hover: hover)`.
- Disabled buttons during async submit; show progress if >300ms. Never double-fire.
- Destructive actions: confirm or offer undo — never both silently irreversible and instant.
- Keyboard: full flows completable by Tab/Enter/Escape/arrows. Modal = focus trap +
  restore focus on close + Escape closes. No positive `tabindex`.

## Forms

- Every input has a `<label>` (visible preferred; `sr-only` acceptable). Placeholder
  is never the label.
- Correct `type=` and `autocomplete=`, `inputmode=` for numeric/tel/email — mobile
  keyboards must match the field.
- Errors: adjacent to the field, specific ("Enter a UK postcode" not "Invalid"),
  announced (`aria-invalid`, `aria-describedby`), and never clear user input on failure.
- Submit on Enter from any field. No layout shift when validation messages appear
  (reserve space or animate height purposefully).
- Never block paste. Never disable autofill without cause.

## Animation

- Only `transform`/`opacity` (compositor properties). Never animate `width`/`height`/
  `top`/`margin`/`padding`. Never `transition-all`.
- UI feedback ≤300ms, `ease-out` on enter, faster exit than enter. Springs/transitions
  (interruptible) over keyframes for state that can toggle rapidly.
- Origin-correct: popovers scale from their trigger corner, never from `scale(0)` at center.
- `prefers-reduced-motion: reduce` honored on every animation — reduce or remove,
  but end-state must be fully visible/readable.
- Nothing auto-plays on loop near text content. No animation gates content readability.

## Typography & Content

- Body ≥16px on mobile (also prevents iOS zoom-on-focus). Line-height 1.5–1.75 body,
  tighter (1.1–1.3) for display sizes. Line length 45–75ch.
- Real punctuation: curly quotes “ ”, apostrophes ’, em dashes — not straight-quote
  approximations in rendered copy.
- Heading hierarchy is semantic and sequential (one `h1`, no skipped levels chosen
  for styling — style with classes, structure with tags).
- `text-wrap: balance` on headings, `text-wrap: pretty` on body where supported.
- Truncation only with a way to access full content. Dates, numbers, currencies
  localized or unambiguous (no 03/04/05).

## Layout

- No horizontal scroll at any viewport ≥320px. Wide content (tables, code) scrolls
  inside its own `overflow-x-auto` container.
- `100svh`/`dvh` not `100vh` for full-height sections (mobile URL bar).
- Fixed headers: anchored content offset with `scroll-margin-top`; content never
  hidden underneath on load.
- Reserve space for async content (aspect-ratio boxes, skeletons) — zero CLS from
  images, ads, embeds, fonts. Images always have `width`/`height` or `aspect-ratio`.
- Safe-area insets (`env(safe-area-inset-*)`) respected for fixed bottom elements.
- Test at 375px, 768px, 1024px, 1440px, and 200% browser zoom.

## Performance

- Images: modern format (WebP/AVIF), `srcset`/`sizes`, `loading="lazy"` below fold,
  `fetchpriority="high"` + eager for the LCP image only.
- Fonts: `font-display: swap` or `optional`, preload the display face used above
  the fold, subset if possible.
- No layout reads in scroll/resize handlers; use IntersectionObserver / rAF batching.
- Bundle: route-level code splitting; no heavyweight library for a one-liner.
- Third-party scripts deferred and audited — each one must justify its cost.

## Accessibility (gate, not garnish)

- Text contrast ≥4.5:1 (normal) / 3:1 (large + UI components). Check both themes.
- Meaningful images: descriptive `alt`. Decorative: `alt=""`. Icon-only buttons:
  `aria-label`.
- Landmarks: single `<main>`, `<nav>`, `<header>`, `<footer>`; skip-to-content link
  as first focusable element.
- Status changes announced (`aria-live="polite"` for async results, `role="alert"`
  for errors).
- Color never the sole indicator. `:focus-visible` styles distinct from hover.
- `<html lang>` set; document `<title>` unique per route; SPA route changes move
  focus or announce.

## Severity for reporting

1. **Blocker** — data loss, inaccessible core flow, broken keyboard path, CLS >0.1
2. **High** — contrast failures, missing labels, layout-property animation, hijacked scroll
3. **Medium** — missing reduced-motion, hover-only affordance, truncation traps
4. **Polish** — typographic punctuation, text-balance, micro-timing
