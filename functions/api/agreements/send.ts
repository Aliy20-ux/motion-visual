import { asUser, bearer, json, jwtSubject, readJson, sendEmail, type Ctx } from '../../../server/agreements';
import { emailShell, escapeHtml } from '../../../src/legal/renderHtml';
import { formatDate, KIND_LABEL } from '../../../src/legal/format';
import { COMPANY, COMPANY_DISCLOSURE } from '../../../src/legal/company';
import type { AgreementKind } from '../../../src/legal/types';

type Row = {
  id: string;
  reference: string;
  kind: AgreementKind;
  title: string;
  status: string;
  client_name: string;
  client_email: string;
  access_token: string;
};

// Team-only: the caller's Supabase session token is forwarded to PostgREST,
// so RLS (is_team_member) is the authorisation — no separate admin secret.
export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const token = bearer(request);
  if (!token) return json({ error: 'Sign in to send agreements.' }, 401);

  const body = await readJson<{ id?: string; message?: string; validDays?: number }>(request);
  if (!body?.id || !/^[0-9a-f-]{36}$/.test(body.id)) return json({ error: 'Missing agreement id.' }, 400);
  const validDays = Math.min(Math.max(Math.round(body.validDays ?? 14), 1), 60);
  const note = (body.message ?? '').trim().slice(0, 2000);

  const found = await asUser(
    `agreements?id=eq.${body.id}&select=id,reference,kind,title,status,client_name,client_email,access_token`,
    token,
  );
  if (found.status === 401) return json({ error: 'Your session has expired. Sign in again.' }, 401);
  const rows = (await found.json().catch(() => [])) as Row[];
  const row = Array.isArray(rows) ? rows[0] : undefined;
  if (!row) return json({ error: 'Agreement not found, or you don’t have access to it.' }, 404);
  if (row.status !== 'draft' && row.status !== 'sent') {
    return json({ error: `A ${row.status} agreement can’t be sent.` }, 409);
  }

  const expiresAt = new Date(Date.now() + validDays * 86_400_000).toISOString();
  // Mark as sent before emailing: the client page only shows sent agreements,
  // so the link must work the moment the email lands.
  const updated = await asUser(`agreements?id=eq.${row.id}`, token, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'sent', sent_at: new Date().toISOString(), expires_at: expiresAt }),
  });
  if (!updated.ok) {
    const detail = (await updated.json().catch(() => null)) as { message?: string } | null;
    return json({ error: detail?.message ?? 'Couldn’t update the agreement.' }, 400);
  }

  // Always the public domain — never a *.pages.dev alias the team happened to use.
  const link = `${COMPANY.website}/agreement/${row.access_token}`;

  // The row is already sent: from here on, any failure is reported as an
  // unsent email (with the link to share by hand), never as a failed send.
  const emailed = await sendInvite(env, token, row, link, note, expiresAt).catch(() => false);
  return json({ ok: true, emailed, link, expiresAt }, emailed ? 200 : 502);
};

async function sendInvite(env: Ctx['env'], token: string, row: Row, link: string, note: string, expiresAt: string): Promise<boolean> {
  let senderName = 'The Motion Visual team';
  const sub = jwtSubject(token);
  if (sub) {
    const member = await asUser(`team_members?id=eq.${sub}&select=full_name`, token);
    const [m] = ((await member.json().catch(() => [])) as { full_name?: string }[]) ?? [];
    if (m?.full_name) senderName = `${m.full_name}, Motion Visual`;
  }

  const label = KIND_LABEL[row.kind];
  const html = emailShell(
    `<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">Hi ${escapeHtml(row.client_name.split(' ')[0] || 'there')},</p>
     ${note ? `<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">${escapeHtml(note).replace(/\n/g, '<br>')}</p>` : ''}
     <p style="font-size:14px;line-height:1.6;margin:0 0 20px;">Your ${escapeHtml(label.toLowerCase())} for <strong>${escapeHtml(row.title)}</strong> is ready. It sets out exactly what’s included, the price and payments, and our terms — with a plain-English note beside every clause. Please read it through, and sign online when you’re happy.</p>
     <p style="margin:0 0 20px;"><a href="${escapeHtml(link)}" style="display:inline-block;background:#a51818;color:#ffffff;text-decoration:none;font-size:14px;padding:12px 22px;border-radius:999px;">Review and sign</a></p>
     <p style="font-size:13px;line-height:1.6;color:#5f5f5f;margin:0 0 6px;">Reference ${escapeHtml(row.reference)} · open until ${escapeHtml(formatDate(expiresAt))}.</p>
     <p style="font-size:13px;line-height:1.6;color:#5f5f5f;margin:0 0 20px;">Questions? Reply to this email, or use “Ask a question” on the agreement page — nothing is binding until you sign.</p>
     <p style="font-size:14px;line-height:1.6;margin:0;">${escapeHtml(senderName)}</p>`,
    COMPANY_DISCLOSURE,
  );

  return sendEmail(env, {
    to: [row.client_email],
    subject: `${label} ready to sign: ${row.title} (${row.reference})`,
    html,
  });
}
