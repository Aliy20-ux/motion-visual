-- Client agreements sent from motion-visual.com and signed in the browser.
-- Target: the motionvisual-admin Supabase project (ndnapekhhnrbqddfqpdh).
--
-- Team members create/send/void via RLS; clients never touch these tables
-- directly — they go through the agreement_* RPCs below, which only the
-- website's server functions can call (server key checked against vault).
--
-- After applying, store the server key's SHA-256 in vault (see
-- docs/AGREEMENTS.md) — until then every agreement_* RPC refuses to run.

create sequence public.agreement_ref_seq;

create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  kind text not null check (kind in ('project', 'change', 'completion')),
  parent_id uuid references public.agreements(id) on delete restrict,
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null,
  client_business text,
  client_email text not null,
  client_type text not null check (client_type in ('business', 'consumer')),
  title text not null,
  document jsonb not null,
  document_hash text not null default '',
  terms_version text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'void')),
  access_token text not null unique default '',
  expires_at timestamptz,
  created_by uuid references public.team_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  first_viewed_at timestamptz,
  view_count integer not null default 0,
  signed_at timestamptz,
  signer_name text,
  signer_ip text,
  signer_user_agent text,
  signer_consents jsonb,
  voided_at timestamptz,
  void_reason text
);

comment on table public.agreements is 'Client agreements (project / change request / completion sign-off) sent from motion-visual.com/studio and signed at /agreement/<token>. Signed rows are permanent — enforced by agreements_guard.';

create table public.agreement_events (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.agreements(id) on delete cascade,
  type text not null check (type in ('created', 'sent', 'viewed', 'question', 'signed', 'voided')),
  team_member_id uuid references public.team_members(id) on delete set null,
  ip text,
  user_agent text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.agreement_events is 'Append-only audit trail for agreements. Written only by triggers and agreement_* RPCs, never directly through the API.';

create index agreement_events_agreement_id_idx on public.agreement_events (agreement_id, created_at);
create index agreement_events_team_member_id_idx on public.agreement_events (team_member_id);
create index agreements_parent_id_idx on public.agreements (parent_id);
create index agreements_client_id_idx on public.agreements (client_id);
create index agreements_created_by_idx on public.agreements (created_by);

-- The RPCs set mv.agreement_rpc = 'on' for their own transaction; that is the
-- only way view counters, signer fields, and the signed status can change.
create or replace function public.agreements_guard()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
declare
  v_rpc boolean := coalesce(current_setting('mv.agreement_rpc', true), '') = 'on';
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' then
      raise exception 'New agreements start as drafts';
    end if;
    if jsonb_typeof(new.document) <> 'object' then
      raise exception 'Agreement document must be a JSON object';
    end if;
    new.reference := 'MV-' || to_char(now() at time zone 'Europe/London', 'YYYY') || '-'
      || lpad(nextval('public.agreement_ref_seq')::text, 4, '0');
    new.document := new.document || jsonb_build_object('reference', new.reference);
    new.access_token := encode(extensions.gen_random_bytes(24), 'hex');
    new.created_by := auth.uid();
    new.created_at := now();
    new.sent_at := null;
    new.first_viewed_at := null;
    new.view_count := 0;
    new.signed_at := null;
    new.signer_name := null;
    new.signer_ip := null;
    new.signer_user_agent := null;
    new.signer_consents := null;
    new.voided_at := null;
    new.void_reason := null;
  else
    -- Deleting a CRM client or team member nulls these FKs (ON DELETE SET
    -- NULL runs as an UPDATE). Let exactly that through, even on signed rows.
    if (to_jsonb(new) - 'client_id' - 'created_by') = (to_jsonb(old) - 'client_id' - 'created_by')
       and (new.client_id is null or new.client_id is not distinct from old.client_id)
       and (new.created_by is null or new.created_by is not distinct from old.created_by) then
      return new;
    end if;
    if old.status = 'signed' then
      raise exception 'Signed agreements are permanent and cannot be changed';
    end if;
    if old.status = 'void' then
      raise exception 'Void agreements cannot be changed';
    end if;

    new.id := old.id;
    new.reference := old.reference;
    new.access_token := old.access_token;
    new.created_by := case when new.created_by is null then null else old.created_by end;
    new.created_at := old.created_at;
    -- Draft edits send a freshly built document without the reference.
    new.document := new.document || jsonb_build_object('reference', new.reference);

    if old.status <> 'draft' and (
      new.document is distinct from old.document
      or new.kind is distinct from old.kind
      or new.parent_id is distinct from old.parent_id
      or new.client_name is distinct from old.client_name
      or new.client_business is distinct from old.client_business
      or new.client_email is distinct from old.client_email
      or new.client_type is distinct from old.client_type
      or new.title is distinct from old.title
      or new.terms_version is distinct from old.terms_version
    ) then
      raise exception 'Sent agreements cannot be edited — void it and send a revised copy';
    end if;

    if not v_rpc then
      new.first_viewed_at := old.first_viewed_at;
      new.view_count := old.view_count;
      new.signed_at := old.signed_at;
      new.signer_name := old.signer_name;
      new.signer_ip := old.signer_ip;
      new.signer_user_agent := old.signer_user_agent;
      new.signer_consents := old.signer_consents;
    end if;

    if new.status <> old.status then
      if not (
        (old.status = 'draft' and new.status in ('sent', 'void'))
        or (old.status = 'sent' and new.status = 'void')
        or (old.status = 'sent' and new.status = 'signed' and v_rpc)
      ) then
        raise exception 'Agreement cannot move from % to %', old.status, new.status;
      end if;
    end if;

    if new.status = 'sent' and (old.status = 'draft' or new.sent_at is distinct from old.sent_at) then
      new.sent_at := now();
    end if;

    -- The signing RPC enforces whatever consents the document lists, so make
    -- sure a document can't be sent without the ones the law and the scope
    -- lock depend on (the studio always builds them; this stops a hand-made one).
    if new.status = 'sent' and old.status = 'draft' then
      if jsonb_typeof(new.document) <> 'object'
         or new.document->'client'->>'type' is distinct from new.client_type
         or new.document->>'kind' is distinct from new.kind then
        raise exception 'Agreement document does not match its client type or kind';
      end if;
      if exists (
        select 1 from unnest(
          case when new.kind = 'completion' then array['accept'] else array['terms', 'scope'] end
          || case when new.client_type = 'business' then array['authority'] else array[]::text[] end
        ) as req(id)
        where not exists (
          select 1 from jsonb_array_elements(coalesce(new.document->'consents', '[]'::jsonb)) c
          where c->>'id' = req.id and c->>'required' = 'true'
        )
      ) then
        raise exception 'Agreement document is missing required confirmations';
      end if;
      if new.client_type = 'consumer' and new.kind <> 'completion'
         and new.document->>'startChoiceRequired' is distinct from 'true' then
        raise exception 'Consumer agreements must ask when to start work';
      end if;
    end if;

    if new.status = 'void' and old.status <> 'void' then
      new.voided_at := now();
    end if;
  end if;

  new.document_hash := encode(extensions.digest(new.document::text, 'sha256'), 'hex');
  new.updated_at := now();
  return new;
end;
$$;

create trigger agreements_guard
before insert or update on public.agreements
for each row execute function public.agreements_guard();

create or replace function public.agreements_guard_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status <> 'draft' then
    raise exception 'Only drafts can be deleted — void a sent agreement instead';
  end if;
  return old;
end;
$$;

create trigger agreements_guard_delete
before delete on public.agreements
for each row execute function public.agreements_guard_delete();

-- Team-side lifecycle events are logged by trigger so the audit trail can't
-- be skipped by an API caller that forgets to write it.
create or replace function public.agreements_log_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.agreement_events (agreement_id, type, team_member_id)
    values (new.id, 'created', auth.uid());
  elsif new.sent_at is distinct from old.sent_at and new.status = 'sent' then
    insert into public.agreement_events (agreement_id, type, team_member_id, detail)
    values (new.id, 'sent', auth.uid(),
      jsonb_build_object('to', new.client_email, 'resend', old.status = 'sent'));
  elsif new.status = 'void' and old.status <> 'void' then
    insert into public.agreement_events (agreement_id, type, team_member_id, detail)
    values (new.id, 'voided', auth.uid(), jsonb_build_object('reason', new.void_reason));
  end if;
  return null;
end;
$$;

revoke all on function public.agreements_log_event() from public, anon, authenticated;

create trigger agreements_log_event
after insert or update on public.agreements
for each row execute function public.agreements_log_event();

alter table public.agreements enable row level security;
alter table public.agreement_events enable row level security;

create policy team_full_access on public.agreements
  for all using (public.is_team_member()) with check (public.is_team_member());

create policy team_read on public.agreement_events
  for select using (public.is_team_member());

-- ── Server-only RPCs for the client-facing page ──────────────────────────

create or replace function public.agreement_server_key_ok(p_key text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'agreements_server_key_sha256'
      and decrypted_secret = encode(extensions.digest(coalesce(p_key, ''), 'sha256'), 'hex')
  );
$$;

revoke all on function public.agreement_server_key_ok(text) from public, anon, authenticated;

create or replace function public.agreement_public_json(v public.agreements)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'reference', v.reference,
    'status', case when v.status = 'sent' and v.expires_at is not null and v.expires_at < now() then 'expired' else v.status end,
    'document', v.document,
    'documentHash', v.document_hash,
    'expiresAt', v.expires_at,
    'signedAt', v.signed_at,
    'signerName', v.signer_name,
    'signerConsents', v.signer_consents
  );
$$;

revoke all on function public.agreement_public_json(public.agreements) from public, anon, authenticated;

create or replace function public.agreement_open(p_key text, p_token text, p_ip text, p_user_agent text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.agreements;
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  -- Lock so a sign/void committing mid-call can't make the counter update fail.
  select * into v from public.agreements where access_token = p_token for update;
  if v.id is null or v.status = 'draft' then
    return null;
  end if;

  if v.status = 'sent' then
    perform set_config('mv.agreement_rpc', 'on', true);
    update public.agreements
      set first_viewed_at = coalesce(first_viewed_at, now()), view_count = view_count + 1
      where id = v.id
      returning * into v;
    perform set_config('mv.agreement_rpc', 'off', true);

    insert into public.agreement_events (agreement_id, type, ip, user_agent)
    values (v.id, 'viewed', left(p_ip, 64), left(p_user_agent, 500));
  end if;

  return public.agreement_public_json(v);
end;
$$;

create or replace function public.agreement_sign(
  p_key text, p_token text, p_document_hash text, p_signer_name text,
  p_consents jsonb, p_ip text, p_user_agent text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.agreements;
  v_consent jsonb;
  v_name text := btrim(coalesce(p_signer_name, ''));
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  select * into v from public.agreements where access_token = p_token for update;
  if v.id is null or v.status = 'draft' then raise exception 'not_found'; end if;
  if v.status = 'signed' then raise exception 'already_signed'; end if;
  if v.status = 'void' then raise exception 'void'; end if;
  if v.expires_at is not null and v.expires_at < now() then raise exception 'expired'; end if;
  if p_document_hash is distinct from v.document_hash then raise exception 'document_changed'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then raise exception 'name_required'; end if;

  for v_consent in select * from jsonb_array_elements(coalesce(v.document->'consents', '[]'::jsonb)) loop
    if coalesce(v_consent->>'required', 'true') <> 'false'
       and coalesce(p_consents->>(v_consent->>'id'), 'false') <> 'true' then
      raise exception 'consent_required';
    end if;
  end loop;

  if v.document->>'startChoiceRequired' = 'true'
     and coalesce(p_consents->>'startChoice', '') not in ('now', 'wait') then
    raise exception 'start_choice_required';
  end if;

  perform set_config('mv.agreement_rpc', 'on', true);
  update public.agreements set
    status = 'signed',
    signed_at = now(),
    signer_name = v_name,
    signer_ip = left(p_ip, 64),
    signer_user_agent = left(p_user_agent, 500),
    signer_consents = p_consents
  where id = v.id
  returning * into v;
  perform set_config('mv.agreement_rpc', 'off', true);

  insert into public.agreement_events (agreement_id, type, ip, user_agent, detail)
  values (v.id, 'signed', left(p_ip, 64), left(p_user_agent, 500),
    jsonb_build_object('signer_name', v_name, 'document_hash', v.document_hash, 'consents', p_consents));

  return public.agreement_public_json(v)
    || jsonb_build_object('clientEmail', v.client_email, 'clientName', v.client_name, 'signerIp', v.signer_ip);
end;
$$;

create or replace function public.agreement_question(
  p_key text, p_token text, p_message text, p_ip text, p_user_agent text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.agreements;
  v_message text := btrim(coalesce(p_message, ''));
begin
  if not public.agreement_server_key_ok(p_key) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  select * into v from public.agreements where access_token = p_token;
  if v.id is null or v.status in ('draft', 'void') then raise exception 'not_found'; end if;
  if char_length(v_message) < 2 or char_length(v_message) > 4000 then raise exception 'message_required'; end if;
  if (select count(*) from public.agreement_events where agreement_id = v.id and type = 'question') >= 20 then
    raise exception 'too_many_questions';
  end if;

  insert into public.agreement_events (agreement_id, type, ip, user_agent, detail)
  values (v.id, 'question', left(p_ip, 64), left(p_user_agent, 500), jsonb_build_object('message', v_message));

  return jsonb_build_object(
    'reference', v.reference, 'title', v.title,
    'clientName', v.client_name, 'clientEmail', v.client_email
  );
end;
$$;

revoke all on function public.agreement_open(text, text, text, text) from public;
revoke all on function public.agreement_sign(text, text, text, text, jsonb, text, text) from public;
revoke all on function public.agreement_question(text, text, text, text, text) from public;
grant execute on function public.agreement_open(text, text, text, text) to anon, authenticated;
grant execute on function public.agreement_sign(text, text, text, text, jsonb, text, text) to anon, authenticated;
grant execute on function public.agreement_question(text, text, text, text, text) to anon, authenticated;
