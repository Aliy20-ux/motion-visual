// POST /api/quote-request — the quote form's backend.
//  • Essential / Signature: prices the package from src/pricing.ts (never trusting client totals), saves it
//    to the quotes table (sequential reference + rate limits), emails the customer their quote and sends
//    the team the brief plus a filing record.
//  • Flagship, shop or e-commerce requests: no automatic quote — the team gets a scoping-call request.
// If the database can't be reached the quote is still sent with a fallback reference, and the team email
// says it wasn't recorded. Rate limiting only applies when the database is reachable.
import { buildQuote, ADD_ONS } from '../../src/pricing';
import { COMPANY } from '../../src/legal/company';
import { customerQuoteEmail, issueQuote, quoteDates, quoteRecord, teamCallEmail, teamQuoteEmail, type QuoteCustomer } from '../../server/quotes';
import { clientIp, json, readJson, rpc, RpcError, sendEmail, TEAM_INBOX, type Ctx } from '../../server/agreements';
import { hasControlChars } from '../../server/input';
import { verifyTurnstile } from '../../server/turnstile';

type Payload = {
  name?: unknown; email?: unknown; phone?: unknown; project_type?: unknown; budget?: unknown; notes?: unknown;
  plan?: unknown; extraPages?: unknown; addOnIds?: unknown; elapsedMs?: unknown; turnstileToken?: unknown;
};

// Matches the browser's MIN_HUMAN_FILL_MS check in QuoteForm — a second line of defence for scripted posts.
const MIN_HUMAN_FILL_MS = 2500;

// Control characters (NUL especially) are never valid in a form field. Line breaks are fine in notes.
const text = (value: unknown, max: number): string | null =>
  typeof value === 'string' && value.length <= max && !hasControlChars(value) ? value.trim() : null;

const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

/** Only a hash of the address is stored — enough to rate limit, not enough to identify anyone. */
async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`mv-quote:${ip}`));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<Payload>(request);
  if (!body) return json({ error: 'Invalid request' }, 400);

  const name = text(body.name, 120);
  const email = text(body.email, 254);
  const phone = text(body.phone ?? '', 40);
  const projectType = text(body.project_type, 60);
  const notes = text(body.notes ?? '', 4000);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone === null || !projectType || notes === null) {
    return json({ error: 'Missing or invalid fields' }, 400);
  }
  const customer: QuoteCustomer = { name, email, phone, projectType, notes };

  // Bot-shaped: finished faster than a person could. Say nothing useful, send nothing.
  if (typeof body.elapsedMs !== 'number' || body.elapsedMs < MIN_HUMAN_FILL_MS) return json({ mode: 'call' });

  const ip = clientIp(request);
  if (!(await verifyTurnstile(env, body.turnstileToken, ip))) return json({ error: 'verification_failed' }, 400);

  const addOnIds = Array.isArray(body.addOnIds) ? body.addOnIds.filter((id): id is string => typeof id === 'string') : [];
  const wantsCall = body.plan === 'Flagship'
    || projectType === 'E-commerce'
    || addOnIds.some(id => ADD_ONS.find(a => a.id === id)?.flagship);

  if (wantsCall) {
    const mail = teamCallEmail(customer, typeof body.plan === 'string' ? body.plan : 'Flagship', addOnIds);
    const sent = await sendEmail(env, { to: [TEAM_INBOX], subject: mail.subject, html: mail.html, replyTo: email });
    return sent ? json({ mode: 'call' }) : json({ error: 'Failed to send' }, 502);
  }

  const checked = buildQuote({ plan: body.plan, extraPages: body.extraPages, addOnIds: body.addOnIds ?? [] });
  if (!checked.ok) return json({ error: checked.error }, 400);
  const { quote } = checked;

  // Save first: this issues the sequential reference and enforces the rate limits.
  let ref: string | undefined;
  let briefToken: string | undefined;
  try {
    const { issuedOn, validUntil } = quoteDates();
    const saved = await rpc<{ reference: string; briefToken: string }>(env, 'web_quote_create', {
      p_ip_hash: await hashIp(ip),
      p_name: name,
      p_email: email,
      p_phone: phone || null,
      p_project_type: projectType,
      p_notes: notes || null,
      p_plan: quote.plan,
      p_extra_pages: quote.extraPages,
      p_add_on_ids: addOnIds,
      p_lines: quote.lines,
      p_total_pence: quote.totalPounds * 100,
      p_deposit_pence: quote.depositPounds * 100,
      p_balance_pence: quote.balancePounds * 100,
      p_issued_on: issuedOn,
      p_valid_until: validUntil,
    });
    ref = saved.reference;
    briefToken = saved.briefToken;
  } catch (err) {
    if (err instanceof RpcError && err.code === 'rate_limited') return json({ error: 'rate_limited' }, 429);
    // The database rejected the INPUT (SQLSTATE class 22 / 23). That must never fall through to "send anyway":
    // a request that always fails to save would also always skip the rate limits.
    if (err instanceof RpcError && /^(22|23)/.test(err.sqlState ?? '')) return json({ error: 'Missing or invalid fields' }, 400);
    // Anything else (migration not applied, server key missing, Supabase down): carry on without a record.
  }
  const recorded = ref !== undefined;

  const issued = issueQuote(customer, quote, ref);
  const briefUrl = briefToken ? `${COMPANY.website}/brief/${briefToken}` : undefined;
  const customerMail = customerQuoteEmail(issued, briefUrl);

  // The customer's email goes first so the team email can say whether it was delivered. The same rendered
  // HTML is attached to the team email, so the history shows exactly what the customer received.
  const record = JSON.stringify(quoteRecord(issued, recorded), null, 2);
  const customerEmailSent = await sendEmail(env, { to: [email], subject: customerMail.subject, html: customerMail.html });
  if (recorded) await rpc(env, 'web_quote_mark_email', { p_reference: issued.ref, p_sent: customerEmailSent }).catch(() => undefined);

  const team = teamQuoteEmail(issued, { customerEmailSent, recorded, briefUrl });
  const teamSent = await sendEmail(env, {
    to: [TEAM_INBOX],
    subject: team.subject,
    html: team.html,
    replyTo: email,
    attachments: [
      { filename: `${issued.ref}.json`, content: toBase64(record) },
      { filename: `${issued.ref}-quote-email.html`, content: toBase64(customerMail.html) },
    ],
  });

  if (!teamSent && !customerEmailSent) return json({ error: 'Failed to send' }, 502);
  return json({ mode: 'quote', ref: issued.ref, customerEmailSent });
};
