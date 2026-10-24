import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost as open } from '../functions/api/review/open';
import { onRequestPost as submit } from '../functions/api/review/submit';
import { onRequestPost as google } from '../functions/api/review/google';
import { onRequestGet as list } from '../functions/api/reviews';

// A stand-in for Supabase's review_* functions and Resend. The SQL itself is covered by reviews-db.test.ts.
const KEY = 'test-server-key';
const TOKEN = 'a'.repeat(48);
const RPC = 'https://ndnapekhhnrbqddfqpdh.supabase.co/rest/v1/rpc/';
type Call = { fn: string; args: Record<string, unknown> };
const real = globalThis.fetch;
let calls: Call[];
let emails: { to: string[]; subject: string; html: string }[];
let rpcResult: (fn: string, args: Record<string, unknown>) => { status?: number; body: unknown };

beforeEach(() => {
  calls = []; emails = [];
  rpcResult = (fn) => ({ body: fn === 'review_submit' ? { ok: true, googleReviewUrl: 'https://g.page/r/abc/review' } : null });
  globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
    const url = String(input);
    if (url === 'https://api.resend.com/emails') { emails.push(JSON.parse(String(init?.body))); return new Response('{"id":"x"}'); }
    if (url.startsWith(RPC)) {
      const fn = url.slice(RPC.length);
      const args = JSON.parse(String(init?.body));
      calls.push({ fn, args });
      assert.equal(args.p_key, KEY, 'server key is always sent');
      const out = rpcResult(fn, args);
      return new Response(JSON.stringify(out.body), { status: out.status ?? 200 });
    }
    throw new Error('unexpected fetch ' + url);
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = real; });

const env = { RESEND_API_KEY: 'k', AGREEMENTS_SERVER_KEY: KEY };
const post = (fn: typeof open | typeof submit | typeof google, body: unknown, e: object = env) =>
  fn({ request: new Request('https://motion-visual.com/api/x', { method: 'POST', body: JSON.stringify(body) }), env: e } as never).then(async r => ({ status: r.status, json: await r.json() as Record<string, any> })); // eslint-disable-line @typescript-eslint/no-explicit-any
const dbError = (message: string, status = 400) => ({ status, body: { message, code: 'P0001' } });
const good = { token: TOKEN, rating: 5, body: 'Brilliant.', name: 'Amira', business: 'Mon Ami', consent: true };

test('a malformed link is a 404 and never reaches the database', async () => {
  for (const token of ['', 'abc', 'g'.repeat(48), 'A'.repeat(48), undefined]) {
    assert.equal((await post(open, { token })).status, 404);
    assert.equal((await post(submit, { ...good, token })).status, 404);
  }
  assert.equal(calls.length, 0);
});

test('opening a review link returns what the database says', async () => {
  rpcResult = () => ({ body: { status: 'open', clientName: 'Amira', projectName: 'Site' } });
  const r = await post(open, { token: TOKEN });
  assert.equal(r.status, 200);
  assert.equal(r.json.review.status, 'open');
  assert.deepEqual(calls, [{ fn: 'review_open', args: { p_key: KEY, p_token: TOKEN } }]);
});

test('an unknown link is a 404 with friendly wording', async () => {
  rpcResult = () => dbError('not_found');
  const r = await post(open, { token: TOKEN });
  assert.equal(r.status, 404);
  assert.match(r.json.error, /couldn’t find this review link/);
});

test('submitting saves the review, returns the Google link, and tells the team', async () => {
  const r = await post(submit, good);
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { ok: true, googleReviewUrl: 'https://g.page/r/abc/review' });
  assert.deepEqual(calls[0], { fn: 'review_submit', args: { p_key: KEY, p_token: TOKEN, p_rating: 5, p_body: 'Brilliant.', p_name: 'Amira', p_business: 'Mon Ami', p_consent: true } });
  assert.equal(emails.length, 1);
  assert.deepEqual(emails[0].to, ['admin.team@motion-visual.com']);
  assert.match(emails[0].subject, /5-star review from Amira/);
  assert.ok(emails[0].html.includes('Brilliant.') && emails[0].html.includes('admin.motion-visual.com/reviews'));
});

test('a 1-star review gets exactly the same Google link and the same treatment as a 5-star one', async () => {
  const five = await post(submit, good);
  const one = await post(submit, { ...good, rating: 1, body: 'Not happy.' });
  assert.equal(one.status, 200);
  assert.equal(one.json.googleReviewUrl, five.json.googleReviewUrl);
  assert.equal(emails.length, 2);
});

test('the team email escapes whatever the client typed', async () => {
  await post(submit, { ...good, name: '<script>alert(1)</script>', body: '<img src=x onerror=alert(1)>' });
  assert.ok(!emails[0].html.includes('<script>alert(1)</script>'));
  assert.ok(!emails[0].html.includes('<img src=x'));
  assert.ok(emails[0].html.includes('&lt;script&gt;'));
});

test('a review that did not consent says so in the team email', async () => {
  await post(submit, { ...good, consent: false });
  assert.equal(calls[0].args.p_consent, false);
  assert.match(emails[0].html, /did not<\/em> agree/);
});

test('bad input is refused before the database: rating, NUL bytes, wrong types', async () => {
  for (const rating of [0, 6, 4.5, '5', null, undefined]) assert.equal((await post(submit, { ...good, rating })).status, 400, String(rating));
  assert.equal((await post(submit, { ...good, body: 'a\u0000b' })).status, 400);
  assert.equal((await post(submit, { ...good, name: 'a\u0000b' })).status, 400);
  assert.equal(calls.length, 0);
  await post(submit, { ...good, body: 123, name: ['x'], business: {}, consent: 'yes' });
  assert.equal(calls[0].args.p_body, '');
  assert.equal(calls[0].args.p_consent, false, 'only a real true counts as consent');
});

test('database refusals reach the client in plain English, and no email is sent', async () => {
  for (const [code, text] of [['already_submitted', /already left a review/], ['expired', /expired/], ['invalid_name', /add your name/], ['not_found', /couldn’t find/]] as const) {
    rpcResult = () => dbError(code);
    const r = await post(submit, good);
    assert.match(r.json.error, text, code);
  }
  assert.equal(emails.length, 0);
});

test('if the team email fails the review is still saved and the client sees success', async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: unknown, init?: unknown) => {
    if (String(input) === 'https://api.resend.com/emails') throw new TypeError('network down');
    return (prev as typeof fetch)(input as string, init as RequestInit);
  }) as typeof fetch;
  const r = await post(submit, good);
  assert.equal(r.status, 200);
  assert.equal(r.json.ok, true);
});

test('without the server key set, reviews are "not available", not a crash', async () => {
  const r = await post(open, { token: TOKEN }, { RESEND_API_KEY: 'k' });
  assert.equal(r.status, 503);
  assert.match(r.json.error, /aren’t available/);
});

test('the Google click is recorded best-effort and never errors for the client', async () => {
  assert.equal((await post(google, { token: TOKEN })).json.ok, true);
  assert.equal(calls[0].fn, 'review_google_clicked');
  rpcResult = () => dbError('boom', 500);
  assert.equal((await post(google, { token: TOKEN })).json.ok, true);
  assert.equal((await post(google, { token: 'bad' })).status, 404);
});

test('the public list returns approved reviews, is cached, and fails safe to an empty list', async () => {
  const sample = { count: 2, average: 4.5, reviews: [{ id: '1', name: 'Amira', business: null, rating: 5, body: 'Great', date: '2026-10-24', featured: true }] };
  rpcResult = () => ({ body: sample });
  const ok = await list({ env } as never);
  assert.deepEqual(await ok.json(), sample);
  assert.match(ok.headers.get('Cache-Control') ?? '', /s-maxage=300/);
  rpcResult = () => dbError('boom', 500);
  const bad = await list({ env } as never);
  assert.equal(bad.status, 200);
  assert.deepEqual(await bad.json(), { count: 0, average: null, reviews: [] });
  const none = await list({ env: { RESEND_API_KEY: 'k' } } as never);
  assert.deepEqual(await none.json(), { count: 0, average: null, reviews: [] });
});
