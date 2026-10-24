// Runs the project tracker migration in a real Postgres engine (PGlite). Skipped unless it is installed:
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
const CLIENT = '00000000-0000-4000-8000-0000000000c1';
const P1 = '00000000-0000-4000-8000-000000000001'; // with a sent (unsigned) agreement
const P2 = '00000000-0000-4000-8000-000000000002'; // with a signed agreement, live
const P3 = '00000000-0000-4000-8000-000000000003'; // no agreement
const A1 = '00000000-0000-4000-8000-0000000000a1';
const A2 = '00000000-0000-4000-8000-0000000000a2';

describe('project tracker migration', { skip }, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  const as = (who: 'team' | 'nobody') => db.exec(`select set_config('test.team', '${who === 'team' ? 'on' : ''}', false), set_config('test.uid', '${who === 'team' ? '00000000-0000-4000-8000-0000000000f1' : ''}', false)`);
  const fails = async (fn: () => Promise<unknown>) => { try { await fn(); return null; } catch (e) { return (e as { message: string }).message; } };
  const open = (t: string, key = KEY) => db.query('select public.project_tracker_open($1,$2) as r', [key, t]).then((x: { rows: { r: any }[] }) => x.rows[0].r); // eslint-disable-line @typescript-eslint/no-explicit-any
  const ensure = (p: string) => db.query('select public.ensure_project_tracker($1) as t', [p]).then((x: { rows: { t: string }[] }) => x.rows[0].t);

  before(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon nologin; create role authenticated nologin;
      grant usage on schema public to anon, authenticated;
      create schema vault; create table vault.decrypted_secrets (name text, decrypted_secret text);
      create schema extensions;
      create function extensions.digest(t text, algo text) returns bytea language sql as $$ select sha256(convert_to(t, 'UTF8')) $$;
      create function extensions.gen_random_bytes(n int) returns bytea language sql as $$ select decode(substr(md5(random()::text) || md5(random()::text) || md5(random()::text), 1, n * 2), 'hex') $$;
      create schema auth; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
      create function public.is_team_member() returns boolean language sql stable as $$ select coalesce(current_setting('test.team', true), '') = 'on' $$;
      create table public.team_members (id uuid primary key);
      create table public.clients (id uuid primary key, business_name text not null, email text);
      create table public.agreements (id uuid primary key, status text, signed_at timestamptz, access_token text, expires_at timestamptz);
      create table public.projects (id uuid primary key, client_id uuid references public.clients(id), name text, build_stage text, launch_date date, agreement_id uuid references public.agreements(id));
      insert into public.team_members values ('00000000-0000-4000-8000-0000000000f1');
      insert into public.clients values ('${CLIENT}', 'Mon Ami Chesser', 'amira@example.com');
      insert into public.agreements values ('${A1}', 'sent', null, '${'1'.repeat(48)}', now() + interval '10 days'), ('${A2}', 'signed', '2026-10-19 10:00+01', '${'2'.repeat(48)}', null);
      insert into public.projects values ('${P1}', '${CLIENT}', 'Site one', 'Discovery', null, '${A1}'), ('${P2}', '${CLIENT}', 'Site two', 'Live', '2026-10-30', '${A2}'), ('${P3}', '${CLIENT}', 'Site three', 'Build', null, null);
    `);
    await db.query(`insert into vault.decrypted_secrets values ('agreements_server_key_sha256', $1)`, [createHash('sha256').update(KEY).digest('hex')]);
    const agr = file('migrations', '20261015120000_add_client_agreements.sql');
    await db.exec(agr.slice(agr.indexOf('create or replace function public.agreement_server_key_ok'), agr.indexOf('revoke all on function public.agreement_server_key_ok')));
    await db.exec(file('migrations', '20261025100000_project_tracker.sql'));
  });

  test('only the team can make a link or set the details', async () => {
    await as('nobody');
    assert.equal(await fails(() => ensure(P1)), 'not_authorised');
    assert.equal(await fails(() => db.query(`select public.set_project_tracker($1, null, 'x')`, [P1])), 'not_authorised');
    await as('team');
    assert.equal(await fails(() => ensure('00000000-0000-4000-8000-0000000000ff')), 'not_found');
  });

  test('the link is made once and is the same every time', async () => {
    const a = await ensure(P1); const b = await ensure(P1);
    assert.match(a, /^[0-9a-f]{48}$/); assert.equal(a, b);
    assert.notEqual(await ensure(P2), a);
  });

  test('the client page needs the server key, and an unknown link is not_found', async () => {
    const t = await ensure(P1);
    assert.equal(await fails(() => open(t, 'nope')), 'not_authorised');
    assert.equal(await fails(() => open('0'.repeat(48))), 'not_found');
  });

  test('before signing: shows the stage, the agreement status and the signing link, with no email address', async () => {
    const r = await open(await ensure(P1));
    assert.equal(r.projectName, 'Site one'); assert.equal(r.businessName, 'Mon Ami Chesser'); assert.equal(r.stage, 'Discovery');
    assert.equal(r.agreement.status, 'sent'); assert.equal(r.agreement.signToken, '1'.repeat(48)); assert.equal(r.agreement.signedOn, null);
    assert.equal(r.contentReceivedOn, null); assert.match(r.today, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!JSON.stringify(r).includes('amira@example.com'));
  });

  test('a signed agreement shows its signing date and never offers the signing link again', async () => {
    const r = await open(await ensure(P2));
    assert.equal(r.agreement.status, 'signed'); assert.equal(r.agreement.signedOn, '2026-10-19'); assert.equal(r.agreement.signToken, null);
    assert.equal(r.launchDate, '2026-10-30');
  });

  test('an expired agreement link is not offered', async () => {
    await db.exec(`update public.agreements set expires_at = now() - interval '1 day' where id = '${A1}'`);
    assert.equal((await open(await ensure(P1))).agreement.signToken, null);
    await db.exec(`update public.agreements set expires_at = now() + interval '10 days' where id = '${A1}'`);
  });

  test('a project with no agreement still works', async () => {
    const r = await open(await ensure(P3));
    assert.equal(r.agreement, null); assert.equal(r.stage, 'Build');
  });

  test('the team sets the content date and a note; control characters go, long notes and far-future dates are refused', async () => {
    await as('team');
    await db.query(`select public.set_project_tracker($1, '2026-10-20', $2)`, [P1, '  Waiting on your logo\u0007 please  ']);
    const r = await open(await ensure(P1));
    assert.equal(r.contentReceivedOn, '2026-10-20'); assert.equal(r.note, 'Waiting on your logo please');
    assert.equal(await fails(() => db.query(`select public.set_project_tracker($1, null, $2)`, [P1, 'x'.repeat(301)])), 'note_too_long');
    assert.equal(await fails(() => db.query(`select public.set_project_tracker($1, '2099-01-01', null)`, [P1])), 'date_in_future');
    await db.query(`select public.set_project_tracker($1, null, '')`, [P1]);
    const cleared = await open(await ensure(P1));
    assert.equal(cleared.contentReceivedOn, null); assert.equal(cleared.note, null);
  });

  test('the review link appears only when the project is live and the reviews migration has been run', async () => {
    const t = await ensure(P2);
    assert.equal((await open(t)).reviewToken, null, 'no reviews tables yet');
    await db.exec(`create table public.review_requests (project_id uuid primary key, access_token text);
                   insert into public.review_requests values ('${P2}', '${'9'.repeat(48)}'), ('${P1}', '${'8'.repeat(48)}')`);
    assert.equal((await open(t)).reviewToken, '9'.repeat(48), 'live project');
    assert.equal((await open(await ensure(P1))).reviewToken, null, 'not live: never offered');
  });

  test('browser roles cannot touch the table; the rollback removes everything and the migration applies twice', async () => {
    await db.exec('set role anon');
    assert.ok(await fails(() => db.query('select * from public.project_trackers')), 'anon cannot read');
    await db.exec('reset role');
    await db.exec('set role authenticated'); await as('team');
    assert.ok(await fails(() => db.exec(`update public.project_trackers set note = 'x'`)), 'team cannot write directly');
    assert.ok((await db.query('select count(*)::int as n from public.project_trackers')).rows[0].n >= 1, 'team can read');
    await db.exec('reset role');
    await db.exec(file('migrations', '20261025100000_project_tracker.sql'));
    await db.exec(file('rollbacks', '20261025100000_project_tracker.down.sql'));
    assert.equal((await db.query(`select count(*)::int as n from pg_class where relname = 'project_trackers'`)).rows[0].n, 0);
    assert.equal((await db.query(`select count(*)::int as n from pg_proc where proname in ('ensure_project_tracker','set_project_tracker','project_tracker_open')`)).rows[0].n, 0);
  });
});
