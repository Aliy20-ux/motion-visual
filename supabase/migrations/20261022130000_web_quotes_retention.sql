-- Retention for website quotes and briefs.
-- Rule (owner decision, 2026-10-22): a quote and its brief are kept from when the quote is issued until the
-- end of the financial year in which it was issued. Quotes that became a client (accepted, agreement_sent,
-- signed) are NOT deleted here: they are part of a contract and are kept for as long as the relationship and
-- the law require (accounting records: six years). Only issued / declined / lapsed quotes are purged.
--
-- web_quotes_purge() defaults to a DRY RUN and returns how many rows it WOULD delete. Delete for real with
--   select public.web_quotes_purge(4, 5, false);
-- The financial year end is passed as month + day. 4 / 5 (5 April, the UK tax year end) is a placeholder:
-- use your company's accounting reference date. Nothing is scheduled by this migration; see docs/QUOTES.md.

create table public.web_quote_retention_log (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  fy_end_month integer not null,
  fy_end_day integer not null,
  deleted integer not null
);

comment on table public.web_quote_retention_log is 'One row per real purge run: when, which year-end, and how many quotes were deleted. No personal data.';

alter table public.web_quote_retention_log enable row level security;
revoke all on table public.web_quote_retention_log from public, anon, authenticated;
grant select on table public.web_quote_retention_log to authenticated;
create policy team_read on public.web_quote_retention_log for select using (public.is_team_member());

-- The first financial year end on or after the day a quote was issued.
create or replace function public.web_quote_financial_year_end(p_issued date, p_month integer, p_day integer)
returns date
language sql
immutable
as $$
  select case
    when make_date(extract(year from p_issued)::integer, p_month, p_day) >= p_issued
      then make_date(extract(year from p_issued)::integer, p_month, p_day)
    else make_date(extract(year from p_issued)::integer + 1, p_month, p_day)
  end;
$$;

create or replace function public.web_quotes_purge(p_month integer default 4, p_day integer default 5, p_dry_run boolean default true)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  if p_dry_run then
    select count(*) into n from public.web_quotes
    where status in ('issued', 'declined', 'lapsed')
      and current_date > public.web_quote_financial_year_end(issued_on, p_month, p_day);
    return n;
  end if;

  with gone as (
    delete from public.web_quotes
    where status in ('issued', 'declined', 'lapsed')
      and current_date > public.web_quote_financial_year_end(issued_on, p_month, p_day)
    returning 1
  )
  select count(*) into n from gone;

  insert into public.web_quote_retention_log (fy_end_month, fy_end_day, deleted) values (p_month, p_day, n);
  return n;
end;
$$;

-- Only the database owner (and so pg_cron / the SQL editor) can run it: never the API.
revoke all on function public.web_quotes_purge(integer, integer, boolean) from public, anon, authenticated;
revoke all on function public.web_quote_financial_year_end(date, integer, integer) from public, anon, authenticated;
