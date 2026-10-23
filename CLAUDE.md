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

**Two Pages projects exist (checked 2026-10-23).** The live domains
(motion-visual.com, www) are on **`motion-visual-git`**, which is
**Git-connected: merging to `main` deploys to production automatically, and
every pushed branch/PR gets a preview build.** The older direct-upload project
**`motion-visual`** (motion-visual.pages.dev only, no custom domain) is NOT the
live site: `npx wrangler pages deploy dist --project-name motion-visual` updates
only that one. Secrets and build variables (`VITE_*`) for the live site must be
set on `motion-visual-git` (Settings → Variables and Secrets). `functions/`
holds Pages Functions; there is no wrangler.jsonc. Confirm with
`curl https://motion-visual.com/` (compare the `assets/index-*.js` name with the
project you think is live) before saying anything is deployed. After deploy run
`node scripts/check-deploy.mjs https://motion-visual.com` and state URL +
deployment ID plainly.

## Verification — before any deploy

`npm run build && npm run verify -- / <other routes>` (both viewports, console
errors, overflow, reduced-motion, keyboard; screenshots in `verify-screens/`).
Note: `verify` uses vite preview, so `functions/` endpoints are NOT exercised —
test those with `npx wrangler pages dev dist` manually. Playwright is a
TEMPORARY devDependency per the global rule: install before, remove before
commit.

## Client agreements (/studio, /agreement/:token, /cancellation)

E-signature flow backed by the CRM's Supabase project — read
`docs/AGREEMENTS.md` before touching it. Legal wording lives only in
`src/legal/` (also bundled into `functions/`, so keep it browser-free). The
client-facing functions need the `AGREEMENTS_SERVER_KEY` Pages secret, and its
SHA-256 in Supabase Vault — without both, signing returns "not available".

## TIME_LOG convention

`TIME_LOG.md` gets a real wall-clock entry per work session, logged at session
start/end: `START <timestamp> — END <timestamp> — <what was done>`. Keep it
honest — it's real data, not an estimate.
