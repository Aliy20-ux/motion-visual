---
name: web-design-master
description: Master orchestrator for premium web design and build work. Use FIRST for any website/UI project — building a site or page, redesigning, "make it premium", design reviews, or when unsure which design skill applies. Routes to the right specialist skill (premium-web-design, emil-design-eng, scroll-experience, tailwind-patterns, seo, core-web-vitals, accessibility-auditor, web-design-guidelines, ui-ux-pro-max, review-animations, animation-vocabulary), resolves conflicts between them, and defines the build → verify → ship workflow.
---

# Web Design Master

You have a library of specialist design skills. This skill is the routing table,
the conflict resolver, and the quality gate. Read the specialist skill before
doing its kind of work — don't work from memory of it.

## Rule 0 — the user's request outranks this library

When the user asks for a specific change, that request overrides every rule in
every skill below. If the request conflicts with a guideline (blacklisted font,
long animation, discouraged layout), implement the request AND note the
conflict in one sentence — never silently drop or water down what was asked.
Before editing, restate the user's requested changes as a numbered checklist;
after editing, report each item as done (file:line) or NOT DONE with the
reason. Never omit an item.

## Routing table

| Task | Skill(s), read in this order |
|---|---|
| New site/page from scratch | `premium-web-design` (direction) → `ui-ux-pro-max` (design-system search) → `tailwind-patterns` (implementation) |
| "Make it premium / impress me" | `premium-web-design` — structural DNA, typography identity, micro-details |
| Choosing style/palette/fonts for an industry | `ui-ux-pro-max` `--design-system` search, then sanity-check against `premium-web-design`'s blacklist |
| Any animation or interaction | `emil-design-eng` before writing; `review-animations` after |
| Scroll effects, parallax, pinned sections | `scroll-experience` |
| Naming a motion effect from a vague description | `animation-vocabulary` |
| Tailwind setup, tokens, v4 questions | `tailwind-patterns` |
| Pre-ship audit of UI code | `web-design-guidelines`, then `review-animations` if motion exists |
| Accessibility audit or fix | `accessibility-auditor` (WCAG depth) + `web-design-guidelines` (quick gate) |
| Search visibility, meta, schema | `seo` |
| Slow pages, poor LCP/INP/CLS | `core-web-vitals` |

If a task matches several rows, read every matching skill, in table order.
If it matches none but touches UI, read `web-design-guidelines` and proceed.
For a full build, the minimum set is: `web-design-guidelines` gate +
`review-animations` (if any motion) + the verification protocol below.

## Scope gate — how much process a change needs

- **Light pass** (copy tweak, color/token change, single component edited, no
  new motion or layout): clean build + load the affected page in a browser +
  zero console errors + eyeball the changed element. Skip the full protocol.
- **Full protocol** (new page or route, new/changed animation, layout
  restructure, anything before a launch or deploy): everything under
  "Verification protocol" below.
When unsure which applies, use the full protocol.

## Conflict resolution — who wins

Skills in this library disagree in places. These rulings are final:

1. **Animation standards: Emil wins.** `emil-design-eng` / `review-animations`
   override any other skill's animation advice. Concretely: no `transition-all`;
   only `transform`/`opacity`; ≤300ms UI feedback; `ease-out` enter; interruptible
   over keyframed; origin-correct scaling; reduced-motion always.
2. **Typography identity: `premium-web-design` wins.** Its blacklist
   (Inter/Poppins/Montserrat/Outfit as *display* faces, purple-on-dark gradients,
   symmetric 3-card grids, hero→features→testimonials→CTA templating) overrides
   any font/layout suggestion from `ui-ux-pro-max` or `tailwind-patterns`.
   Inter-class fonts remain fine as *body/UI* text.
3. **`ui-ux-pro-max` colors are suggestions, not law.** Its hex palettes skew
   generic SaaS-blue. Take its reasoning, patterns, and anti-patterns; derive
   actual colors from the brand/industry direction per `premium-web-design`.
4. **Accessibility is a floor, never a trade-off.** If a premium visual choice
   fails contrast/keyboard/reduced-motion, the visual changes, not the floor.
5. **A documented palette beats a "fresh" one.** If the project already has a
   deliberate design system, refine within it. Don't re-theme because a skill
   catalogs alternatives — structural and motion quality is where revisions pay.
6. **Real client site vs fictional showcase.** On a real client's site, the
   content-honesty rules are absolute: no invented facts, reviews, logos,
   pricing, or credentials, and 3D/Spline is optional, chosen per brief.
   `premium-web-design`'s fictional-brand machinery (fake copy hooks, fake
   customer logos, invented fields) applies ONLY to showcase/portfolio
   exercises with no real business behind them.

## Non-negotiables (synthesis — the always-on checklist)

Design — each term defined so it can be checked, not felt:
- **Distinctive display type**: the display font is not on the blacklist and is
  paired with dramatic size contrast (largest heading ≥3× body size, `clamp()`
  scaling).
- **Asymmetric structure somewhere load-bearing**: at least one major section
  is NOT a centered, equal-columns layout — e.g. a 60/40 or 70/30 split, an
  offset grid (`col-span-7`/`col-span-5`), or an element that crosses a section
  boundary.
- **One signature moment per page — exactly one**: a single custom interaction
  or visual no template ships with (a scroll-pinned sequence, a marquee nav, a
  ledger-style list, an oversized image bleeding off-grid). Zero reads generic;
  two or more compete.
- **Micro-details**: scroll progress indicator, styled `::selection`, custom
  scrollbar, or grain/texture — at least two of these.
- **Real punctuation**: curly quotes (“ ”), real apostrophes (’), em dashes (—)
  in rendered copy — not straight-quote approximations.

Code: semantic elements · labeled inputs · `svh` not `vh` · reserved space for
async content (zero CLS) · compositor-only animation · `prefers-reduced-motion`
· `@media (hover: hover)` · focus-visible states · lazy images with dimensions.

Honesty: never invent business facts, reviews, or credentials. Placeholder
content is visibly labeled in the UI and tracked for replacement. AI/illustrative
imagery is disclosed as such wherever real-work photos are implied.

## Verification protocol (no page ships without this)

1. **Build clean** — zero errors/warnings from the production build.
   (Check first for a required `.env` — some projects blank-screen without it;
   read the project's CLAUDE.md/README before assuming the build is broken.)
2. **Drive it in a real browser** (Playwright as a temporary devDependency —
   uninstall before commit):
   - Desktop 1440×900 and iPhone-class viewport (390×844), every route.
   - Zero console errors/pageerrors.
   - Scroll each page incrementally (trigger `whileInView` reveals), screenshot,
     and **look at the screenshots** — blank sections, overlaps, unloaded images.
   - No horizontal overflow: `document.documentElement.scrollWidth <= innerWidth`.
3. **Tailwind v4 gotcha:** `scale-*`/`translate-*`/`rotate-*` utilities compile to
   standalone CSS properties — verify via `getComputedStyle(el).scale`, **not**
   `.transform` (which reports `"none"`).
4. **Reduced-motion pass** — emulate `prefers-reduced-motion` and confirm the
   page is complete and readable.
5. **Keyboard pass** — Tab through nav, forms, dialogs; focus visible; Escape
   closes overlays.
6. Report results faithfully: failures with output, verified things stated
   plainly, unverified things flagged — never "should work."

## Workflow for a full build

1. **Direction** (before code): industry research → design-system search
   (`ui-ux-pro-max`) → check against `premium-web-design` blacklist → commit to
   palette/type/structural DNA in the theme tokens (`tailwind-patterns`).
2. **Build**: structure and content first, motion second (`emil-design-eng`
   open while writing), scroll effects last (`scroll-experience`).
3. **Audit**: `web-design-guidelines` gate → `review-animations` →
   `accessibility-auditor` on flows → `seo` + `core-web-vitals` before launch.
4. **Verify** per protocol above. 5. **Ship**, then re-check the live URL.
