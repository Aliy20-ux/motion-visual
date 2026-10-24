-- Client reviews. When a project is finished, a private review link goes out with the final invoice. The client gives 1-5 stars
-- and a few words at motion-visual.com/review/<link>; a founder approves it; approved reviews appear on motion-visual.com.
-- The client can also be sent on to Google: Google only accepts a review from the customer's own Google account, so nothing is
-- posted for them, and every client gets the same Google link whatever their rating.
-- Additive only: new tables and functions. Roll back with supabase/rollbacks/20261024160000_reviews.down.sql.
-- Needs: projects, clients, team_members, is_team_member(), is_founder() (admin project) and agreement_server_key_ok() (agreements).

-- ── Tables ───────────────────────────────────────────────────────────────────────────────

create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  access_token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.team_members(id) on delete set null,
  expires_at timestamptz not null default now() + interval '90 days',
  first_opened_at timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.review_requests(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 2000),
  display_name text not null check (char_length(display_name) between 1 and 80),
  business_name text check (char_length(business_name) <= 120),
  consent_publish boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  featured boolean not null default false,
  google_clicked_at timestamptz,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.team_members(id) on delete set null,
  constraint approved_needs_consent check (status <> 'approved' or consent_publish)
);
create index if not exists reviews_public_idx on public.reviews (status, featured desc, created_at desc);

create table if not exists public.review_settings (
  key text primary key check (key in ('google_review_url', 'google_place_id')),
  value text not null default '' check (char_length(value) <= 600),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.team_members(id) on delete set null
);
insert into public.review_settings (key) values ('google_review_url'), ('google_place_id') on conflict (key) do nothing;

comment on table public.reviews is 'Client reviews left at /review/<token>. Shown on the website only when status = approved (needs the client''s consent). Content is never edited, only approved or hidden.';

-- ── Access: the team can read; everything else goes through the functions below ───────────

alter table public.review_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.review_settings enable row level security;

drop policy if exists team_read on public.review_requests;
create policy team_read on public.review_requests for select using (public.is_team_member());
drop policy if exists team_read on public.reviews;
create policy team_read on public.reviews for select using (public.is_team_member());
drop policy if exists team_read on public.review_settings;
create policy team_read on public.review_settings for select using (public.is_team_member());

revoke all on public.review_requests, public.reviews, public.review_settings from anon, authenticated;
grant select on public.review_requests, public.reviews, public.review_settings to authenticated;

-- ── Team functions ──────────────────────────────────────────────────────────────────────

-- The review link for a finished project (Launch or Live). Safe to call again: it returns the same link, and gives an unused,
-- expired link a fresh 90 days.
create or replace function public.ensure_review_request(p_project_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_project public.projects%rowtype;
  v_token text;
begin
  if not public.is_team_member() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  select * into v_project from public.projects where id = p_project_id;
  if not found then raise exception 'not_found'; end if;
  if v_project.build_stage not in ('Launch', 'Live') and v_project.completed_at is null then
    raise exception 'project_not_complete';
  end if;
  insert into public.review_requests (project_id, client_id, created_by)
  values (v_project.id, v_project.client_id, auth.uid())
  on conflict (project_id) do nothing;
  update public.review_requests r set expires_at = now() + interval '90 days'
   where r.project_id = p_project_id and r.expires_at < now()
     and not exists (select 1 from public.reviews x where x.request_id = r.id);
  select access_token into v_token from public.review_requests where project_id = p_project_id;
  return v_token;
end;
$$;

-- Approve, hide or feature a review (founders only). A review can only be approved if the client agreed to it being shown.
create or replace function public.review_decide(p_review_id uuid, p_status text, p_featured boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_founder() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_status not in ('pending', 'approved', 'hidden') then raise exception 'bad_status'; end if;
  if p_status = 'approved' and not exists (select 1 from public.reviews where id = p_review_id and consent_publish) then
    raise exception 'no_consent';
  end if;
  update public.reviews
     set status = p_status, featured = (p_status = 'approved' and coalesce(p_featured, false)),
         decided_at = now(), decided_by = auth.uid()
   where id = p_review_id;
  if not found then raise exception 'not_found'; end if;
end;
$$;

create or replace function public.set_review_setting(p_key text, p_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v text := btrim(coalesce(p_value, ''));
begin
  if not public.is_founder() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_key = 'google_review_url' and v <> '' and v !~ '^https://(g\.page|g\.co|search\.google\.com|www\.google\.com|google\.com|maps\.app\.goo\.gl)/[^\s]+$' then
    raise exception 'bad_url';
  end if;
  if p_key = 'google_place_id' and v <> '' and v !~ '^[A-Za-z0-9_-]{10,200}$' then
    raise exception 'bad_place_id';
  end if;
  update public.review_settings set value = v, updated_at = now(), updated_by = auth.uid() where key = p_key;
  if not found then raise exception 'unknown_setting'; end if;
end;
$$;

-- ── Server-only functions for the public page (called by the website's Pages Functions with the server key) ──

create or replace function public.review_open(p_key text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.review_requests%rowtype;
  rev public.reviews%rowtype;
  v_client public.clients%rowtype;
  v_project text;
  v_google text;
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  select * into r from public.review_requests where access_token = p_token for update;
  if not found then raise exception 'not_found'; end if;
  if r.first_opened_at is null then
    update public.review_requests set first_opened_at = now() where id = r.id;
  end if;
  select * into v_client from public.clients where id = r.client_id;
  select name into v_project from public.projects where id = r.project_id;
  select nullif(value, '') into v_google from public.review_settings where key = 'google_review_url';
  select * into rev from public.reviews where request_id = r.id;
  return jsonb_build_object(
    'status', case when rev.id is not null then 'submitted' when r.expires_at < now() then 'expired' else 'open' end,
    'clientName', coalesce(v_client.contact_name, ''),
    'businessName', v_client.business_name,
    'projectName', v_project,
    'googleReviewUrl', v_google,
    'submitted', case when rev.id is not null then jsonb_build_object('rating', rev.rating, 'body', rev.body) end
  );
end;
$$;

create or replace function public.review_submit(
  p_key text, p_token text, p_rating integer, p_body text, p_name text, p_business text, p_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.review_requests%rowtype;
  v_body text := btrim(regexp_replace(coalesce(p_body, ''), '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g'));
  v_name text := btrim(regexp_replace(coalesce(p_name, ''), '[\x01-\x1f\x7f]', '', 'g'));
  v_business text := nullif(btrim(regexp_replace(coalesce(p_business, ''), '[\x01-\x1f\x7f]', '', 'g')), '');
  v_google text;
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'invalid_rating'; end if;
  if char_length(v_name) not between 1 and 80 then raise exception 'invalid_name'; end if;
  if char_length(v_body) > 2000 then raise exception 'invalid_body'; end if;
  if v_business is not null and char_length(v_business) > 120 then raise exception 'invalid_business'; end if;
  select * into r from public.review_requests where access_token = p_token for update;
  if not found then raise exception 'not_found'; end if;
  if exists (select 1 from public.reviews where request_id = r.id) then raise exception 'already_submitted'; end if;
  if r.expires_at < now() then raise exception 'expired'; end if;
  insert into public.reviews (request_id, rating, body, display_name, business_name, consent_publish)
  values (r.id, p_rating, v_body, v_name, v_business, coalesce(p_consent, false));
  select nullif(value, '') into v_google from public.review_settings where key = 'google_review_url';
  return jsonb_build_object('ok', true, 'googleReviewUrl', v_google);
end;
$$;

create or replace function public.review_google_clicked(p_key text, p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  update public.reviews set google_clicked_at = coalesce(google_clicked_at, now())
   where request_id = (select id from public.review_requests where access_token = p_token);
end;
$$;

-- What the website shows: approved reviews only, with how many there are and their average.
create or replace function public.reviews_public(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'count', (select count(*) from public.reviews where status = 'approved'),
    'average', (select round(avg(rating)::numeric, 1) from public.reviews where status = 'approved'),
    'reviews', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', x.id, 'name', x.display_name, 'business', x.business_name, 'rating', x.rating,
               'body', x.body, 'date', to_char(x.created_at, 'YYYY-MM-DD'), 'featured', x.featured)
             order by x.featured desc, x.created_at desc)
      from (select * from public.reviews where status = 'approved' and body <> '' order by featured desc, created_at desc limit 12) x
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.ensure_review_request(uuid) from public, anon;
revoke all on function public.review_decide(uuid, text, boolean) from public, anon;
revoke all on function public.set_review_setting(text, text) from public, anon;
revoke all on function public.review_open(text, text) from public;
revoke all on function public.review_submit(text, text, integer, text, text, text, boolean) from public;
revoke all on function public.review_google_clicked(text, text) from public;
revoke all on function public.reviews_public(text) from public;
grant execute on function public.ensure_review_request(uuid) to authenticated;
grant execute on function public.review_decide(uuid, text, boolean) to authenticated;
grant execute on function public.set_review_setting(text, text) to authenticated;
grant execute on function public.review_open(text, text) to anon, authenticated;
grant execute on function public.review_submit(text, text, integer, text, text, text, boolean) to anon, authenticated;
grant execute on function public.review_google_clicked(text, text) to anon, authenticated;
grant execute on function public.reviews_public(text) to anon, authenticated;
