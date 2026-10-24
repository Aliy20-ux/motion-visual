# One source for prices and terms

Everything that appears in more than one document lives in `src/commercial.ts` (care plans, deposit rule, payment and
quote days, fees) and `src/pricing.ts` (packages, extra pages, add-ons). The website pages, the legal wording, the quote
emails and the admin all read from them, so a number can't differ between documents.

## Changing a price or term
1. Edit `src/commercial.ts` (or `src/pricing.ts`). If the wording of a legal document changes, bump `POLICY_VERSION` in `src/legal/policy.ts`: new agreements carry the new version, signed ones keep the old.
2. `npm run sync-terms` rewrites `docs/commercial-terms.json` and `docs/commercial-terms.sql`.
3. `npm test`. It fails if any page, policy, quote email or published file still shows an old price or a different deposit rule.
4. Admin: copy `docs/commercial-terms.json` to the admin repo's `src/generated/commercialTerms.json`, and run `docs/commercial-terms.sql` in the Supabase SQL editor (once, after the `commercial_terms` migration is applied). The admin's Documents page then shows the new version.

## What the admin does with the add-ons
The published terms include every add-on with its price and which plans can buy it or already include it. The admin's Quotes page prices a manual quote from them, so a quote made by hand always matches the website's quote builder.

## What is not yet generated from the source
The reply-time wording in the care plan text and a few fixed amounts inside legal sentences (for example Keep-alive £30, the £150 handover fee, the 40% and 70% cancellation stages) are still written out in `src/legal/policy.ts` and `src/pages/Terms.tsx`. Their values are in `src/commercial.ts` and the published terms, and `tests/commercial.test.ts` guards the prices; move the rest across as they change.
