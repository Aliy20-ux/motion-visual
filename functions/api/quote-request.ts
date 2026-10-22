// POST /api/quote-request — the quote form's backend.
//  • Essential / Signature: prices the package from src/pricing.ts (never trusting client totals),
//    emails the customer their quote and sends the team the brief + a filing record.
//  • Flagship, shop or e-commerce requests: no automatic quote — the team gets a scoping-call request.
import { buildQuote, ADD_ONS } from '../../src/pricing';
import { customerQuoteEmail, issueQuote, quoteRecord, teamCallEmail, teamQuoteEmail, type QuoteCustomer } from '../../server/quotes';
import { json, readJson, sendEmail, TEAM_INBOX, type Ctx } from '../../server/agreements';

type Payload = {
  name?: unknown; email?: unknown; phone?: unknown; project_type?: unknown; budget?: unknown; notes?: unknown;
  plan?: unknown; extraPages?: unknown; addOnIds?: unknown; elapsedMs?: unknown;
};

// Matches the browser's MIN_HUMAN_FILL_MS check in QuoteForm — a second line of defence for scripted posts.
const MIN_HUMAN_FILL_MS = 2500;

const text = (value: unknown, max: number): string | null =>
  typeof value === 'string' && value.length <= max ? value.trim() : null;

const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

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

  const issued = issueQuote(customer, checked.quote);
  const customerMail = customerQuoteEmail(issued);

  // The customer's email goes first so the team email can say whether it was delivered. The same rendered
  // HTML is attached to the team email, so the history shows exactly what the customer received.
  const record = JSON.stringify(quoteRecord(issued), null, 2);
  const customerEmailSent = await sendEmail(env, { to: [email], subject: customerMail.subject, html: customerMail.html });
  const team = teamQuoteEmail(issued, customerEmailSent);
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
