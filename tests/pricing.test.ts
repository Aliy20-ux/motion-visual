import { test } from 'node:test';
import assert from 'node:assert/strict';
import { depositPence } from '../src/legal/format';
import { ADD_ONS, EXTRA_PAGE_PRICE, MAX_EXTRA_PAGES, PLANS, PLAN_PAGES, PLAN_PRICE, buildQuote, depositFor, gbp, priceFor, suggestFor } from '../src/pricing';

test('plan prices and page allowances', () => {
  assert.equal(PLAN_PRICE.Essential, 800);
  assert.equal(PLAN_PRICE.Signature, 1600);
  assert.equal(PLAN_PAGES.Essential, 1);
  assert.equal(PLAN_PAGES.Signature, 5);
  assert.equal(EXTRA_PAGE_PRICE, 80);
});

test('deposit is exactly 25% of the build price, with no rounding', () => {
  const cases: [number, number][] = [[800, 200], [875, 218.75], [955, 238.75], [1049, 262.25], [1050, 262.5], [1300, 325], [1460, 365], [1600, 400], [1924, 481], [2000, 500], [2200, 550], [1, 0.25]];
  for (const [total, deposit] of cases) assert.equal(depositFor(total), deposit, `deposit for £${total}`);
  for (let total = 1; total <= 5000; total++) {
    const d = depositFor(total);
    assert.equal(d, total / 4, `£${total} deposit is exactly a quarter`);
    assert.equal(Math.round(d * 100) / 100, d, `£${total} deposit £${d} is a whole number of pence`);
  }
});

test('the studio (pence) and the website (pounds) always agree on the deposit', () => {
  for (let total = 1; total <= 5000; total++) {
    assert.equal(depositPence(total * 100), Math.round(depositFor(total) * 100), `£${total}`);
  }
});

test('money prints with pence only when there are pence', () => {
  assert.equal(gbp(220), '£220');
  assert.equal(gbp(1049), '£1,049');
  assert.equal(gbp(218.75), '£218.75');
  assert.equal(gbp(212.5), '£212.50');
});

test('base plans', () => {
  for (const plan of PLANS) {
    const r = buildQuote({ plan, extraPages: 0, addOnIds: [] });
    assert.ok(r.ok);
    if (!r.ok) return;
    assert.equal(r.quote.totalPounds, PLAN_PRICE[plan]);
    assert.equal(r.quote.depositPounds + r.quote.balancePounds, r.quote.totalPounds);
    assert.equal(r.quote.pagesTotal, PLAN_PAGES[plan]);
    assert.equal(r.quote.lines.length, 1);
  }
});

test('worked examples match what the customer is emailed', () => {
  const a = buildQuote({ plan: 'Essential', extraPages: 2, addOnIds: ['order-lite', 'local-seo'] });
  assert.ok(a.ok && a.quote.totalPounds === 1460 && a.quote.depositPounds === 365 && a.quote.balancePounds === 1095);
  const b = buildQuote({ plan: 'Signature', extraPages: 0, addOnIds: ['booking', 'order-full'] });
  assert.ok(b.ok && b.quote.totalPounds === 2200 && b.quote.depositPounds === 550);
  const c = buildQuote({ plan: 'Essential', extraPages: 0, addOnIds: ['ai-chatbox'] });
  assert.ok(c.ok && c.quote.totalPounds === 1049 && c.quote.depositPounds === 262.25 && c.quote.balancePounds === 786.75);
});

test('add-ons a plan already includes cost nothing and are labelled included', () => {
  const r = buildQuote({ plan: 'Signature', extraPages: 0, addOnIds: ['order-lite'] });
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.quote.totalPounds, 1600);
  const line = r.quote.lines.find(l => l.label.includes('Lite'));
  assert.equal(line?.pounds, 0);
  assert.match(line?.note ?? '', /included/);
});

test('add-ons a plan cannot buy are refused, not silently dropped', () => {
  for (const id of ['order-full', 'confirmations', 'booking', 'editor']) {
    const r = buildQuote({ plan: 'Essential', extraPages: 0, addOnIds: [id] });
    assert.equal(r.ok, false, `${id} on Essential`);
    if (!r.ok) assert.match(r.error, /isn't available on Essential/);
  }
});

test('Flagship-territory requests are not quotable', () => {
  const r = buildQuote({ plan: 'Signature', extraPages: 0, addOnIds: ['shop'] });
  assert.deepEqual(r, { ok: false, error: 'Flagship request' });
});

test('invalid input is rejected', () => {
  const bad: [string, { plan: unknown; extraPages: unknown; addOnIds: unknown }][] = [
    ['Flagship plan', { plan: 'Flagship', extraPages: 0, addOnIds: [] }],
    ['unknown plan', { plan: 'Gold', extraPages: 0, addOnIds: [] }],
    ['negative pages', { plan: 'Essential', extraPages: -1, addOnIds: [] }],
    ['too many pages', { plan: 'Essential', extraPages: MAX_EXTRA_PAGES + 1, addOnIds: [] }],
    ['fractional pages', { plan: 'Essential', extraPages: 1.5, addOnIds: [] }],
    ['string pages', { plan: 'Essential', extraPages: '2', addOnIds: [] }],
    ['add-ons not an array', { plan: 'Essential', extraPages: 0, addOnIds: 'gallery' }],
    ['non-string add-on', { plan: 'Essential', extraPages: 0, addOnIds: [1] }],
    ['duplicate add-on', { plan: 'Essential', extraPages: 0, addOnIds: ['gallery', 'gallery'] }],
    ['unknown add-on', { plan: 'Essential', extraPages: 0, addOnIds: ['nope'] }],
  ];
  for (const [name, input] of bad) assert.equal(buildQuote(input).ok, false, name);
});

test('the catalogue is internally consistent', () => {
  const ids = ADD_ONS.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length, 'unique ids');
  for (const a of ADD_ONS) {
    if (a.flagship) assert.equal(a.price, undefined, `${a.id}: Flagship items are quoted on a call`);
    else assert.ok(Number.isInteger(a.price) && a.price! > 0, `${a.id} has a whole-pound price`);
    assert.ok(a.plans.length > 0, `${a.id} is buyable somewhere`);
    for (const p of a.includedIn ?? []) assert.ok(a.plans.includes(p), `${a.id} included in a plan that can see it`);
  }
  assert.equal(ADD_ONS.find(a => a.id === 'ai-chatbox')?.price, 249, 'AI chatbox price confirmed by the owner');
});

test('browser pricing (priceFor), server pricing (buildQuote) and the quote lines always agree', () => {
  for (const plan of PLANS) {
    const buyable = ADD_ONS.filter(a => !a.flagship && a.plans.includes(plan));
    for (let mask = 0; mask < 1 << buyable.length; mask++) {
      const picked = buyable.filter((_, i) => mask & (1 << i)).map(a => a.id);
      for (const extraPages of [0, 1, 3, MAX_EXTRA_PAGES]) {
        const r = buildQuote({ plan, extraPages, addOnIds: picked });
        assert.ok(r.ok, `${plan} ${picked.join(',')} +${extraPages}`);
        if (!r.ok) continue;
        const expected = priceFor(plan, PLAN_PAGES[plan] + extraPages, picked);
        const fromLines = r.quote.lines.reduce((s, l) => s + (l.pounds ?? 0), 0);
        assert.equal(r.quote.totalPounds, expected, `${plan} total vs priceFor`);
        assert.equal(fromLines, expected, `${plan} sum of lines vs total`);
        assert.equal(r.quote.depositPounds, depositFor(expected));
        assert.equal(r.quote.balancePounds, expected - r.quote.depositPounds);
      }
    }
  }
});

test('plan suggestions', () => {
  assert.equal(suggestFor('Essential', 1, []), null);
  assert.equal(suggestFor('Essential', 3, ['gallery']), null, 'well under £1,300');
  // Essential at £1,300 or more is within £300 of Signature.
  const s = suggestFor('Essential', 1, ['order-lite', 'local-seo']);
  assert.deepEqual(s, { to: 'Signature', total: 1300, signatureTotal: 1850 });
  assert.equal(suggestFor('Signature', 5, []), null);
  assert.deepEqual(suggestFor('Essential', 1, ['shop']), { to: 'Flagship', reason: 'shop' });
  assert.deepEqual(suggestFor('Signature', 5, ['shop']), { to: 'Flagship', reason: 'shop' });
  assert.deepEqual(suggestFor('Signature', 5, ['order-full', 'booking', 'editor', 'local-seo', 'ai-chatbox']), { to: 'Flagship', reason: 'large' }, 'Signature at £2,600+ suggests a call');
});

test('a Signature build over the Flagship threshold is a scoping call for the browser AND is flagged so the request says Flagship', () => {
  // Signature + 12 extra pages + one add-on: £2,560 + £75 = £2,635. The panel says "Flagship call"; AddOns.tsx then
  // sends plan "Flagship", which quote-request.ts turns into a scoping-call email instead of an automatic quote.
  const s = suggestFor('Signature', PLAN_PAGES.Signature + 12, ['gallery']);
  assert.equal(s?.to, 'Flagship');
  assert.equal(priceFor('Signature', PLAN_PAGES.Signature + 12, ['gallery']), 2635);
});
