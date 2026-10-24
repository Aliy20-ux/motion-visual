import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BALANCE_DUE_DAYS, CARE_PLANS, DEPOSIT, QUOTE_VALID_DAYS, buildCommercialTerms, carePriceLabel } from '../src/commercial';
import { cancellationSections, POLICY_UPDATED, POLICY_VERSION } from '../src/legal/policy';
import { depositPence } from '../src/legal/format';
import { depositFor } from '../src/pricing';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const terms = () => buildCommercialTerms({ version: POLICY_VERSION, updated: POLICY_UPDATED });

test('the published terms file is up to date (run `npm run sync-terms` if this fails)', () => {
  assert.deepEqual(JSON.parse(read('docs/commercial-terms.json')), JSON.parse(JSON.stringify(terms())));
  assert.ok(read('docs/commercial-terms.sql').includes(`'${POLICY_VERSION}'`), 'the SQL carries the current policy version');
});

test('care plan prices', () => {
  assert.equal(carePriceLabel('essential'), '£49.99');
  assert.equal(carePriceLabel('signature'), '£79.99');
  assert.equal(carePriceLabel('flagship'), 'From £129.99');
});

test('no document still shows an old care plan price', () => {
  const files = ['src/components/site/Pricing.tsx', 'src/legal/policy.ts', 'src/legal/terms.ts', 'src/pages/Terms.tsx', 'server/quotes.ts', 'src/components/site/FAQ.tsx'];
  for (const f of files) {
    const text = read(f);
    assert.ok(!/£79(?![.\d])/.test(text), `${f} has a bare £79`);
    assert.ok(!/£129(?![.\d])/.test(text), `${f} has a bare £129`);
    assert.ok(!/gbp\(79\)|carePlanPrice: 79,/.test(text), `${f} hard-codes the Signature care price`);
  }
});

test('the legal policy shows the same care plan prices as the source', () => {
  const policy = JSON.stringify(cancellationSections('business'));
  for (const label of ['£49.99', '£79.99', 'From £129.99']) assert.ok(policy.includes(label), `policy mentions ${label}`);
  assert.ok(policy.includes(DEPOSIT.rule) || !policy.includes('deposit is 25%'), 'policy uses the shared deposit rule');
});

test('every document states the deposit rule the same way', () => {
  for (const f of ['src/legal/terms.ts', 'src/pages/Terms.tsx', 'src/components/site/Pricing.tsx', 'server/quotes.ts']) {
    assert.ok(!read(f).includes('nearest £5'), `${f} has no rounding wording`);
    assert.ok(read(f).includes('25% of the build price'), `${f} states the deposit rule`);
  }
  assert.equal(DEPOSIT.rule, '25% of the build price');
});

test('the deposit constants really describe the deposit calculation', () => {
  for (let total = 1; total <= 5000; total++) {
    const expected = (total * DEPOSIT.percent) / 100;
    assert.equal(depositFor(total), expected, `£${total}`);
    assert.equal(depositPence(total * 100), Math.round(expected * 100), `£${total} in pence`);
  }
});

test('the published terms carry every add-on with the same price the quote builder charges', () => {
  const t = terms();
  const lite = t.addOns.find(a => a.id === 'order-lite')!;
  assert.equal(lite.price, 250);
  assert.deepEqual(lite.includedIn, ['Signature']);
  assert.equal(t.addOns.find(a => a.id === 'shop')!.scopedOnACall, true);
  assert.equal(t.addOns.find(a => a.id === 'shop')!.price, null);
  assert.equal(t.addOns.length, 10);
});

test('the published terms carry the plans, deposit examples and the three policy pages', () => {
  const t = terms();
  assert.deepEqual(t.carePlans.map(p => [p.key, p.price]), [['essential', 49.99], ['signature', 79.99], ['flagship', 129.99]]);
  assert.deepEqual(t.deposit.examples.find(e => e.total === 1600), { total: 1600, deposit: 400, balance: 1200 });
  assert.equal(t.quoteValidDays, QUOTE_VALID_DAYS);
  assert.equal(t.balanceDueDays, BALANCE_DUE_DAYS);
  assert.deepEqual(t.documents.map(d => d.key), ['terms', 'privacy', 'cancellation']);
  assert.equal(Object.keys(CARE_PLANS).length, 3);
});
