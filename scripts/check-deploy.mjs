#!/usr/bin/env node
/**
 * check-deploy.mjs — run after a deploy (or against `wrangler pages dev dist`) to confirm the routing, the real
 * 404 handling and the security headers behave. It sends NO email and writes NO data: every POST is deliberately
 * invalid and must be refused.
 *
 *   node scripts/check-deploy.mjs https://motion-visual.com
 *   node scripts/check-deploy.mjs http://127.0.0.1:8788
 */
const base = (process.argv[2] ?? '').replace(/\/$/, '');
if (!/^https?:\/\//.test(base)) { console.error('usage: node scripts/check-deploy.mjs <base url>'); process.exit(1); }

const results = [];
const check = (ok, name, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  ← ${detail}`}`); };
const get = (path, init) => fetch(base + path, { redirect: 'manual', ...init });
const token = 'a'.repeat(48);

// Real pages: 200 and HTML
for (const path of ['/', '/privacy', '/terms', '/cancellation', '/studio', '/studio/quotes', `/agreement/${token}`, `/brief/${token}`, '/Terms', '/terms/']) {
  const r = await get(path);
  check(r.status === 200 && (r.headers.get('content-type') ?? '').includes('text/html'), `${path} -> 200 html`, `${r.status} ${r.headers.get('content-type')}`);
}

// Unknown URLs: a real 404, still serving the app shell so the in-app not-found page renders
for (const path of ['/nope', '/terms/extra', '/brief', '/agreement', '/studio-x', '/api/nope', '/api/quote-request']) {
  const r = await get(path);
  check(r.status === 404, `${path} -> 404`, String(r.status));
}
{
  const r = await get('/definitely-not-a-page');
  check(r.status === 404 && (await r.text()).includes('id="root"'), 'a 404 still serves the app shell (so the not-found page renders)');
}

// Static files are untouched by the middleware
for (const [path, type] of [['/robots.txt', 'text/plain'], ['/sitemap.xml', 'xml'], ['/favicon.svg', 'svg'], ['/hero-poster.jpg', 'image/jpeg']]) {
  const r = await get(path);
  check(r.status === 200 && (r.headers.get('content-type') ?? '').includes(type), `${path} -> 200 ${type}`, `${r.status} ${r.headers.get('content-type')}`);
}

// APIs answer with JSON errors (never a 500, never the HTML shell) and send nothing
const post = (path, body) => get(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
{
  const r = await post('/api/quote-request', {});
  check(r.status === 400 && (r.headers.get('content-type') ?? '').includes('json'), 'POST /api/quote-request {} -> 400 json', `${r.status} ${r.headers.get('content-type')}`);
  const v = await post('/api/brief/view', { token: 'nope' });
  check(v.status === 404 && (v.headers.get('content-type') ?? '').includes('json'), 'POST /api/brief/view bad token -> 404 json', `${v.status}`);
  const s = await post('/api/brief/submit', { token: 'nope', brief: {} });
  check(s.status === 404, 'POST /api/brief/submit bad token -> 404', String(s.status));
}

// Security headers reach pages (including through the middleware) and the Turnstile widget is allowed
for (const path of ['/', '/brief/' + token, '/nope']) {
  const csp = (await get(path)).headers.get('content-security-policy') ?? '';
  check(csp.includes("default-src 'self'") && csp.includes('https://challenges.cloudflare.com') && csp.includes("frame-ancestors 'none'"), `${path} has the CSP (incl. Turnstile)`, csp.slice(0, 80) || 'no CSP header');
}
{
  const h = (await get('/')).headers;
  check(Boolean(h.get('strict-transport-security')) || !base.startsWith('https'), 'HSTS on https');
  check(h.get('x-content-type-options') === 'nosniff' && h.get('x-frame-options') === 'DENY', 'nosniff + X-Frame-Options');
}

const failed = results.filter(r => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed${failed ? ' — FIX BEFORE ANNOUNCING' : ''}`);
process.exit(failed ? 1 : 0);
