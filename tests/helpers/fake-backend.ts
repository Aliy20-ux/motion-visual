// A fake Resend, Supabase (the web_quote_* RPCs) and Cloudflare Turnstile, installed as global fetch.
// It mirrors the behaviour the real database enforces (sequence, rate limits); the SQL itself is covered by db.test.ts.
export type SentEmail = { to: string[]; subject: string; html: string; reply_to?: string; attachments?: { filename: string; content: string }[] };

export const SERVER_KEY = 'test-server-key';
const SUPABASE_RPC = 'https://ndnapekhhnrbqddfqpdh.supabase.co/rest/v1/rpc/';

export function installFakeBackend(opts: { turnstileGoodToken?: string } = {}) {
  const realFetch = globalThis.fetch;
  const state = {
    emails: [] as SentEmail[],
    quotes: [] as { reference: string; email: string; ip: string | null; token: string; args: Record<string, unknown>; emailSent?: boolean }[],
    dbDown: false,
    /** The database rejects the input (Postgres SQLSTATE), e.g. a NUL byte: 22P05. */
    dbRejectCode: null as string | null,
    /** The migration isn't applied: PostgREST can't find the function. */
    dbMissingFunction: false,
    failEmailTo: new Set<string>(),
    /** Network-level failure talking to Resend (the fetch itself throws). */
    throwEmailTo: new Set<string>(),
    turnstileCalls: 0,
    turnstileGood: opts.turnstileGoodToken ?? 'good-token',
  };

  globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
    const url = String(input);

    if (url === 'https://api.resend.com/emails') {
      const body = JSON.parse(String(init?.body)) as SentEmail;
      if (body.to.some(t => state.throwEmailTo.has(t))) throw new TypeError('fetch failed');
      if (body.to.some(t => state.failEmailTo.has(t))) return new Response('{"message":"nope"}', { status: 500 });
      state.emails.push(body);
      return new Response('{"id":"fake"}', { status: 200 });
    }

    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      state.turnstileCalls++;
      const form = new URLSearchParams(String(init?.body));
      return Response.json({ success: form.get('response') === state.turnstileGood && Boolean(form.get('secret')) });
    }

    if (url.startsWith(SUPABASE_RPC)) {
      if (state.dbDown) throw new TypeError('fetch failed');
      if (state.dbMissingFunction) return Response.json({ code: 'PGRST202', message: 'Could not find the function' }, { status: 404 });
      const fn = url.slice(SUPABASE_RPC.length);
      const a = JSON.parse(String(init?.body)) as Record<string, unknown>;
      if (a.p_key !== SERVER_KEY) return Response.json({ message: 'not_authorised' }, { status: 403 });
      if (fn === 'web_quote_create') {
        if (state.dbRejectCode) return Response.json({ code: state.dbRejectCode, message: 'unsupported Unicode escape sequence' }, { status: 400 });
        const email = String(a.p_email).toLowerCase();
        const ip = (a.p_ip_hash as string | null) ?? null;
        if (ip && state.quotes.filter(q => q.ip === ip).length >= 5) return Response.json({ message: 'rate_limited' }, { status: 400 });
        if (state.quotes.filter(q => q.email === email).length >= 3) return Response.json({ message: 'rate_limited' }, { status: 400 });
        const reference = `MV-W-${String(state.quotes.length + 1).padStart(4, '0')}`;
        const token = (reference.replace(/\D/g, '') + 'a'.repeat(48)).slice(0, 48);
        state.quotes.push({ reference, email, ip, token, args: a });
        return Response.json({ reference, briefToken: token });
      }
      if (fn === 'web_quote_mark_email') {
        const q = state.quotes.find(x => x.reference === a.p_reference);
        if (q) q.emailSent = a.p_sent as boolean;
        return new Response('null', { status: 200 });
      }
      return Response.json({ message: 'unknown function' }, { status: 404 });
    }

    throw new Error(`unexpected fetch in test: ${url}`);
  }) as typeof fetch;

  return { state, restore: () => { globalThis.fetch = realFetch; } };
}

/** Calls the Pages Function the way Cloudflare does. */
export async function callQuoteRequest(
  handler: (ctx: never) => Promise<Response>,
  body: unknown,
  opts: { env?: Record<string, string>; ip?: string } = {},
) {
  const request = new Request('https://motion-visual.com/api/quote-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': opts.ip ?? '203.0.113.10' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const env = { RESEND_API_KEY: 'resend-key', AGREEMENTS_SERVER_KEY: SERVER_KEY, ...opts.env };
  const res = await handler({ request, env } as never);
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}
