import { json, readJson, rpc, RpcError, sendEmail, TEAM_INBOX, TOKEN_PATTERN, type Ctx } from '../../../server/agreements';
import { customerBriefReceipt, teamBriefEmail, validateBrief, type BriefQuote } from '../../../server/briefs';

// POST /api/brief/submit { token, brief, website } — one submission per quote.
// `website` is a honeypot field: real visitors never see it.
export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<{ token?: string; brief?: unknown; website?: unknown }>(request);
  const token = body?.token ?? '';
  if (!TOKEN_PATTERN.test(token)) return json({ error: 'not_found' }, 404);
  if (typeof body?.website === 'string' && body.website.trim()) return json({ ok: true }); // bot: pretend it worked

  const checked = validateBrief(body?.brief);
  if (!checked.ok) return json({ error: checked.error }, 400);

  let quote: BriefQuote | null;
  try {
    quote = await rpc<BriefQuote | null>(env, 'web_quote_brief_submit', { p_token: token, p_brief: checked.brief });
  } catch (err) {
    if (err instanceof RpcError && err.code === 'already_submitted') return json({ error: 'already_submitted' }, 409);
    return json({ error: 'unavailable' }, err instanceof RpcError ? err.status : 500);
  }
  if (!quote) return json({ error: 'not_found' }, 404);

  // The brief is already saved, so a failed email never loses it; the team can read it in the database.
  const team = teamBriefEmail(quote, checked.brief);
  const teamSent = await sendEmail(env, { to: [TEAM_INBOX], subject: team.subject, html: team.html, replyTo: quote.customerEmail });
  const receipt = customerBriefReceipt(quote, checked.brief);
  await sendEmail(env, { to: [quote.customerEmail], subject: receipt.subject, html: receipt.html });
  return json({ ok: true, teamNotified: teamSent });
};
