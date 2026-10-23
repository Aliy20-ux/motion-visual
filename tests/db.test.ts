// Runs the SQL migrations in a real Postgres engine (PGlite). Skipped unless it is installed:
//   npm install --no-save @electric-sql/pglite      (do not commit it)
// PGlite is a single connection, so the advisory-lock race fix is checked for presence, not exercised concurrently.
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function freshDb(): Promise<any> {
  const db = new PGlite();
  // Stand-ins for the Supabase pieces the migrations depend on.
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    grant usage on schema public to anon, authenticated;
    create schema vault; create table vault.decrypted_secrets (name text, decrypted_secret text);
    create schema extensions;
    create function extensions.digest(t text, algo text) returns bytea language sql as $$ select sha256(convert_to(t, 'UTF8')) $$;
    create function public.is_team_member() returns boolean language sql stable as $$ select coalesce(current_setting('test.team', true), '') = 'on' $$;
  `);
  await db.query(`insert into vault.decrypted_secrets values ('agreements_server_key_sha256', $1)`, [createHash('sha256').update(KEY).digest('hex')]);
  // The real key check, taken from the agreements migration.
  const agr = file('migrations', '20261015120000_add_client_agreements.sql');
  await db.exec(agr.slice(agr.indexOf('create or replace function public.agreement_server_key_ok'), agr.indexOf('revoke all on function public.agreement_server_key_ok')));
  return db;
}

const UP_QUOTES = '20261022120000_add_web_quotes.sql';
const UP_RETENTION = '20261022130000_web_quotes_retention.sql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const create = (db: any, o: { key?: string; ip?: string; email?: string; notes?: string; issuedOn?: string } = {}) => db.query(
  `select public.web_quote_create($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,coalesce($15::date, current_date),coalesce($15::date, current_date) + 14) as r`,
  [o.key ?? KEY, o.ip ?? 'ip-a', 'Test Person', o.email ?? 'a@example.com', '0700', 'New Website', o.notes ?? 'notes', 'Essential', 2, ['gallery'],
    JSON.stringify([{ label: 'Essential plan', pounds: 800 }]), 97500, 25000, 72500, o.issuedOn ?? null]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fails = async (fn: () => Promise<any>) => { try { await fn(); return null; } catch (e) { return e as { message: string; code?: string }; } };

describe('web quotes migration', { skip }, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  before(async () => { db = await freshDb(); await db.exec(file('migrations', UP_QUOTES)); });

  test('a wrong server key is refused', async () => {
    assert.equal((await fails(() => create(db, { key: 'nope' })))?.message, 'not_authorised');
  });

  test('references are sequential and each quote gets its own 48-hex brief token', async () => {
    const a = (await create(db)).rows[0].r;
    const b = (await create(db, { email: 'b@example.com' })).rows[0].r;
    assert.equal(a.reference, 'MV-W-0001');
    assert.equal(b.reference, 'MV-W-0002');
    assert.match(a.briefToken, /^[0-9a-f]{48}$/);
    assert.notEqual(a.briefToken, b.briefToken);
  });

  test('rate limits: 3 per email per 24h, 5 per IP per hour; other IPs unaffected', async () => {
    for (const ip of ['ip-b', 'ip-c', 'ip-d']) await create(db, { email: 'c@example.com', ip });
    assert.equal((await fails(() => create(db, { email: 'c@example.com', ip: 'ip-e' })))?.message, 'rate_limited');
    for (const e of ['d', 'e', 'f']) await create(db, { email: `${e}@example.com`, ip: 'ip-a' }); // ip-a: 2 earlier + 3 = 5
    assert.equal((await fails(() => create(db, { email: 'g@example.com', ip: 'ip-a' })))?.message, 'rate_limited');
    assert.equal(await fails(() => create(db, { email: 'h@example.com', ip: 'ip-z' })), null);
  });

  test('the rate limits take advisory locks, so parallel requests cannot all slip past the count', async () => {
    const src = (await db.query(`select prosrc from pg_proc where proname = 'web_quote_create'`)).rows[0].prosrc as string;
    assert.match(src, /pg_advisory_xact_lock\(hashtext\('wq-ip:'/);
    assert.match(src, /pg_advisory_xact_lock\(hashtext\('wq-email:'/);
  });

  test('a NUL byte is rejected by Postgres as bad input (SQLSTATE class 22) — which the server treats as a hard failure', async () => {
    const err = await fails(() => create(db, { email: 'nul@example.com', ip: 'ip-nul', notes: 'a\u0000b' }));
    assert.ok(err, 'the call fails');
    assert.match(err!.code ?? '', /^22/, `SQLSTATE ${err!.code}: ${err!.message}`);
  });

  test('the brief page can see a quote without its email or phone; one brief per quote', async () => {
    const t = (await create(db, { email: 'brief@example.com', ip: 'ip-brief' })).rows[0].r.briefToken;
    const open = (await db.query(`select public.web_quote_brief_open($1,$2) as r`, [KEY, t])).rows[0].r;
    assert.deepEqual(Object.keys(open).sort(), ['addOnIds', 'customerName', 'extraPages', 'plan', 'reference', 'submitted']);
    assert.equal((await db.query(`select public.web_quote_brief_open($1,$2) as r`, [KEY, 'f'.repeat(48)])).rows[0].r, null);
    assert.equal((await fails(() => db.query(`select public.web_quote_brief_open($1,$2)`, ['bad', t])))?.message, 'not_authorised');
    const sub = (await db.query(`select public.web_quote_brief_submit($1,$2,$3::jsonb) as r`, [KEY, t, '{"businessName":"Bakery"}'])).rows[0].r;
    assert.equal(sub.customerEmail, 'brief@example.com');
    assert.equal((await fails(() => db.query(`select public.web_quote_brief_submit($1,$2,$3::jsonb)`, [KEY, t, '{}'])))?.message, 'already_submitted');
    assert.equal((await db.query(`select public.web_quote_brief_open($1,$2) as r`, [KEY, t])).rows[0].r.submitted, true);
  });

  test('table security: no anonymous access; team reads and changes status only', async () => {
    await db.exec('set role anon');
    assert.match((await fails(() => db.query('select * from public.web_quotes')))?.message ?? '', /permission denied/);
    assert.equal((await fails(() => create(db, { key: '' })))?.message, 'not_authorised');
    await db.exec('reset role; set role authenticated; set test.team = off');
    assert.equal((await db.query('select * from public.web_quotes')).rows.length, 0, 'non-team sees nothing (RLS)');
    await db.exec('set test.team = on');
    assert.ok((await db.query('select * from public.web_quotes')).rows.length >= 8);
    await db.query(`update public.web_quotes set status = 'accepted', status_note = 'Replied yes' where reference = 'MV-W-0001'`);
    for (const sql of [
      `update public.web_quotes set total_pence = 1 where reference = 'MV-W-0001'`,
      `update public.web_quotes set customer_email = 'x@y.z' where reference = 'MV-W-0001'`,
      `delete from public.web_quotes where reference = 'MV-W-0001'`,
    ]) assert.match((await fails(() => db.query(sql)))?.message ?? '', /permission denied/, sql);
    assert.match((await fails(() => db.query(`update public.web_quotes set status = 'banana' where reference = 'MV-W-0001'`)))?.message ?? '', /check constraint/);
    await db.exec('reset role');
  });
});

describe('retention', { skip }, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  before(async () => { db = await freshDb(); await db.exec(file('migrations', UP_QUOTES)); await db.exec(file('migrations', UP_RETENTION)); });

  const fy = async (issued: string, m = 7, d = 31) => (await db.query(`select to_char(public.web_quote_financial_year_end($1::date,$2,$3), 'YYYY-MM-DD') as d`, [issued, m, d])).rows[0].d;

  test('the financial year end is the first year-end on or after the day the quote was issued', async () => {
    // The company's real year-end: 31 July (incorporated 13 July 2026; first accounts to 31 July 2027).
    assert.equal(await fy('2026-07-13'), '2026-07-31', 'issued on incorporation day');
    assert.equal(await fy('2026-07-31'), '2026-07-31', 'issued on the last day of the year');
    assert.equal(await fy('2026-08-01'), '2027-07-31', 'issued the day after');
    assert.equal(await fy('2027-01-15'), '2027-07-31');
    assert.equal(await fy('2027-08-01'), '2028-07-31', 'second financial year');
    // The function works for any year-end.
    assert.equal(await fy('2026-04-06', 4, 5), '2027-04-05');
    assert.equal(await fy('2026-12-31', 12, 31), '2026-12-31');
  });

  test('only unconverted quotes are purged, and only after their financial year has ended', async () => {
    const q = async (email: string, issued: string, status: string) => {
      const ref = (await create(db, { email, ip: `ip-${email}`, issuedOn: issued })).rows[0].r.reference;
      await db.query(`update public.web_quotes set status = $1 where reference = $2`, [status, ref]);
      return ref;
    };
    const old = (await db.query(`select to_char(current_date - interval '2 years', 'YYYY-MM-DD') as d`)).rows[0].d;
    const today = (await db.query(`select to_char(current_date, 'YYYY-MM-DD') as d`)).rows[0].d;
    const refs = {
      oldIssued: await q('old1@example.com', old, 'issued'),
      oldDeclined: await q('old2@example.com', old, 'declined'),
      oldLapsed: await q('old3@example.com', old, 'lapsed'),
      oldAccepted: await q('old4@example.com', old, 'accepted'),
      oldAgreementSent: await q('old5@example.com', old, 'agreement_sent'),
      oldSigned: await q('old6@example.com', old, 'signed'),
      currentYear: await q('new1@example.com', today, 'issued'),
    };

    // Default is a dry run: it counts, and deletes nothing.
    assert.equal((await db.query(`select public.web_quotes_purge() as n`)).rows[0].n, 3);
    assert.equal((await db.query('select count(*)::int as n from public.web_quotes')).rows[0].n, 7);

    // Year-end set to today's month/day: a quote issued today is still inside its financial year, so it stays.
    const [m, d] = (await db.query(`select extract(month from current_date)::int as m, extract(day from current_date)::int as d`)).rows.map((r: { m: number; d: number }) => [r.m, r.d])[0];
    assert.equal((await db.query(`select public.web_quotes_purge($1,$2,true) as n`, [m, d])).rows[0].n, 3);

    assert.equal((await db.query(`select public.web_quotes_purge(7,31,false) as n`)).rows[0].n, 3, 'real run reports what it deleted');
    const left = (await db.query('select reference from public.web_quotes order by reference')).rows.map((r: { reference: string }) => r.reference);
    assert.deepEqual(left.sort(), [refs.oldAccepted, refs.oldAgreementSent, refs.oldSigned, refs.currentYear].sort(), 'converted and current quotes are kept');

    const log = (await db.query('select fy_end_month, fy_end_day, deleted from public.web_quote_retention_log')).rows;
    assert.deepEqual(log, [{ fy_end_month: 7, fy_end_day: 31, deleted: 3 }], 'one log row with counts only');
    assert.equal((await db.query(`select public.web_quotes_purge(7,31,false) as n`)).rows[0].n, 0, 'idempotent');
  });

  test('the purge and the log are not reachable from the API roles', async () => {
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`reset role; set role ${role}`);
      assert.match((await fails(() => db.query('select public.web_quotes_purge(7,31,false)')))?.message ?? '', /permission denied/, role);
    }
    await db.exec('reset role; set role anon');
    assert.match((await fails(() => db.query('select * from public.web_quote_retention_log')))?.message ?? '', /permission denied/);
    await db.exec('reset role');
  });
});

describe('rollbacks', { skip }, () => {
  test('both rollbacks remove everything they added, and the migrations can then be applied again', async () => {
    const db = await freshDb();
    await db.exec(file('migrations', UP_QUOTES));
    await db.exec(file('migrations', UP_RETENTION));
    await db.exec(file('rollbacks', '20261022130000_web_quotes_retention.down.sql'));
    await db.exec(file('rollbacks', '20261022120000_add_web_quotes.down.sql'));
    const left = await db.query(`
      select (select count(*) from pg_class where relname in ('web_quotes','web_quote_retention_log','web_quote_seq'))::int as rels,
             (select count(*) from pg_proc where proname like 'web\\_quote%' or proname = 'web_quotes_purge' or proname = 'web_quotes_touch')::int as funcs`);
    assert.deepEqual(left.rows[0], { rels: 0, funcs: 0 });
    // The agreements function it depends on is untouched.
    assert.equal((await db.query(`select count(*)::int as n from pg_proc where proname = 'agreement_server_key_ok'`)).rows[0].n, 1);
    await db.exec(file('migrations', UP_QUOTES));
    await db.exec(file('migrations', UP_RETENTION));
    assert.equal((await create(db)).rows[0].r.reference, 'MV-W-0001', 'sequence restarts after a rollback');
  });
});
