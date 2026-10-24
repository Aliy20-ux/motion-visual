-- Usage limits for the website's AI assistant, so a bot or a runaway page can't run up the bill.
-- Per visitor (hashed address, never the address itself): 30 chat messages and 5 "talk to a founder" hand-offs an hour.
-- Across the whole site: 1,500 chat messages a day (change the number below if the assistant gets busy).
-- Called by the website's server with the agreements server key. Additive only: one table and one function.
-- Roll back with supabase/rollbacks/20261024190000_assistant_usage.down.sql.
create table if not exists public.assistant_usage (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  kind text not null check (kind in ('chat', 'handoff')),
  created_at timestamptz not null default now()
);
create index if not exists assistant_usage_ip_idx on public.assistant_usage (ip_hash, kind, created_at desc);
create index if not exists assistant_usage_day_idx on public.assistant_usage (kind, created_at desc);
alter table public.assistant_usage enable row level security;
revoke all on public.assistant_usage from anon, authenticated;

-- Returns 'ok', 'ip_limit' or 'daily_limit'. With p_consume = false it only checks (used to decide whether to show the chat button).
create or replace function public.assistant_allow(p_key text, p_ip_hash text, p_kind text default 'chat', p_consume boolean default true)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hour_limit integer := case when p_kind = 'handoff' then 5 else 30 end;
  v_day_limit integer := 1500;
  v_hour integer;
  v_day integer;
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_kind not in ('chat', 'handoff') then raise exception 'bad_kind'; end if;
  if p_ip_hash is null or char_length(p_ip_hash) < 8 then raise exception 'bad_visitor'; end if;

  -- One at a time per visitor and per kind, so parallel requests can't all slip past the count.
  perform pg_advisory_xact_lock(hashtext('assistant:' || p_kind || ':' || p_ip_hash));
  select count(*) into v_hour from public.assistant_usage where ip_hash = p_ip_hash and kind = p_kind and created_at > now() - interval '1 hour';
  if v_hour >= v_hour_limit then return 'ip_limit'; end if;
  select count(*) into v_day from public.assistant_usage where kind = p_kind and created_at > now() - interval '1 day';
  if p_kind = 'chat' and v_day >= v_day_limit then return 'daily_limit'; end if;

  if p_consume then
    insert into public.assistant_usage (ip_hash, kind) values (p_ip_hash, p_kind);
    -- Tidy up: nothing older than two days is ever needed.
    delete from public.assistant_usage where created_at < now() - interval '2 days';
  end if;
  return 'ok';
end;
$$;
revoke all on function public.assistant_allow(text, text, text, boolean) from public;
grant execute on function public.assistant_allow(text, text, text, boolean) to anon, authenticated;
