// Runs the assistant usage-limits migration in a real Postgres engine (PGlite). Skipped unless it is installed:
//   npm install --no-save @electric-sql/pglite      (do not commit it)
import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PGlite: any;
try { ({ PGlite } = await import('@electric-sql/pglite')); } catch { /* not installed */ }
const skip = PGlite ? false : 'PGlite not installed — run: npm install --no-save @electric-sql/pglite';

const file = (dir: string, name: string) => readFileSync(new URL(`../supabase/${dir}/${name}`, import.meta.url), 'utf8');
const KEY = 'test-server-key';
const A = 'a'.repeat(64);
const B = 'b'.repeat(64);

describe('assistant usage limits', { skip }, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  before(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon nologin; create role authenticated nologin;
      grant usage on schema public to anon, authenticated;
      create schema vault; create table vault.decrypted_secrets (name text, decrypted_secret text);
      create schema extensions;
      create function extensions.digest(t text, algo text) returns bytea language sql as $$ select sha256(convert_to(t, 'UTF8')) $$;
    `);
    await db.query(`insert into vault.decrypted_secrets values ('agreements_server_key_sha256', $1)`, [createHash('sha256').update(KEY).digest('hex')]);
    const agr = file('migrations', '20261015120000_add_client_agreements.sql');
    await db.exec(agr.slice(agr.indexOf('create or replace function public.agreement_server_key_ok'), agr.indexOf('revoke all on function public.agreement_server_key_ok')));
    await db.exec(file('migrations', '20261024190000_assistant_usage.sql'));
  });
  const allow = (ip = A, kind = 'chat', consume = true, key = KEY) =>
    db.query('select public.assistant_allow($1,$2,$3,$4) as r', [key, ip, kind, consume]).then((x: { rows: { r: string }[] }) => x.rows[0].r);
  const fails = async (fn: () => Promise<unknown>) => { try { await fn(); return null; } catch (e) { return (e as { message: string }).message; } };

  test('a wrong server key is refused, and so are malformed requests', async () => {
    assert.equal(await fails(() => allow(A, 'chat', true, 'nope')), 'not_authorised');
    assert.equal(await fails(() => allow(A, 'phone')), 'bad_kind');
    assert.equal(await fails(() => allow('short')), 'bad_visitor');
  });

  test('30 chat messages an hour per visitor, then ip_limit; another visitor is unaffected', async () => {
    for (let i = 0; i < 30; i++) assert.equal(await allow(A), 'ok', `message ${i + 1}`);
    assert.equal(await allow(A), 'ip_limit');
    assert.equal(await allow(B), 'ok');
  });

  test('checking without consuming does not use up anyone\'s allowance', async () => {
    const before = (await db.query('select count(*)::int as n from public.assistant_usage')).rows[0].n;
    await allow(B, 'chat', false); await allow(B, 'chat', false);
    assert.equal((await db.query('select count(*)::int as n from public.assistant_usage')).rows[0].n, before);
    assert.equal(await allow(A, 'chat', false), 'ip_limit', 'a visitor over the limit is reported as such');
  });

  test('hand-offs have their own, smaller allowance: 5 an hour', async () => {
    for (let i = 0; i < 5; i++) assert.equal(await allow(A, 'handoff'), 'ok');
    assert.equal(await allow(A, 'handoff'), 'ip_limit');
  });

  test('usage older than an hour stops counting', async () => {
    await db.exec(`update public.assistant_usage set created_at = now() - interval '2 hours' where ip_hash = '${A}'`);
    assert.equal(await allow(A), 'ok');
    assert.equal(await allow(A, 'handoff'), 'ok');
  });

  test('the whole site is capped at 1,500 chat messages a day (hand-offs are not, so a real lead is never lost)', async () => {
    await db.exec(`delete from public.assistant_usage`);
    await db.exec(`insert into public.assistant_usage (ip_hash, kind) select md5(g::text) || md5(g::text), 'chat' from generate_series(1, 1500) g`);
    assert.equal(await allow('c'.repeat(64)), 'daily_limit');
    assert.equal(await allow('c'.repeat(64), 'handoff'), 'ok');
    await db.exec(`update public.assistant_usage set created_at = now() - interval '25 hours' where kind = 'chat'`);
    assert.equal(await allow('c'.repeat(64)), 'ok', 'a new day starts fresh');
  });

  test('rows older than two days are tidied away', async () => {
    await db.exec(`insert into public.assistant_usage (ip_hash, kind, created_at) values ('${'d'.repeat(64)}', 'chat', now() - interval '3 days')`);
    await allow('e'.repeat(64));
    assert.equal((await db.query(`select count(*)::int as n from public.assistant_usage where created_at < now() - interval '2 days'`)).rows[0].n, 0);
  });

  test('the browser roles cannot read or write the table; the rollback removes everything', async () => {
    await db.exec('set role anon');
    assert.ok(await fails(() => db.query('select * from public.assistant_usage')), 'anon cannot read');
    assert.ok(await fails(() => db.exec(`insert into public.assistant_usage (ip_hash, kind) values ('x', 'chat')`)), 'anon cannot write');
    await db.exec('reset role');
    await db.exec(file('migrations', '20261024190000_assistant_usage.sql')); // applies twice
    await db.exec(file('rollbacks', '20261024190000_assistant_usage.down.sql'));
    assert.equal((await db.query(`select count(*)::int as n from pg_class where relname = 'assistant_usage'`)).rows[0].n, 0);
    assert.equal((await db.query(`select count(*)::int as n from pg_proc where proname = 'assistant_allow'`)).rows[0].n, 0);
  });
});
