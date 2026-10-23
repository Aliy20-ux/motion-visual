#!/usr/bin/env node
/**
 * check-widget-stable.mjs — types into the quote form the way a person does (one character at a time) and checks
 * that the Turnstile bot-check widget is created ONCE and keeps its token. A widget that is rebuilt on every
 * keystroke floods Cloudflare with challenges and can lose the token; automated tests that set a field's value
 * in one go (Playwright's fill()) never see it. Nothing is submitted and no email is sent.
 *
 *   npm install --no-save playwright        (temporary; don't commit it)
 *   node scripts/check-widget-stable.mjs https://motion-visual.com
 *   node scripts/check-widget-stable.mjs http://127.0.0.1:4173 --require-token
 *       (a local build made with VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA, Cloudflare's test key, which works
 *        on any hostname and passes by itself)
 *
 * PASS means the widget was created once, never lost a token and caused no extra Cloudflare requests. Whether a token
 * is present at the end is reported but only enforced with --require-token: the live widget is in "managed" mode and
 * shows a "Verify you are human" checkbox to an automated browser, which this script never clicks.
 */
const url = process.argv[2];
const requireToken = process.argv.includes('--require-token');
if (!/^https?:\/\//.test(url ?? '')) { console.error('usage: node scripts/check-widget-stable.mjs <url>'); process.exit(1); }
let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.error('playwright is not installed: npm install --no-save playwright'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let challengeRequests = 0;
page.on('request', r => { if (/challenges\.cloudflare\.com\/cdn-cgi\/challenge-platform/.test(r.url())) challengeRequests++; });
await page.route('**/rest/v1/leads*', r => r.abort());
await page.goto(url, { waitUntil: 'load' });
await page.locator('#quote').scrollIntoViewIfNeeded();
await page.waitForTimeout(4000);

const ids = new Set();
let tokenDrops = 0;
let hadToken = false;
const sample = async () => {
  const s = await page.evaluate(() => { const e = document.querySelector('[name="cf-turnstile-response"]'); return { id: e?.id ?? null, hasToken: Boolean(e?.value) }; });
  if (s.id) ids.add(s.id);
  if (hadToken && !s.hasToken) tokenDrops++;
  if (s.hasToken) hadToken = true;
  return s;
};
const first = await sample();
if (!first.id) { console.error('FAIL: no Turnstile widget on the page (is VITE_TURNSTILE_SITE_KEY set for this build?)'); await browser.close(); process.exit(1); }
const before = challengeRequests;
const timer = setInterval(() => sample().catch(() => {}), 120);
await page.locator('#name').pressSequentially('Alexandra Montgomery-Smith', { delay: 90 });
await page.locator('#email').pressSequentially('alexandra.montgomery@example.com', { delay: 90 });
await page.waitForTimeout(1500);
clearInterval(timer);
const last = await sample();
await browser.close();

const extra = challengeRequests - before;
console.log(`widget instances while typing: ${ids.size} | token lost: ${tokenDrops} times | extra Cloudflare challenge requests: ${extra} | token at the end: ${last.hasToken}`);
const stable = ids.size === 1 && tokenDrops === 0 && extra === 0;
if (!stable) console.log('FAIL: the widget is being rebuilt while typing (see src/components/site/Turnstile.tsx)');
else if (!last.hasToken && requireToken) console.log('FAIL: the widget is stable but never produced a token (expected one with Cloudflare\'s test key)');
else console.log(`PASS: the widget is stable${last.hasToken ? '' : ' (no token yet: normal for the live managed widget, which waits for a click on "Verify you are human")'}`);
process.exit(stable && (last.hasToken || !requireToken) ? 0 : 1);
