---
name: tailwind-patterns
description: Tailwind CSS v4 architecture and patterns — CSS-first @theme configuration, container queries, OKLCH tokens, v4 gotchas (standalone scale/translate properties), and transition rules that don't fight animation-quality standards. Use when configuring Tailwind v4, defining design tokens, debugging why computed styles don't match utilities, or reviewing Tailwind class usage.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Tailwind CSS Patterns (v4)

> CSS-first utility framework. The config file is gone; the stylesheet is the config.

## 1. v4 Architecture

| v3 (legacy) | v4 (current) |
|---|---|
| `tailwind.config.js` | `@theme` directive in CSS |
| PostCSS plugin | Oxide engine (Rust, ~10× faster) |
| `content` array purge config | Automatic content detection |
| Plugin system | CSS-native features (`@utility`, `@variant`) |

Every `@theme` token is exposed as a CSS variable (`--color-*`, `--font-*`,
`--spacing-*`), usable in arbitrary values (`bg-(--color-brand)`) and in plain
CSS (`var(--color-brand)`).

## 2. Token architecture

```css
@import "tailwindcss";

@theme {
  /* Semantic names, not raw hues. OKLCH for perceptual uniformity. */
  --color-surface: oklch(0.98 0.01 85);
  --color-ink: oklch(0.25 0.02 60);
  --color-brand: oklch(0.65 0.12 75);

  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  --shadow-lift: 0 20px 60px -20px oklch(0.2 0.05 60 / 0.35);
}
```

Three layers, in order of preference: **primitive** (`--color-walnut-500`) →
**semantic** (`--color-surface`) → component-scoped CSS vars only when a
component needs runtime theming. Don't skip semantic and scatter primitives
through markup — renaming a palette then touches every file.

**Fonts:** the token *system* is stack-agnostic, but font *choice* is brand
identity — pick type per the project's design direction (see
`premium-web-design`), never default to Inter/Poppins/Montserrat for display
type just because they're common defaults.

## 3. The v4 gotcha that breaks verification: standalone properties

v4 compiles `scale-*`, `rotate-*`, and `translate-*` utilities to the **modern
standalone CSS properties**, not `transform`:

```css
/* v4 output */
.scale-x-0 { --tw-scale-x: 0%; scale: var(--tw-scale-x) var(--tw-scale-y); }
```

Consequences:
- `getComputedStyle(el).transform` returns `"none"` even while a scale is
  active. Check `.scale`, `.rotate`, `.translate` individually when verifying
  with Playwright/DevTools.
- Mixing an inline `style="transform: ..."` (e.g. from an animation library)
  with utility `scale-*` classes composes — both apply — which can double-apply
  effects. Pick one mechanism per element.
- Animating these utilities via `transition-transform` works: the `transition`
  shorthand covers standalone properties in modern browsers, but be explicit
  (`transition-[scale]`) if targeting is unclear.

## 4. Transitions — aligned with the animation standards

`transition-all` is banned (it transitions layout properties you never intended
and invites jank). Name what changes:

| Intent | Classes |
|---|---|
| Color/hover feedback | `transition-colors duration-200 ease-out` |
| Move/scale (GPU) | `transition-transform duration-300 ease-out` |
| Multiple named | `transition-[background-color,box-shadow] duration-300` |
| Enter vs exit | fast exit, slower ease-out enter (see `emil-design-eng`) |

Hover rules: `hover:` variants are automatically gated behind
`@media (hover: hover)` in v4 — no extra work needed. On hover, only change
properties that never move neighboring elements: `transform`/`scale`/`translate`,
`opacity`, `color`, `background-color`, `box-shadow`. Never change `width`,
`height`, `padding`, `margin`, `font-weight`, or border *width* on hover — those
reflow the layout and make neighbors jump. (Border *color* is fine.)

Built-in `animate-spin`/`animate-pulse` are for loading states only — never
decoration. `animate-bounce`/`animate-ping` almost never belong in production.

## 5. Container queries (native in v4)

```html
<div class="@container">
  <article class="grid @md:grid-cols-2 @xl:grid-cols-3">…</article>
</div>
```

Viewport breakpoints (`md:`) for page chrome; container queries (`@md:`) for
any component that can appear at multiple widths (cards, sidebars, embeds).
Named containers (`@container/card` → `@md/card:`) when nesting.

## 6. Layout patterns

| Pattern | Classes |
|---|---|
| Auto-fit card grid | `grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6` |
| Sidebar shell | `grid grid-cols-[auto_1fr]` |
| Asymmetric editorial split | `grid md:grid-cols-12` + `md:col-span-7` / `md:col-span-5` |
| Center anything | `grid place-items-center` |

Prefer asymmetric spans over uniform 3-up grids for content sections —
symmetric card grids are the strongest "template" tell (see
`premium-web-design`).

Viewport units: use `svh`/`dvh`, not `vh`, for full-height sections — mobile
URL bars make `100vh` overflow.

## 7. Dark mode

| Strategy | Behavior |
|---|---|
| `@variant dark (&:where(.dark, .dark *))` | Class toggle, manual switcher |
| default `prefers-color-scheme` | Follows OS, no user control |

Define both light and dark values as semantic tokens rather than sprinkling
`dark:` on every element: flip the token, not the markup.

## 8. Extraction rules

| Signal | Action |
|---|---|
| Same class combo 3+ times | Extract a framework component |
| Repeated utility *pattern* with no JS | `@utility` in CSS |
| Long class strings built from template literals | Never — Oxide can't see dynamic classes; use full literal class names per variant |

`@apply` still works but hides the utility vocabulary — components are almost
always the better extraction.

## 9. Anti-patterns

| Don't | Do |
|---|---|
| `transition-all` | Name the properties |
| `!important` / arbitrary z-indexes | Fix specificity; define a z-scale (10/20/30/50) |
| Arbitrary values everywhere (`w-[347px]`) | Extend `@theme`; arbitrary is for true one-offs |
| Template-string class names | Full literal classes per variant |
| `h-screen` for heroes | `h-svh` (or `min-h-svh`) |
| Checking `.transform` in tests for scale/translate utilities | Check standalone `scale`/`translate` properties |
