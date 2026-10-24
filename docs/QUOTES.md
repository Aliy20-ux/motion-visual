# Automatic quotes, briefs and the quotes database

## What happens
`POST /api/quote-request` (`functions/api/quote-request.ts`) handles the quote form:

| Request | Result |
|---|---|
| Essential or Signature, with or without add-ons | Prices it from `src/pricing.ts` (the client's numbers are never trusted), saves it to `web_quotes` (sequential reference `MV-W-NNNN`), emails the customer a quote valid 14 days with a link to their brief form, and emails `admin.team@` the brief plus two attachments (`<ref>.json`, `<ref>-quote-email.html`) |
| Flagship, an online shop / ordering add-on, or project type "E-commerce" | No quote. `admin.team@` gets a "Scoping call request" |
| Invalid, ineligible or unknown add-ons, bad page counts | 400, nothing sent |
| Form completed in under 2.5s | 200, nothing sent |
| No / invalid Turnstile token (only once `TURNSTILE_SECRET_KEY` is set) | 400 `verification_failed` |
| More than 3 quotes to one email in 24h, or 5 from one IP in 1h | 429 `rate_limited` |
| Database unreachable | The quote **still goes out** with a fallback reference (`MV-W-YYYYMMDD-XXXX`) and no brief link; the team email and the record say it was not saved |

The quote is **not a contract**. The customer replies to go ahead, you send a Project Agreement from `/studio`, and the deposit (about 25%, rounded up to £5) is paid on signing. The 48-hour first-design target runs from the signed agreement + content, not from the quote email.

## The brief form
The customer's quote email links to `/brief/<private token>`. They describe the business (12 questions, 2 required). On submit (`/api/brief/submit`, one submission per quote):
- the brief is saved on the quote row,
- the team gets an email with a **paste-ready prompt** for Claude (`server/briefs.ts`). It contains the business details only, never the customer's email, phone or name, and it tells Claude to use labelled placeholders instead of inventing facts. **Nothing is sent to an AI service automatically**; a person pastes it and reviews the result,
- the customer gets a receipt. There is no file upload: the logo and photos are taken from the social media links the customer gives in the brief, or found by the team from their socials / Google listing if they leave it blank (the form says they agree to this). Only if there is nothing usable online does the team ask the customer for photos, by hand. The customer is never asked for socials or photos automatically.

The team email says: do not start the first design until the agreement is signed and the deposit has cleared.

## The history
- **`/studio/quotes`** lists every website quote: status (issued → accepted → agreement sent → signed, or declined / lapsed), whether the email was sent, whether the brief is in, and the full package and brief. Team members can change the status only; the database locks everything else.
- **Local records:** `scripts/file-record.mjs` files the two email attachments into `~/Documents/motion-visual-records/quotes/` (outside the repo, because it holds customer data).
- Keep the status up to date: the table is the history.

## From quote to agreement
In `/studio/quotes`, open a quote and press **Create agreement from this quote**. The agreement editor opens with the client, title, the included items from the quote, the total and the standard payments (about 25% deposit rounded up to £5, balance within 7 days of the finished site) already filled in. **Check the client type** (consumer or business): the website doesn't ask, and it changes the customer's cancellation rights. Saving the draft moves the quote to *accepted* and notes the agreement reference. (A quote honoured on old terms, such as MV-Q-001, needs its payments set by hand: don't use the 25% button.)

## Retention
Quotes and briefs are kept from when they're issued to the end of the financial year, then deleted **if they never became a client** (status issued / declined / lapsed). Quotes that were accepted, had an agreement sent, or were signed are kept (contract records). Invoices are separate accounting records, kept six years.
- Migration `20261022130000_web_quotes_retention.sql` adds `web_quotes_purge(month, day, dry_run)`. It is a **dry run by default** and returns how many rows it would delete. Run for real with `select public.web_quotes_purge(7, 31, false);` (the defaults are already 7 and 31). Each real run writes one count-only row to `web_quote_retention_log`.
- The year-end is **31 July** (7, 31): Companies House shows MOTION VISUAL STUDIOS LTD (SC895834) incorporated 13 July 2026 with first accounts made up to 31 July 2027. So a quote issued any time up to 31 July 2027 is kept until then; one issued from 1 August 2027 is kept until 31 July 2028. If the accounting reference date ever changes, pass the new month and day.
- Nothing is scheduled automatically. To run it monthly with pg_cron (enable the extension in Supabase first): `select cron.schedule('web-quotes-retention', '0 3 1 * *', $$select public.web_quotes_purge(7, 31, false)$$);`
- The CRM `leads` table is **not** covered.

## Rolling back
`supabase/rollbacks/*.down.sql` undo each migration (retention first, then the quotes table). The quotes rollback deletes all quote history: export it first.

## Checking a deploy
`node scripts/check-deploy.mjs https://motion-visual.com` checks the routes, the real 404s, the JSON error responses and the security headers. It sends no email.

`node scripts/check-widget-stable.mjs https://motion-visual.com` (needs a temporary `npm install --no-save playwright`) types into the quote form like a person and checks the Turnstile widget is created once and keeps its token. On the live site the widget shows a "Verify you are human" checkbox to an automated browser, so a missing token there is reported but not a failure; use `--require-token` with a local build made with Cloudflare's test key (`VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA`). It exists because the widget was once rebuilt on every keystroke (a fresh callback function on each render), which automated `fill()`-style tests cannot see. It sends no email.

## Tests
`npm test` runs the pricing tests and the quote-request tests (fake Resend, Supabase and Turnstile). The database tests need `npm install --no-save @electric-sql/pglite` and are skipped without it. See `tests/README.md`. The advisory-lock fix for the rate limits is checked for presence, not exercised under real concurrency.

## Setting it up

Status 2026-10-23: **both migrations are applied to production, and this code is live on motion-visual.com** (PRs #1 and #2 merged). Still to do: the Turnstile secret (step 2 below) and a real test quote. Nothing is scheduled for the retention purge yet.
Do these **in this order**:

1. **Apply the migrations** `20261022120000_add_web_quotes.sql` then `20261022130000_web_quotes_retention.sql` to the motionvisual-admin project (after the agreements migration, which they depend on). Try them on a Supabase branch first. No new secret: it reuses `AGREEMENTS_SERVER_KEY` and its vault hash. Check with `select count(*) from public.web_quotes;`. Until it's applied the form still works (fallback reference, no history, no rate limits, no brief link).
2. **Turnstile (the bot check).** The widget exists (hostnames motion-visual.com and www.motion-visual.com; site key `0x4AAAAAAFiWrcBZ3jw6Y6IF`, which is public). The live site is built by Cloudflare from GitHub (project **`motion-visual-git`**), so:
   - set `VITE_TURNSTILE_SITE_KEY` as a **Production build variable** on `motion-visual-git` *before* the build that contains the quote-automation code runs (the key is baked in at build time);
   - merge so the new build deploys (merging to `main` deploys automatically);
   - **then** set the `TURNSTILE_SECRET_KEY` **secret** on `motion-visual-git` (Production).
   Setting the secret before the new build is live makes every form submission fail, because the old site sends no token. With no secret the server skips the check, so the order above is safe. If the widget can't run (script blocked, a hostname not allowed on the widget such as preview sites, an old browser) the form still records the enquiry in the CRM and just doesn't send an automatic quote.
3. `RESEND_API_KEY` and `AGREEMENTS_SERVER_KEY` must be Production secrets on **`motion-visual-git`** (the live project). `RESEND_API_KEY` is there; **`AGREEMENTS_SERVER_KEY` is not yet** (it is only on the old `motion-visual` project). The quotes database uses the same key as the agreements system, so until it is added the quote still goes out but with a fallback reference, no history, no rate limits and no brief link.
4. These are test-only and must stay **unset** in production: `RESEND_API_URL`, `SUPABASE_URL_OVERRIDE`, `TURNSTILE_VERIFY_URL`.
5. Deploy: **merging to `main` deploys to motion-visual.com automatically** (project `motion-visual-git`, Git-connected); every pushed branch gets a preview build that has no secrets. `npx wrangler pages deploy` only updates the separate `motion-visual` project (pages.dev), not the live domain. The deploy also ships `functions/_middleware.ts` and `public/_routes.json` (real 404s).

## Prices
Edit `src/pricing.ts` only; the add-ons builder and the server both read it. Quote email wording is in `server/quotes.ts`.

## Tests that were run (local only, with mocks)
- The migration in PGlite (24 checks: key check, sequence, both rate limits, one brief per quote, RLS, column-level grants).
- The real Pages Functions under `wrangler pages dev` against a PGlite-backed RPC shim, a mock Resend and a mock Turnstile verifier.
- Cloudflare's published always-pass Turnstile test keys against the real widget and the real verification endpoint.

## Abuse protection
- Turnstile (bot check) and the per-email / per-IP limits in the database protect the quote path.
- The **scoping-call path** (Flagship, shop, e-commerce) has no database limit. Add a Cloudflare rate-limiting rule (exact values in docs/LAUNCH-CHECKLIST.md). It only covers traffic through motion-visual.com: requests sent straight to the `*.pages.dev` address skip your zone's rules, so Turnstile and the database limits are the real protection and the rule is a second layer.
- Turnstile **fails open** when `TURNSTILE_SECRET_KEY` is unset (so the form works before it's set up). A mistyped secret name silently turns the check off: confirm with a test request after setting it.

## Known limits
- No file upload on the brief form.
- The Turnstile widget only appears when `VITE_TURNSTILE_SITE_KEY` is set at build time.
- Quote status is updated by hand in `/studio/quotes`; nothing moves it automatically when an agreement is signed.
- `lapsed` is not set automatically after 14 days.
