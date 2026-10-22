// Shared helpers for the agreement Pages Functions. Lives outside functions/
// so Pages doesn't treat it as a route; wrangler bundles it into each function.

// Public values — the same ones baked into the client bundle and allowed by
// the CSP. The server key below is what actually authorises the RPCs.
export const SUPABASE_URL = 'https://ndnapekhhnrbqddfqpdh.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_wuWoDrizGoSBBl-6K7NnVw_vQNeABNP';

export const TEAM_INBOX = 'admin.team@motion-visual.com';
export const FROM = 'Motion Visual <admin.team@motion-visual.com>';

export interface AgreementEnv {
  RESEND_API_KEY: string;
  AGREEMENTS_SERVER_KEY?: string;
  /** Test-only override for the Resend endpoint (point it at a local mock). Unset in production. */
  RESEND_API_URL?: string;
  /** Test-only override for the Supabase project URL. Unset in production. */
  SUPABASE_URL_OVERRIDE?: string;
  /** Cloudflare Turnstile secret. When set, quote requests must carry a valid Turnstile token. */
  TURNSTILE_SECRET_KEY?: string;
  /** Test-only override for the Turnstile siteverify endpoint. Unset in production. */
  TURNSTILE_VERIFY_URL?: string;
}

export type Ctx = { request: Request; env: AgreementEnv };

export const TOKEN_PATTERN = /^[0-9a-f]{48}$/;

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function clientIp(request: Request): string | null {
  return request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? null;
}

export function userAgent(request: Request): string {
  return (request.headers.get('User-Agent') ?? '').slice(0, 500);
}

export class RpcError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

/** Calls an agreement_* RPC as anon, with the server key proving the call came from here. */
export async function rpc<T>(env: AgreementEnv, fn: string, args: Record<string, unknown>): Promise<T> {
  if (!env.AGREEMENTS_SERVER_KEY) throw new RpcError('not_configured', 503);
  const res = await fetch(`${env.SUPABASE_URL_OVERRIDE ?? SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_key: env.AGREEMENTS_SERVER_KEY, ...args }),
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { message?: string } | null;
    const code = detail?.message ?? 'rpc_failed';
    throw new RpcError(code, res.status === 401 || res.status === 403 ? 503 : 400);
  }
  return (await res.json()) as T;
}

/** PostgREST request as the signed-in team member, so RLS decides what they can see. */
export function asUser(path: string, accessToken: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

export function bearer(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/** Reads `sub` from a JWT without verifying it — only used after PostgREST has accepted the same token. */
export function jwtSubject(token: string): string | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '='))) as { sub?: string };
    return data.sub ?? null;
  } catch {
    return null;
  }
}

export async function sendEmail(env: AgreementEnv, email: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
  bcc?: string[];
  attachments?: { filename: string; content: string }[];
}): Promise<boolean> {
  const res = await fetch(env.RESEND_API_URL ?? 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: email.to,
      bcc: email.bcc,
      reply_to: email.replyTo ?? TEAM_INBOX,
      subject: email.subject,
      html: email.html,
      attachments: email.attachments,
    }),
  });
  return res.ok;
}

/** Client-facing wording for the RPC error codes raised in the migration. */
export const SIGN_ERRORS: Record<string, string> = {
  not_found: 'We couldn’t find this agreement. Please check the link in your email.',
  already_signed: 'This agreement has already been signed.',
  void: 'This agreement has been withdrawn. We’ll send you an updated version.',
  expired: 'This agreement has expired. Please ask us to send a fresh copy.',
  document_changed: 'This agreement has been updated since you opened it. Please reload the page and review it again.',
  name_required: 'Please type your full name to sign.',
  consent_required: 'Please tick each confirmation box before signing.',
  start_choice_required: 'Please choose when you’d like us to start work.',
  message_required: 'Please write your question before sending.',
  too_many_questions: 'You’ve sent a lot of questions on this agreement — please email admin.team@motion-visual.com instead.',
  not_configured: 'Online signing isn’t available right now. Please email us and we’ll sort it out.',
  not_authorised: 'Online signing isn’t available right now. Please email us and we’ll sort it out.',
};
