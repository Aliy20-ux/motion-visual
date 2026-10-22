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
- the customer gets a receipt asking them to email their logo and photos quoting the reference. File upload is not built.

The team email says: do not start the first design until the agreement is signed and the deposit has cleared.

## The history
- **`/studio/quotes`** lists every website quote: status (issued → accepted → agreement sent → signed, or declined / lapsed), whether the email was sent, whether the brief is in, and the full package and brief. Team members can change the status only; the database locks everything else.
- **Local records:** `scripts/file-record.mjs` files the two email attachments into `~/Documents/motion-visual-records/quotes/` (outside the repo, because it holds customer data).
- Keep the status up to date: the table is the history.

## Setting it up (nothing here is deployed or applied yet)
Do these **in this order**:

1. **Apply the migration** `supabase/migrations/20261022120000_add_web_quotes.sql` to the motionvisual-admin project (after the agreements migration, which it depends on). No new secret: it reuses `AGREEMENTS_SERVER_KEY` and its vault hash. Check with `select count(*) from public.web_quotes;`. Until it's applied the form still works (fallback reference, no history, no rate limits, no brief link).
2. **Turnstile (the bot check):** Cloudflare dashboard → Turnstile → add a widget for `motion-visual.com` (Managed). Then:
   - set `VITE_TURNSTILE_SITE_KEY` in `.env` (and in the Pages build variables if you build there), rebuild and **deploy the new build first**;
   - **then** set the secret: `printf %s "$SECRET" | npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name motion-visual`.
   Setting the secret before the new build is live makes every form submission fail, because the old site sends no token. With no secret the server skips the check, so the order above is safe.
3. `RESEND_API_KEY` and `AGREEMENTS_SERVER_KEY` already exist as Pages secrets.
4. These are test-only and must stay **unset** in production: `RESEND_API_URL`, `SUPABASE_URL_OVERRIDE`, `TURNSTILE_VERIFY_URL`.
5. Deploy: `npm run build` (needs `.env`), then `npx wrangler pages deploy dist`. The deploy now also ships `functions/_middleware.ts` and `public/_routes.json` (real 404s).

## Prices
Edit `src/pricing.ts` only; the add-ons builder and the server both read it. Quote email wording is in `server/quotes.ts`.

## Tests that were run (local only, with mocks)
- The migration in PGlite (24 checks: key check, sequence, both rate limits, one brief per quote, RLS, column-level grants).
- The real Pages Functions under `wrangler pages dev` against a PGlite-backed RPC shim, a mock Resend and a mock Turnstile verifier.
- Cloudflare's published always-pass Turnstile test keys against the real widget and the real verification endpoint.

## Known limits
- No file upload on the brief form.
- The Turnstile widget only appears when `VITE_TURNSTILE_SITE_KEY` is set at build time.
- Quote status is updated by hand in `/studio/quotes`; nothing moves it automatically when an agreement is signed.
- `lapsed` is not set automatically after 14 days.
