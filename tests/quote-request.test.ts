import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/quote-request';
import { callQuoteRequest, installFakeBackend } from './helpers/fake-backend';

type Backend = ReturnType<typeof installFakeBackend>;
let backend: Backend;
beforeEach(() => { backend = installFakeBackend(); });
afterEach(() => backend.restore());

const valid = (over: Record<string, unknown> = {}) => ({
  name: 'Aisha Khan', email: 'aisha@example.com', phone: '07000 000000', project_type: 'New Website', budget: 'Essential — £800',
  notes: 'I run a bakery', plan: 'Essential', extraPages: 0, addOnIds: [], elapsedMs: 9000, ...over,
});
const post = (body: unknown, opts?: Parameters<typeof callQuoteRequest>[2]) => callQuoteRequest(onRequestPost as never, body, opts);
const decode = (b64: string) => Buffer.from(b64, 'base64').toString('utf8');

test('an Essential quote is priced on the server, saved, and emailed to the customer and the team', async () => {
  const r = await post(valid({ extraPages: 2, addOnIds: ['order-lite', 'local-seo'] }));
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { mode: 'quote', ref: 'MV-W-0001', customerEmailSent: true });
  assert.equal(backend.state.emails.length, 2);
  const [customer, team] = backend.state.emails;
  assert.deepEqual(customer.to, ['aisha@example.com']);
  assert.equal(customer.subject, 'Your Motion Visual quote MV-W-0001');
  for (const text of ['£1,460', '£365', '£1,095', 'Interactive order builder (Lite)', 'Local SEO Boost']) assert.ok(customer.html.includes(text), `customer email has ${text}`);
  assert.match(customer.html, /\/brief\/[0-9a-f]{48}/, 'brief link');
  assert.deepEqual(team.to, ['aliy20@hotmail.co.uk']);
  assert.equal(team.reply_to, 'aisha@example.com');
  assert.deepEqual(team.attachments?.map(a => a.filename), ['MV-W-0001.json', 'MV-W-0001-quote-email.html']);
  assert.equal(decode(team.attachments![1].content), customer.html, 'the attached HTML is exactly what the customer received');
  const record = JSON.parse(decode(team.attachments![0].content));
  assert.equal(record.ref, 'MV-W-0001');
  assert.equal(record.totalPounds, 1460);
  assert.equal(record.recordedInDatabase, true);
  const saved = backend.state.quotes[0].args;
  assert.equal(saved.p_total_pence, 146000);
  assert.equal(saved.p_deposit_pence, 36500);
  assert.equal(backend.state.quotes[0].emailSent, true, 'delivery recorded');
});

test('client-supplied totals are ignored', async () => {
  const r = await post(valid({ totalPounds: 1, total: 1, price: 1, depositPounds: 1 }));
  assert.equal(r.status, 200);
  assert.equal(backend.state.quotes[0].args.p_total_pence, 80000);
});

test('ineligible, unknown, duplicate and out-of-range requests are refused and send nothing', async () => {
  const bad = [
    valid({ addOnIds: ['booking'] }),            // Signature-only add-on on Essential
    valid({ addOnIds: ['nope'] }),
    valid({ addOnIds: ['gallery', 'gallery'] }),
    valid({ extraPages: 99 }),
    valid({ extraPages: -1 }),
    valid({ plan: 'Gold' }),
  ];
  for (const body of bad) {
    const r = await post(body, { ip: `198.51.100.${Math.floor(Math.random() * 250)}` });
    assert.equal(r.status, 400, JSON.stringify(body));
  }
  assert.equal(backend.state.emails.length, 0);
  assert.equal(backend.state.quotes.length, 0);
});

test('Flagship, shop and e-commerce requests become a scoping-call email only', async () => {
  for (const body of [valid({ plan: 'Flagship' }), valid({ plan: 'Signature', addOnIds: ['shop'] }), valid({ project_type: 'E-commerce' })]) {
    backend.state.emails.length = 0;
    const r = await post(body);
    assert.deepEqual(r.json, { mode: 'call' });
    assert.equal(backend.state.emails.length, 1);
    assert.deepEqual(backend.state.emails[0].to, ['aliy20@hotmail.co.uk']);
    assert.match(backend.state.emails[0].subject, /^Scoping call request/);
  }
  assert.equal(backend.state.quotes.length, 0, 'no quote row for a call request');
});

test('a form completed faster than a person could is silently ignored', async () => {
  for (const elapsedMs of [0, 100, 2499, undefined, '9000']) {
    const r = await post(valid({ elapsedMs }));
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { mode: 'call' });
  }
  assert.equal(backend.state.emails.length, 0);
  assert.equal(backend.state.quotes.length, 0);
});

test('field validation', async () => {
  const bad = [
    valid({ name: '' }), valid({ name: 'x'.repeat(121) }),
    valid({ email: 'not-an-email' }), valid({ email: 'a@b.co\r\nBcc: victim@example.com' }), valid({ email: 'a b@example.com' }),
    valid({ project_type: '' }), valid({ notes: 'x'.repeat(4001) }), valid({ phone: 'x'.repeat(41) }),
  ];
  for (const body of bad) assert.equal((await post(body)).status, 400, JSON.stringify(body).slice(0, 80));
  assert.equal((await post('not json')).status, 400);
  assert.equal(backend.state.emails.length, 0);
});

test('Turnstile: enforced for quotes and call requests once the secret is set', async () => {
  const env = { TURNSTILE_SECRET_KEY: 'secret' };
  assert.equal((await post(valid(), { env })).status, 400, 'no token');
  assert.equal((await post(valid({ turnstileToken: 'bad' }), { env })).status, 400, 'bad token');
  assert.equal((await post(valid({ plan: 'Flagship' }), { env })).status, 400, 'call request also needs a token');
  assert.equal(backend.state.emails.length, 0);
  const ok = await post(valid({ turnstileToken: 'good-token' }), { env });
  assert.equal(ok.status, 200);
  assert.equal(ok.json.mode, 'quote');
  // A request with no token is refused without asking Cloudflare; the other two are verified with it.
  assert.equal(backend.state.turnstileCalls, 2);
});

test('Turnstile is skipped when no secret is configured', async () => {
  const r = await post(valid());
  assert.equal(r.status, 200);
  assert.equal(backend.state.turnstileCalls, 0);
});

test('rate limits: a 4th quote to one email, and a 6th from one IP, get a 429 and send nothing', async () => {
  for (let i = 0; i < 3; i++) assert.equal((await post(valid(), { ip: `192.0.2.${i + 1}` })).status, 200);
  const before = backend.state.emails.length;
  const r = await post(valid(), { ip: '192.0.2.99' });
  assert.equal(r.status, 429);
  assert.deepEqual(r.json, { error: 'rate_limited' });
  assert.equal(backend.state.emails.length, before);

  for (let i = 0; i < 5; i++) assert.equal((await post(valid({ email: `ip${i}@example.com` }), { ip: '192.0.2.50' })).status, 200);
  assert.equal((await post(valid({ email: 'ip5@example.com' }), { ip: '192.0.2.50' })).status, 429);
});

test('if the database is unreachable the quote still goes out, with a fallback reference and no brief link', async () => {
  backend.state.dbDown = true;
  const r = await post(valid());
  assert.equal(r.status, 200);
  assert.equal(r.json.mode, 'quote');
  assert.match(String(r.json.ref), /^MV-W-\d{8}-[A-Z2-9]{4}$/);
  const [customer, team] = backend.state.emails;
  assert.doesNotMatch(customer.html, /\/brief\//);
  assert.match(team.html, /NOT saved to the database/);
  assert.equal(JSON.parse(decode(team.attachments![0].content)).recordedInDatabase, false);
});

test('the same fallback applies when the server key is not configured', async () => {
  const r = await post(valid(), { env: { AGREEMENTS_SERVER_KEY: '' } });
  assert.equal(r.status, 200);
  assert.match(String(r.json.ref), /^MV-W-\d{8}-/);
});

test('customer email failing does not lose the quote: the team is told it was not delivered', async () => {
  backend.state.failEmailTo.add('aisha@example.com');
  const r = await post(valid());
  assert.deepEqual({ mode: r.json.mode, sent: r.json.customerEmailSent }, { mode: 'quote', sent: false });
  assert.equal(backend.state.emails.length, 1);
  assert.match(backend.state.emails[0].html, /NOT SENT — send it manually/);
  assert.equal(backend.state.quotes[0].emailSent, false);
});

test('if every email fails the request fails loudly', async () => {
  backend.state.failEmailTo.add('aisha@example.com');
  backend.state.failEmailTo.add('aliy20@hotmail.co.uk');
  assert.equal((await post(valid())).status, 502);
});

test('customer-supplied text cannot inject HTML or email headers', async () => {
  const evil = '<img src=x onerror=alert(1)>';
  await post(valid({ name: `${evil}\r\nBcc: victim@example.com`, notes: `</pre><script>alert(1)</script>` }));
  const [customer, team] = backend.state.emails;
  assert.ok(!customer.html.includes('<img src=x'), 'customer email escapes the name');
  assert.ok(!team.html.includes('<img src=x'), 'team email escapes the name');
  assert.ok(!team.html.includes('<script>alert(1)</script>'), 'team email escapes the notes');
  assert.ok(!/[\r\n]/.test(team.subject), 'team subject is a single line');
  assert.ok(!/[\r\n]/.test(customer.subject));
});

test('the customer quote email makes the promises the policy makes — and no more', async () => {
  await post(valid());
  const html = backend.state.emails[0].html;
  for (const text of ['valid until', '14 days', 'isn\'t a contract', 'Cancellation', 'Motion Visual Studios Limited', 'SC895834', '48-hour target', '£49.99', '£79.99']) {
    assert.ok(html.includes(text.replace("'", "'")) || html.includes(text), `mentions ${text}`);
  }
  assert.doesNotMatch(html, /guarantee(d)? (a )?(rank|result)/i);
  assert.doesNotMatch(html, /\bAI\b/);
});

test('control characters (NUL) are refused up front — they must never reach, and break, the database call', async () => {
  for (const body of [valid({ notes: 'a\u0000b' }), valid({ name: 'Aisha\u0000' }), valid({ project_type: 'x\u0007y' }), valid({ phone: '07\u001f' })]) {
    assert.equal((await post(body)).status, 400, JSON.stringify(body));
  }
  assert.equal(backend.state.emails.length, 0);
  assert.equal(backend.state.quotes.length, 0);
  // Ordinary line breaks in the notes are fine.
  assert.equal((await post(valid({ notes: 'line one\nline two\r\nline three\ttabbed' }))).status, 200);
});

test('if the database rejects the input, no quote is sent (it would also skip the rate limits)', async () => {
  backend.state.dbRejectCode = '22P05';
  const r = await post(valid());
  assert.equal(r.status, 400);
  assert.equal(backend.state.emails.length, 0);
});

test('if the migration is not applied yet (function missing) the quote still goes out with a fallback reference', async () => {
  backend.state.dbMissingFunction = true;
  const r = await post(valid());
  assert.equal(r.status, 200);
  assert.match(String(r.json.ref), /^MV-W-\d{8}-/);
  assert.equal(backend.state.emails.length, 2);
});

test('a network failure sending the customer email is "not sent", not a crash: the team still gets the record', async () => {
  backend.state.throwEmailTo.add('aisha@example.com');
  const r = await post(valid());
  assert.equal(r.status, 200);
  assert.equal(r.json.customerEmailSent, false);
  assert.equal(backend.state.emails.length, 1);
  assert.deepEqual(backend.state.emails[0].to, ['aliy20@hotmail.co.uk']);
  assert.match(backend.state.emails[0].html, /NOT SENT — send it manually/);
});
