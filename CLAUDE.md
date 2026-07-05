# Motion Visual — project instructions

Studio/agency site (motion-visual.com). TypeScript + React 19 + Vite +
Tailwind v4 + `motion` (Motion One/Framer successor — NOT the `framer-motion`
package) + Lenis smooth scroll + React Router + Supabase. The design system is
deliberate — refine within it, never re-theme.

## THE trap in this repo — read first

**`.env` MUST exist before `npm run build`.** The build "succeeds" without it
and the deployed app blank-screens at runtime. `.env.example` lists the
required vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Missing `.env` =
stop and report, never build around it.

## Commands (Node is behind nvm — prefix every node command)

```bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"; nvm use --lts >/dev/null 2>&1
npm run dev       # dev server
npm run build     # tsc -b && vite build (type errors fail the build)
npm run preview   # vite preview (static only — does NOT run functions/)
npm run verify    # browser verification gate — see below
npm run lint      # oxlint
```

## Deploy — Cloudflare Pages (not Workers)

`npx wrangler pages deploy dist` (there is no wrangler.jsonc; `functions/`
holds Pages Functions). Confirm the project name with `npx wrangler pages
project list` before the first deploy of a session. After deploy, curl the
live URL and state URL + deployment ID plainly.

## Verification — before any deploy

`npm run build && npm run verify -- / <other routes>` (both viewports, console
errors, overflow, reduced-motion, keyboard; screenshots in `verify-screens/`).
Note: `verify` uses vite preview, so `functions/` endpoints are NOT exercised —
test those with `npx wrangler pages dev dist` manually. Playwright is a
TEMPORARY devDependency per the global rule: install before, remove before
commit.

## TIME_LOG convention

`TIME_LOG.md` gets a real wall-clock entry per work session, logged at session
start/end: `START <timestamp> — END <timestamp> — <what was done>`. Keep it
honest — it's real data, not an estimate.
