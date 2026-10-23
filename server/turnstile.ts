// Cloudflare Turnstile verification for the public forms.
// Opt-in: with no TURNSTILE_SECRET_KEY the check is skipped, so the forms keep working until the widget
// is set up (see docs/QUOTES.md). Once the secret is set, every request must carry a valid token.
import type { AgreementEnv } from './agreements';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const turnstileEnabled = (env: AgreementEnv): boolean => Boolean(env.TURNSTILE_SECRET_KEY);

export async function verifyTurnstile(env: AgreementEnv, token: unknown, ip: string | null): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false;
  try {
    const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    if (ip) form.set('remoteip', ip);
    const res = await fetch(env.TURNSTILE_VERIFY_URL ?? VERIFY_URL, { method: 'POST', body: form });
    if (!res.ok) return false;
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false; // can't verify -> don't send
  }
}
