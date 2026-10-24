# Tests

    npm test

Runs with Node's built-in test runner (no extra packages). `tests/register.mjs` lets Node import the TypeScript source directly.

| File | What it covers |
|---|---|
| `pricing.test.ts` | `src/pricing.ts`: plan prices, deposit rule (exactly 25%), add-on eligibility, validation, and that the browser (`priceFor`) and server (`buildQuote`) can never disagree |
| `quote-request.test.ts` | `POST /api/quote-request` against a fake Resend, Supabase and Turnstile: pricing, call-vs-quote, bot checks, Turnstile, rate limits, database-down fallback, email content and injection safety |
| `db.test.ts` | The SQL migrations (web quotes, retention) and their rollbacks in a real Postgres engine. **Skipped unless PGlite is installed:** `npm install --no-save @electric-sql/pglite` (don't commit it) |
