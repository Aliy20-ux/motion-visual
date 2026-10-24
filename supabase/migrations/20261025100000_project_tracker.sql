-- Client project tracker: a private page for each project showing "Day 6 of 14", the stage the project is at, what's been signed and
-- received, and what is waiting on the client. The team creates the link from the project in the admin; the client needs no login.
-- Additive only: one table and three functions. Needs the deal-automation migration (projects.agreement_id) and the agreements key;
-- the review link on a live project also needs the reviews migration, and simply isn't shown without it.
-- Roll back with supabase/rollbacks/20261025100000_project_tracker.down.sql.

create table if not exists public.project_trackers (
  project_id uuid primary key references public.projects(id) on delete cascade,
  access_token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  -- Day 0 of the 14 days is the later of "agreement signed" and "content received".
  content_received_on date,
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now(),
  created_by uuid references public.team_members(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.project_trackers enable row level security;
drop policy if exists team_read on public.project_trackers;
create policy team_read on public.project_trackers for select using (public.is_team_member());
revoke all on public.project_trackers from anon, authenticated;
grant select on public.project_trackers to authenticated;

-- The tracker link for a project (made on first use; the same link every time after).
create or replace function public.ensure_project_tracker(p_project_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_token text;
begin
  if not public.is_team_member() then raise exception 'not_authorised' using errcode = '42501'; end if;
  if not exists (select 1 from public.projects where id = p_project_id) then raise exception 'not_found'; end if;
  insert into public.project_trackers (project_id, created_by) values (p_project_id, auth.uid()) on conflict (project_id) do nothing;
  select access_token into v_token from public.project_trackers where project_id = p_project_id;
  return v_token;
end;
$$;

-- What the team sets by hand: when the client's content arrived, and a short note the client sees ("We're waiting on your logo").
create or replace function public.set_project_tracker(p_project_id uuid, p_content_received_on date, p_note text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_note text := nullif(btrim(regexp_replace(coalesce(p_note, ''), '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g')), '');
begin
  if not public.is_team_member() then raise exception 'not_authorised' using errcode = '42501'; end if;
  if v_note is not null and char_length(v_note) > 300 then raise exception 'note_too_long'; end if;
  if p_content_received_on is not null and p_content_received_on > (now() at time zone 'Europe/London')::date + 1 then raise exception 'date_in_future'; end if;
  perform public.ensure_project_tracker(p_project_id);
  update public.project_trackers
     set content_received_on = p_content_received_on, note = v_note, updated_at = now()
   where project_id = p_project_id;
end;
$$;

-- What the client page shows. No emails, no money, no internal task names: only dates, the stage, the agreement status and links
-- the client was already sent.
create or replace function public.project_tracker_open(p_key text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.project_trackers%rowtype;
  p public.projects%rowtype;
  v_business text;
  a public.agreements%rowtype;
  v_review text;
begin
  if not public.agreement_server_key_ok(p_key) then raise exception 'not_authorised' using errcode = '42501'; end if;
  select * into t from public.project_trackers where access_token = p_token;
  if not found then raise exception 'not_found'; end if;
  select * into p from public.projects where id = t.project_id;
  select business_name into v_business from public.clients where id = p.client_id;
  if p.agreement_id is not null then select * into a from public.agreements where id = p.agreement_id; end if;
  -- The review link is only offered once the project is live, and only if the reviews migration has been run.
  if p.build_stage = 'Live' and to_regclass('public.review_requests') is not null then
    execute 'select access_token from public.review_requests where project_id = $1' into v_review using p.id;
  end if;
  return jsonb_build_object(
    'projectName', p.name,
    'businessName', v_business,
    'stage', p.build_stage,
    'today', (now() at time zone 'Europe/London')::date,
    'launchDate', p.launch_date,
    'contentReceivedOn', t.content_received_on,
    'note', t.note,
    'agreement', case when a.id is null then null else jsonb_build_object(
      'status', a.status,
      'signedOn', (a.signed_at at time zone 'Europe/London')::date,
      'signToken', case when a.status = 'sent' and (a.expires_at is null or a.expires_at > now()) then a.access_token end) end,
    'reviewToken', v_review
  );
end;
$$;

revoke all on function public.ensure_project_tracker(uuid) from public, anon;
revoke all on function public.set_project_tracker(uuid, date, text) from public, anon;
revoke all on function public.project_tracker_open(text, text) from public;
grant execute on function public.ensure_project_tracker(uuid) to authenticated;
grant execute on function public.set_project_tracker(uuid, date, text) to authenticated;
grant execute on function public.project_tracker_open(text, text) to anon, authenticated;
