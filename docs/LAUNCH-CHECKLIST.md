# Launch checklist — what still needs a person

Nothing on `pricing-addons-update` / `quote-automation` is deployed, and neither migration is applied. This file tracks
everything that is waiting on the owner or on a third party, so nothing is forgotten and nothing is published with a
blank in it. Tick items off here when they're done. (Last updated 2026-10-22.)

## 1. Before merging
- [ ] **Merge order.** Production already runs the agreements system (live since 18 Oct), but its commit (`64f42fc`) is not in `main`: it is only on the PR #1 branch. Until PR #1 merges, **do not deploy from `main`** (it would remove the agreements system). Order: merge `origin/main` into the branch (currently clean) → PR #1 → `quote-automation`.
- [ ] PR #1's description still describes the old £100-deposit version: update it.
- [ ] Solicitor review of `src/legal/*`, `Terms.tsx`, `Cancellation.tsx`, `Privacy.tsx`: deposit forfeiture and the staged fees for consumers after their 14 days (Consumer Rights Act fairness), the "no interest" position for business clients (Late Payment of Commercial Debts (Interest) Act 1998), the 48-hour-target refund remedy, and the Privacy Policy (it no longer mentions that brief details may be processed by an outside AI tool — your decision, but UK data protection normally expects processors to be named).
- [ ] Day-0 wording: the 14-day clock starts at signed agreement + brief; the Terms and team email also say work starts once the deposit has cleared. With a bank transfer the clock can run before the deposit lands. Decide if that matters.

## 2. Setting it up (in this order — see docs/QUOTES.md)
- [ ] Apply `20261022120000_add_web_quotes.sql` then `20261022130000_web_quotes_retention.sql` to **a Supabase branch first**, check the security advisor, then to motionvisual-admin. Rollbacks: `supabase/rollbacks/`.
- [ ] Turnstile: create the widget, build with `VITE_TURNSTILE_SITE_KEY`, deploy, **then** set the `TURNSTILE_SECRET_KEY` secret.
- [ ] Cloudflare **rate-limiting rule** on `/api/quote-request` and `/api/brief/*` (e.g. 10 requests per 10 seconds per IP). The scoping-call path (Flagship / shop / e-commerce) has no database limit, so this rule and Turnstile are its only protection.
- [ ] Send one **real** quote to your own inbox. Check it isn't in spam, the logo loads (it is served from motion-visual.com), and the brief link works. Make sure SPF, DKIM and DMARC are set for motion-visual.com in Resend. Nothing has been tested against the real Resend or Supabase: only fakes.
- [ ] After every deploy: `node scripts/check-deploy.mjs https://motion-visual.com` (sends no email).
- [ ] Add a Resend dashboard check or alert: if sending fails the customer sees an error and nobody is told.

## 3. Money (NatWest business account — expected to open **Tuesday 27 October 2026**)
- [ ] Bank details (account name, sort code, account number) → add to `quote-template.html` / `invoice-template.html` (the yellow `[BANK DETAILS]` blanks stop a PDF being rendered until then) and decide how customers are told where to pay the deposit. Do **not** publish them anywhere before the account is live.
- [ ] Direct Debit for care plans: a bank account alone doesn't collect Direct Debits. Decide whether to use a collection provider (e.g. GoCardless, which pays out to any UK bank account) or apply to NatWest for a Bacs Direct Debit facility (an approval process). The template's `[DIRECT DEBIT PROVIDER]` blank and the care plan wording ("paid by Direct Debit") depend on this.
- [ ] ICO data protection fee, and professional indemnity / liability insurance.

## 4. Data and records
- [ ] **Retention rule** (owner decision 2026-10-22): quotes and briefs are kept from issue to the end of the financial year, then deleted if they never became a client. Confirm the **accounting reference date** — the default in `web_quotes_purge` is 5 April (UK tax year end), a placeholder. Then schedule it (docs/QUOTES.md).
- [ ] **CRM leads are not covered.** The quote form also writes a lead into the CRM `leads` table; the purge doesn't touch it. Apply the same rule there, or the Privacy Policy's retention wording won't be true for those copies.
- [ ] Invoices are accounting records: keep them six years (they live in `~/Documents/motion-visual-records/invoices`, outside the retention rule).
- [ ] MV-1008 (Texture Lounge): its printed date (15 July 2026) is earlier than the deposit (11 Aug) and care plan (Sept) it mentions. Confirm the real issue date.

## 5. Sweets 'N' Treats — MV-Q-001 (honour on the terms as issued)
- [ ] If they accept: Ready-made site agreement; payments by hand (deposit **£100**, balance £700 / £1,000 — not the 25% button); summary "As quoted in MV-Q-001 (issued 19 October 2026)"; care plan £50 per month (3-month minimum) written into the project details. Valid to 2 November 2026. Full notes in the record: `~/Documents/motion-visual-records/quotes/MV-Q-001_SweetsNTreats/record.json`.

## 6. Decisions still open
- [ ] **Perks — kept unpublished** until decided: testimonial discount (£50 off for a review + portfolio permission), referral (one free month of care per referred client), founding-client rate (first 20 clients, rate not defined). Where would they appear, and what exactly is the founding rate?
- [ ] Prices/terms to confirm (from the brief): 3-month minimum care term, 25% deposit, £400 minimum upgrade fee, cancellation percentages, £129 Flagship care, £15 small update, £150 handover fee, the Flagship £2,600 call threshold, the AI chatbox add-on (£249, confirmed).
- [ ] Project Agreement draft and the quote/invoice templates are in `~/Documents/motion-visual-quote-template/` (use `render.mjs`).

## 7. Known gaps (not built)
- No file upload on the brief form (logo/photos come from the customer's socials or Google listing).
- Quote status isn't updated automatically when an agreement is signed, and quotes don't become "lapsed" after 14 days.
- The Google Fonts stylesheet is blocked by the site's content-security policy on production (pre-existing): custom fonts probably aren't loading for real visitors.
- Cloudflare Pages Functions run for every page view now (`public/_routes.json` includes `/*`); watch the free-plan request quota.
