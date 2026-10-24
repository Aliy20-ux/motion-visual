// "Talk to a founder" from the chat: emails the team the visitor's details and the conversation so far.
import { TEAM_INBOX, clientIp, json, readJson, sendEmail, type Ctx } from '../../server/agreements';
import { hasControlChars } from '../../server/input';
import { emailShell, escapeHtml } from '../../src/legal/renderHtml';
import { COMPANY_DISCLOSURE } from '../../src/legal/company';
import { SAFE_REPLIES, checkAllowance, hashVisitor } from '../../server/assistant';

type Body = { name?: unknown; email?: unknown; phone?: unknown; message?: unknown; transcript?: unknown; elapsedMs?: unknown };
const text = (v: unknown, max: number): string | null => (typeof v === 'string' && v.length <= max && !hasControlChars(v) ? v.trim() : null);

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<Body>(request);
  if (!body) return json({ error: 'Invalid request' }, 400);
  const name = text(body.name, 120);
  const email = text(body.email, 254);
  const phone = text(body.phone ?? '', 40);
  const message = text(body.message ?? '', 1000);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone === null || message === null) return json({ error: 'Please check your details and try again.' }, 400);
  // Bot-shaped (finished faster than a person could): say nothing useful, send nothing.
  if (typeof body.elapsedMs !== 'number' || body.elapsedMs < 2000) return json({ ok: true });

  const lines = Array.isArray(body.transcript) ? body.transcript.slice(-20) : [];
  const transcript = lines
    .filter((l): l is { role: string; content: string } => !!l && typeof l === 'object' && typeof (l as { content?: unknown }).content === 'string')
    .map(l => `${l.role === 'user' ? 'Visitor' : 'Assistant'}: ${l.content.slice(0, 1000)}`);

  const allowance = await checkAllowance(env, await hashVisitor(clientIp(request)), 'handoff');
  if (allowance === 'ip_limit') return json({ error: SAFE_REPLIES.limit }, 429);
  // If the limiter itself is unreachable we still let a real person reach the team: a hand-off is cheap, and losing a lead is not.

  const html = emailShell(
    `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Someone asked to talk to a founder from the website chat.</p>
     <p style="font-size:14px;line-height:1.7;margin:0 0 16px;"><strong>${escapeHtml(name)}</strong><br />${escapeHtml(email)}${phone ? `<br />${escapeHtml(phone)}` : ''}</p>
     ${message ? `<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">${escapeHtml(message).replace(/\n/g, '<br />')}</p>` : ''}
     <hr style="border:none;border-top:1px solid #e4e0d6;margin:16px 0;" />
     <p style="font-size:12px;color:#6b665c;margin:0 0 8px;">The conversation so far (the assistant is an AI and may be wrong):</p>
     <p style="font-size:13px;line-height:1.6;margin:0;">${transcript.length ? transcript.map(l => escapeHtml(l)).join('<br /><br />') : '(They didn’t chat first.)'}</p>`,
    COMPANY_DISCLOSURE,
  );
  const sent = await sendEmail(env, { to: [TEAM_INBOX], replyTo: email, subject: `Website chat: ${name} would like to talk`, html });
  return sent ? json({ ok: true }) : json({ error: 'Failed to send' }, 502);
};
