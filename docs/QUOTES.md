# Automatic quotes

When a visitor submits the quote form, `POST /api/quote-request` (`functions/api/quote-request.ts`) does this:

| Request | Result |
|---|---|
| Essential or Signature, with or without add-ons | Prices it from `src/pricing.ts` (the client's numbers are never trusted), emails the customer a quote (`MV-W-YYYYMMDD-XXXX`, valid 14 days) and emails `admin.team@` the brief plus two attachments: `<ref>.json` and `<ref>-quote-email.html` |
| Flagship, an online shop / ordering add-on, or project type "E-commerce" | No quote. `admin.team@` gets a "Scoping call request" |
| Invalid, ineligible or unknown add-ons, bad page counts | 400, nothing sent |
| Form completed in under 2.5s | 200, nothing sent (bot shaped) |

The quote is **not a contract**. The customer replies to go ahead, you send a Project Agreement from `/studio`, and the deposit (about 25%, rounded up to £5) is paid on signing. The 48-hour first-design target runs from the signed agreement + content, not from the quote email.

## Prices
Edit `src/pricing.ts` only. The add-ons builder and the server both read it. Quote wording lives in `server/quotes.ts`.

## Filing the history
Use `scripts/file-record.mjs` (see the comment at the top of the file) to move the two attachments into `~/Documents/motion-visual-records/quotes/`. Records are kept out of the repo on purpose.

## Needs setting up before it can run in production
- `RESEND_API_KEY` Pages secret (already used by the agreements emails).
- `RESEND_API_URL` must stay **unset** in production (it only exists so tests can point at a mock).
- The Supabase `leads` insert from the form is unchanged.

## Known limits
- Anyone can enter any email address, so the form can send one quote email to a third party per submission. There is a honeypot and a timing check, but no per-IP rate limit or CAPTCHA (add Cloudflare Turnstile or a rate-limiting rule before heavy traffic).
- Quote numbers are random, not sequential, and the team email is the only durable server-side copy. A database table (`quotes`) would give a sequence and a history in `/studio`; it is not built.
- There is no post-deposit "first design brief" form yet. The team email lists what to ask for.
