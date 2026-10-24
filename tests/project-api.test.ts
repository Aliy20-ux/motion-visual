import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost as open } from '../functions/api/project/open';

const RPC = 'https://ndnapekhhnrbqddfqpdh.supabase.co/rest/v1/rpc/';
const real = globalThis.fetch;
let calls: { fn: string; args: Record<string, unknown> }[];
let result: { status?: number; body: unknown };
beforeEach(() => {
  calls = []; result = { body: { projectName: 'Site' } };
  globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
    const url = String(input);
    if (!url.startsWith(RPC)) throw new Error('unexpected fetch ' + url);
    calls.push({ fn: url.slice(RPC.length), args: JSON.parse(String(init?.body)) });
    return new Response(JSON.stringify(result.body), { status: result.status ?? 200 });
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = real; });

const env = { RESEND_API_KEY: 'k', AGREEMENTS_SERVER_KEY: 'test-server-key' };
const post = (body: unknown, e: object = env) =>
  open({ request: new Request('https://motion-visual.com/api/project/open', { method: 'POST', body: JSON.stringify(body) }), env: e } as never).then(async r => ({ status: r.status, json: await r.json() as Record<string, any> })); // eslint-disable-line @typescript-eslint/no-explicit-any
const TOKEN = 'c'.repeat(48);

test('a malformed link is a 404 and never reaches the database', async () => {
  for (const token of ['', 'abc', 'Z'.repeat(48), undefined]) assert.equal((await post({ token })).status, 404);
  assert.equal(calls.length, 0);
});

test('a good link returns the project from the database, with the server key', async () => {
  const r = await post({ token: TOKEN });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { project: { projectName: 'Site' } });
  assert.deepEqual(calls[0], { fn: 'project_tracker_open', args: { p_key: 'test-server-key', p_token: TOKEN } });
});

test('an unknown link is a friendly 404', async () => {
  result = { status: 400, body: { message: 'not_found', code: 'P0001' } };
  const r = await post({ token: TOKEN });
  assert.equal(r.status, 404);
  assert.match(r.json.error, /couldn’t find this project page/);
});

test('if the database or key is unavailable the page says so without exposing details', async () => {
  result = { status: 500, body: { message: 'relation "project_trackers" does not exist', code: '42P01' } };
  const r = await post({ token: TOKEN });
  assert.equal(r.status, 500);
  assert.ok(!JSON.stringify(r.json).includes('project_trackers'));
  const off = await post({ token: TOKEN }, { RESEND_API_KEY: 'k' });
  assert.equal(off.status, 503);
});
