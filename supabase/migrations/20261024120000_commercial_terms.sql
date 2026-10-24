-- The company's commercial terms (prices, deposit rule, care plans, payment days), published from the website's
-- src/commercial.ts so the admin shows exactly what the website, quotes and agreements say.
-- Additive only: one new table, read-only for the team. Roll back with supabase/rollbacks/20261024120000_commercial_terms.down.sql.
create table if not exists public.commercial_terms (
  version text primary key,
  terms jsonb not null,
  published_at timestamptz not null default now()
);

comment on table public.commercial_terms is
  'Prices and terms published from the website repo (npm run sync-terms). Read by the admin. Written only by SQL run by a founder, never through the API.';

alter table public.commercial_terms enable row level security;

drop policy if exists team_read on public.commercial_terms;
create policy team_read on public.commercial_terms
  for select using (public.is_team_member());

revoke all on public.commercial_terms from anon, authenticated;
grant select on public.commercial_terms to authenticated;
