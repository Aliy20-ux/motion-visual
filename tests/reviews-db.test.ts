// Runs the reviews migration in a real Postgres engine (PGlite). Skipped unless it is installed:
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
const UP = '20261024160000_reviews.sql';
const DOWN = '20261024160000_reviews.down.sql';
const P_LIVE = '00000000-0000-4000-8000-000000000001';
const P_BUILD = '00000000-0000-4000-8000-000000000002';
const P_LAUNCH = '00000000-0000-4000-8000-000000000003';
const CLIENT = '00000000-0000-4000-8000-0000000000c1';
const FOUNDER = '00000000-0000-4000-8000-0000000000f1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function freshDb(): Promise<any> {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    grant usage on schema public to anon, authenticated;
    create schema vault; create table vault.decrypted_secrets (name text, decrypted_secret text);
    create schema extensions;
    create function extensions.digest(t text, algo text) returns bytea language sql as $$ select sha256(convert_to(t, 'UTF8')) $$;
    create function extensions.gen_random_bytes(n int) returns bytea language sql as $$ select decode(substr(md5(random()::text) || md5(random()::text) || md5(random()::text), 1, n * 2), 'hex') $$;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    create function public.is_team_member() returns boolean language sql stable as $$ select coalesce(current_setting('test.team', true), '') = 'on' $$;
    create function public.is_founder() returns boolean language sql stable as $$ select coalesce(current_setting('test.founder', true), '') = 'on' $$;
    create table public.team_members (id uuid primary key);
    create table public.clients (id uuid primary key, business_name text not null, contact_name text, email text);
    create table public.projects (id uuid primary key, client_id uuid not null references public.clients(id), name text not null, build_stage text not null, completed_at timestamptz);
    insert into public.team_members values ('${FOUNDER}');
    insert into public.clients values ('${CLIENT}', 'Mon Ami Chesser', 'Amira', 'amira@example.com');
    insert into public.projects values ('${P_LIVE}', '${CLIENT}', 'Mon Ami website', 'Live', null),
                                       ('${P_BUILD}', '${CLIENT}', 'Half built', 'Build', null),
                                       ('${P_LAUNCH}', '${CLIENT}', 'About to launch', 'Launch', null);
  `);
  await db.query(`insert into vault.decrypted_secrets values ('agreements_server_key_sha256', $1)`, [createHash('sha256').update(KEY).digest('hex')]);
  const agr = file('migrations', '20261015120000_add_client_agreements.sql');
  await db.exec(agr.slice(agr.indexOf('create or replace function public.agreement_server_key_ok'), agr.indexOf('revoke all on function public.agreement_server_key_ok')));
  await db.exec(file('migrations', UP));
  return db;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fails = async (fn: () => Promise<any>) => { try { await fn(); return null; } catch (e) { return e as { message: string; code?: string }; } };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const as = (db: any, who: 'team' | 'founder' | 'nobody') => db.exec(
  `select set_config('test.team', '${who === 'nobody' ? '' : 'on'}', false), set_config('test.founder', '${who === 'founder' ? 'on' : ''}', false), set_config('test.uid', '${who === 'nobody' ? '' : FOUNDER}', false)`);

describe('reviews migration', { skip }, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  let token = '';
  before(async () => { db = await freshDb(); });

  const open = (t: string, key = KEY) => db.query('select public.review_open($1,$2) as r', [key, t]).then((x: { rows: { r: any }[] }) => x.rows[0].r);
  const submit = (t: string, o: { rating?: number; body?: string; name?: string; business?: string | null; consent?: boolean; key?: string } = {}) =>
    db.query('select public.review_submit($1,$2,$3,$4,$5,$6,$7) as r', [o.key ?? KEY, t, o.rating ?? 5, o.body ?? 'Brilliant to work with.', o.name ?? 'Amira', o.business === undefined ? 'Mon Ami Chesser' : o.business, o.consent ?? true])
      .then((x: { rows: { r: any }[] }) => x.rows[0].r);

  test('only the team can create a review link, and only for a finished project', async () => {
    await as(db, 'nobody');
    assert.equal((await fails(() => db.query('select public.ensure_review_request($1)', [P_LIVE])))?.message, 'not_authorised');
    await as(db, 'team');
    assert.equal((await fails(() => db.query('select public.ensure_review_request($1)', [P_BUILD])))?.message, 'project_not_complete');
    assert.equal((await fails(() => db.query('select public.ensure_review_request($1)', ['00000000-0000-4000-8000-0000000000aa'])))?.message, 'not_found');
    token = (await db.query('select public.ensure_review_request($1) as t', [P_LIVE])).rows[0].t;
    assert.match(token, /^[0-9a-f]{48}$/);
    const launch = (await db.query('select public.ensure_review_request($1) as t', [P_LAUNCH])).rows[0].t;
    assert.notEqual(launch, token);
  });

  test('asking again returns the same link; an unused expired link gets fresh time', async () => {
    const again = (await db.query('select public.ensure_review_request($1) as t', [P_LIVE])).rows[0].t;
    assert.equal(again, token);
    const launch = (await db.query('select access_token from public.review_requests where project_id = $1', [P_LAUNCH])).rows[0].access_token;
    await db.exec(`update public.review_requests set expires_at = now() - interval '1 day' where project_id = '${P_LAUNCH}'`);
    await db.query('select public.ensure_review_request($1)', [P_LAUNCH]);
    const { rows } = await db.query('select access_token, expires_at > now() as fresh from public.review_requests where project_id = $1', [P_LAUNCH]);
    assert.equal(rows[0].access_token, launch);
    assert.equal(rows[0].fresh, true);
  });

  test('the public functions refuse a wrong server key', async () => {
    assert.equal((await fails(() => open(token, 'nope')))?.message, 'not_authorised');
    assert.equal((await fails(() => submit(token, { key: 'nope' })))?.message, 'not_authorised');
    assert.equal((await fails(() => db.query('select public.reviews_public($1)', ['nope'])))?.message, 'not_authorised');
    assert.equal((await fails(() => db.query('select public.review_google_clicked($1,$2)', ['nope', token])))?.message, 'not_authorised');
  });

  test('opening the link shows the project and name, never the email, and an unknown link is not_found', async () => {
    const r = await open(token);
    assert.equal(r.status, 'open');
    assert.equal(r.clientName, 'Amira');
    assert.equal(r.businessName, 'Mon Ami Chesser');
    assert.equal(r.projectName, 'Mon Ami website');
    assert.ok(!JSON.stringify(r).includes('example.com'));
    assert.equal(r.googleReviewUrl, null);
    assert.equal((await fails(() => open('0'.repeat(48))))?.message, 'not_found');
    const opened = (await db.query('select first_opened_at from public.review_requests where access_token = $1', [token])).rows[0].first_opened_at;
    assert.ok(opened);
  });

  test('bad input is refused: rating, name, length', async () => {
    for (const rating of [0, 6, -1]) assert.equal((await fails(() => submit(token, { rating })))?.message, 'invalid_rating');
    assert.equal((await fails(() => submit(token, { name: '   ' })))?.message, 'invalid_name');
    assert.equal((await fails(() => submit(token, { name: 'x'.repeat(81) })))?.message, 'invalid_name');
    assert.equal((await fails(() => submit(token, { body: 'x'.repeat(2001) })))?.message, 'invalid_body');
    assert.equal((await fails(() => submit(token, { business: 'x'.repeat(121) })))?.message, 'invalid_business');
    assert.equal((await db.query('select count(*)::int as n from public.reviews')).rows[0].n, 0);
  });

  test('a review is saved as pending, control characters are stripped, and it can only be left once', async () => {
    const out = await submit(token, { rating: 4, body: '  Great\u0007 site.  ', name: ' Amira\u0001 K ', consent: true });
    assert.equal(out.ok, true);
    const { rows } = await db.query('select rating, body, display_name, status, consent_publish from public.reviews');
    assert.deepEqual(rows[0], { rating: 4, body: 'Great site.', display_name: 'Amira K', status: 'pending', consent_publish: true });
    assert.equal((await fails(() => submit(token)))?.message, 'already_submitted');
    const again = await open(token);
    assert.equal(again.status, 'submitted');
    assert.deepEqual(again.submitted, { rating: 4, body: 'Great site.' });
  });

  test('an expired link cannot be used', async () => {
    const t = (await db.query('select access_token from public.review_requests where project_id = $1', [P_LAUNCH])).rows[0].access_token;
    await db.exec(`update public.review_requests set expires_at = now() - interval '1 day' where access_token = '${t}'`);
    assert.equal((await open(t)).status, 'expired');
    assert.equal((await fails(() => submit(t)))?.message, 'expired');
  });

  test('nothing is public until a founder approves it, and approval needs the client\'s consent', async () => {
    assert.equal((await db.query('select public.reviews_public($1) as r', [KEY])).rows[0].r.count, 0);
    const id = (await db.query('select id from public.reviews')).rows[0].id;
    await as(db, 'team');
    assert.equal((await fails(() => db.query('select public.review_decide($1,$2,false)', [id, 'approved'])))?.message, 'not_authorised');
    await as(db, 'founder');
    assert.equal((await fails(() => db.query('select public.review_decide($1,$2,false)', [id, 'maybe'])))?.message, 'bad_status');
    await db.query('select public.review_decide($1,$2,true)', [id, 'approved']);
    const pub = (await db.query('select public.reviews_public($1) as r', [KEY])).rows[0].r;
    assert.equal(pub.count, 1);
    assert.equal(Number(pub.average), 4);
    assert.equal(pub.reviews[0].name, 'Amira K');
    assert.equal(pub.reviews[0].featured, true);
    assert.ok(!JSON.stringify(pub).includes('amira@example.com'));
    await db.query('select public.review_decide($1,$2,false)', [id, 'hidden']);
    assert.equal((await db.query('select public.reviews_public($1) as r', [KEY])).rows[0].r.count, 0);
  });

  test('a review without consent can never be approved (function and table rule)', async () => {
    await as(db, 'team');
    const t = (await db.query('select public.ensure_review_request($1) as t', [P_LAUNCH])).rows[0].t;
    await db.exec(`update public.review_requests set expires_at = now() + interval '5 days'`);
    await submit(t, { rating: 5, consent: false, name: 'Quiet Client' });
    const id = (await db.query(`select id from public.reviews where display_name = 'Quiet Client'`)).rows[0].id;
    await as(db, 'founder');
    assert.equal((await fails(() => db.query('select public.review_decide($1,$2,false)', [id, 'approved'])))?.message, 'no_consent');
    assert.ok(await fails(() => db.exec(`update public.reviews set status = 'approved' where id = '${id}'`)), 'table constraint also refuses it');
  });

  test('rating-only reviews count towards the average but are not listed', async () => {
    await as(db, 'founder');
    const id = (await db.query(`select id from public.reviews where display_name = 'Quiet Client'`)).rows[0].id;
    await db.exec(`update public.reviews set consent_publish = true, body = '' where id = '${id}'`);
    await db.query('select public.review_decide($1,$2,false)', [id, 'approved']);
    const pub = (await db.query('select public.reviews_public($1) as r', [KEY])).rows[0].r;
    assert.equal(pub.count, 1);
    assert.equal(pub.reviews.length, 0);
    assert.equal(Number(pub.average), 5);
  });

  test('every rating is offered the same Google link (no filtering unhappy clients)', async () => {
    await as(db, 'founder');
    await db.query('select public.set_review_setting($1,$2)', ['google_review_url', 'https://g.page/r/CabcDEF123/review']);
    await db.exec(`insert into public.projects values ('00000000-0000-4000-8000-000000000004', '${CLIENT}', 'Second site', 'Live', null), ('00000000-0000-4000-8000-000000000005', '${CLIENT}', 'Third site', 'Live', null)`);
    await as(db, 'team');
    const links: string[] = [];
    for (const [project, rating] of [['00000000-0000-4000-8000-000000000004', 1], ['00000000-0000-4000-8000-000000000005', 5]] as const) {
      const t = (await db.query('select public.ensure_review_request($1) as t', [project])).rows[0].t;
      assert.equal((await open(t)).googleReviewUrl, 'https://g.page/r/CabcDEF123/review');
      links.push((await submit(t, { rating, body: rating === 1 ? 'Not happy.' : 'Lovely.', name: `R${rating}` })).googleReviewUrl);
    }
    assert.deepEqual(links, ['https://g.page/r/CabcDEF123/review', 'https://g.page/r/CabcDEF123/review']);
    const t = (await db.query('select access_token from public.review_requests order by created_at desc limit 1')).rows[0].access_token;
    await db.query('select public.review_google_clicked($1,$2)', [KEY, t]);
    assert.ok((await db.query('select google_clicked_at from public.reviews where display_name = $1', ['R5'])).rows[0].google_clicked_at);
  });

  test('settings: founders only, and only real Google review addresses', async () => {
    await as(db, 'team');
    assert.equal((await fails(() => db.query('select public.set_review_setting($1,$2)', ['google_review_url', 'https://g.page/r/x/review'])))?.message, 'not_authorised');
    await as(db, 'founder');
    for (const bad of ['http://g.page/r/x/review', 'https://evil.example.com/r/x', 'javascript:alert(1)', 'https://g.page/r/x y']) {
      assert.equal((await fails(() => db.query('select public.set_review_setting($1,$2)', ['google_review_url', bad])))?.message, 'bad_url', bad);
    }
    for (const ok of ['https://search.google.com/local/writereview?placeid=ChIJabc123', 'https://g.page/r/CabcDEF123/review']) {
      await db.query('select public.set_review_setting($1,$2)', ['google_review_url', ok]);
    }
    assert.equal((await fails(() => db.query('select public.set_review_setting($1,$2)', ['google_place_id', 'bad id!'])))?.message, 'bad_place_id');
    assert.equal((await fails(() => db.query('select public.set_review_setting($1,$2)', ['nope', 'x'])))?.message, 'unknown_setting');
    await db.query('select public.set_review_setting($1,$2)', ['google_review_url', '']);
    assert.equal((await open(token)).googleReviewUrl, null);
  });

  test('the browser roles cannot read or write the tables directly beyond what the team policies allow', async () => {
    await db.exec('set role anon');
    assert.ok(await fails(() => db.query('select * from public.reviews')), 'anon cannot read reviews');
    assert.ok(await fails(() => db.query('select * from public.review_requests')), 'anon cannot read requests');
    await db.exec('reset role');
    await db.exec('set role authenticated');
    await as(db, 'team');
    assert.ok(await fails(() => db.exec(`insert into public.reviews (request_id, rating, display_name) select id, 5, 'Fake' from public.review_requests limit 1`)), 'team cannot insert a review directly');
    assert.ok(await fails(() => db.exec(`update public.reviews set rating = 1`)), 'team cannot edit a review');
    assert.ok(await fails(() => db.exec(`delete from public.reviews`)), 'team cannot delete a review');
    assert.ok((await db.query('select count(*)::int as n from public.reviews')).rows[0].n >= 1, 'the team can read');
    await db.exec('reset role');
  });

  test('the rollback removes everything it added, and the migration can be applied twice', async () => {
    await db.exec(file('migrations', UP)); // idempotent
    await db.exec(file('rollbacks', DOWN));
    const { rows } = await db.query(`select count(*)::int as n from pg_class where relname in ('reviews','review_requests','review_settings')`);
    assert.equal(rows[0].n, 0);
    const fns = await db.query(`select count(*)::int as n from pg_proc where proname in ('review_open','review_submit','reviews_public','ensure_review_request','review_decide','set_review_setting','review_google_clicked')`);
    assert.equal(fns.rows[0].n, 0);
  });
});
