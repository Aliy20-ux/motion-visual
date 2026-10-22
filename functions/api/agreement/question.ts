import {
  clientIp, json, readJson, rpc, RpcError, sendEmail, SIGN_ERRORS, TEAM_INBOX, TOKEN_PATTERN, userAgent, type Ctx,
} from '../../../server/agreements';
import { emailShell, escapeHtml } from '../../../src/legal/renderHtml';

type Asked = { reference: string; title: string; clientName: string; clientEmail: string };

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<{ token?: string; message?: string }>(request);
  if (!body || !TOKEN_PATTERN.test(body.token ?? '')) return json({ error: SIGN_ERRORS.not_found }, 404);
  const message = (body.message ?? '').trim();

  let asked: Asked;
  try {
    asked = await rpc<Asked>(env, 'agreement_question', {
      p_token: body.token,
      p_message: message,
      p_ip: clientIp(request),
      p_user_agent: userAgent(request),
    });
  } catch (err) {
    const code = err instanceof RpcError ? err.code : 'rpc_failed';
    const status = err instanceof RpcError ? err.status : 500;
    return json({ error: SIGN_ERRORS[code] ?? 'Something went wrong sending your question.' }, status);
  }

  const sent = await sendEmail(env, {
    to: [TEAM_INBOX],
    replyTo: asked.clientEmail,
    subject: `Question on ${asked.reference}: ${asked.title}`,
    html: emailShell(
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;"><strong>${escapeHtml(asked.clientName)}</strong> (${escapeHtml(asked.clientEmail)}) asked a question about <strong>${escapeHtml(asked.reference)} — ${escapeHtml(asked.title)}</strong> before signing:</p>
       <blockquote style="font-size:14px;line-height:1.6;margin:0 0 12px;padding:10px 14px;border-left:3px solid #a51818;background:#f6f3ec;">${escapeHtml(message).replace(/\n/g, '<br>')}</blockquote>
       <p style="font-size:13px;color:#5f5f5f;margin:0;">Reply to this email to answer them directly. If the answer changes the scope or price, void the agreement in the studio and send a revised copy.</p>`,
      'Sent from the agreement page on motion-visual.com',
    ),
  }).catch(() => false);

  if (!sent) return json({ error: 'We saved your question but couldn’t notify the team just now. Please also email admin.team@motion-visual.com so it isn’t missed.' }, 502);
  return json({ ok: true });
};
