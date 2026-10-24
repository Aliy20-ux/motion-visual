// Builders for the automatic quote flow: the quote reference, the customer's quote email and the
// internal brief. Pure functions (no I/O) so they can be exercised without sending anything.
import { COMPANY, COMPANY_DISCLOSURE, VAT_NOTE } from '../src/legal/company';
import { escapeHtml } from '../src/legal/renderHtml';
import { gbp, type Quote } from '../src/pricing';

export const QUOTE_VALID_DAYS = 14;

export type QuoteCustomer = { name: string; email: string; phone: string; projectType: string; notes: string };

export type IssuedQuote = {
  ref: string;
  issuedOn: string;   // YYYY-MM-DD, UK date
  validUntil: string; // YYYY-MM-DD, UK date
  customer: QuoteCustomer;
  quote: Quote;
};

const londonDate = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });

/** Fallback only, for when the database can't be reached. Normal references come from the database sequence. Web quotes use their own series (MV-W-…) so they never collide with hand-made MV-Q-NNN quotes. */
export function newQuoteRef(now = new Date()): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const suffix = Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
  return `MV-W-${londonDate(now).replace(/-/g, '')}-${suffix}`;
}

export const quoteDates = (now = new Date()) => ({
  issuedOn: londonDate(now),
  validUntil: londonDate(new Date(now.getTime() + QUOTE_VALID_DAYS * 86_400_000)),
});

/** `ref` is the database sequence number (MV-W-0001); without one a random fallback reference is used. */
export function issueQuote(customer: QuoteCustomer, quote: Quote, ref?: string, now = new Date()): IssuedQuote {
  return { ref: ref ?? newQuoteRef(now), ...quoteDates(now), customer, quote };
}

export const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

const C = { bg: '#0A0A0B', panel: '#111113', text: '#EDE8DC', muted: '#9A968C', red: '#C41E1E', line: '#26262A' };

function linesTable(q: IssuedQuote): string {
  const rows = q.quote.lines.map(l => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid ${C.line};color:${C.text};font-size:14px;">${escapeHtml(l.label)}${l.note ? `<br><span style="color:${C.muted};font-size:12px;">${escapeHtml(l.note)}</span>` : ''}</td>
      <td style="padding:10px 0;border-top:1px solid ${C.line};color:${C.text};font-size:14px;text-align:right;white-space:nowrap;">${l.pounds === 0 ? 'Included' : l.pounds === null ? 'Quoted' : gbp(l.pounds)}</td>
    </tr>`).join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${rows}
    <tr><td style="padding:14px 0 6px;border-top:1px solid ${C.line};color:${C.text};font-size:15px;font-weight:600;">Total, one-off</td><td style="padding:14px 0 6px;border-top:1px solid ${C.line};color:${C.red};font-size:22px;text-align:right;font-family:Georgia,serif;">${gbp(q.quote.totalPounds)}</td></tr>
    <tr><td style="padding:4px 0;color:${C.muted};font-size:13px;">Deposit when you sign (25% of the build price)</td><td style="padding:4px 0;color:${C.text};font-size:13px;text-align:right;">${gbp(q.quote.depositPounds)}</td></tr>
    <tr><td style="padding:4px 0;color:${C.muted};font-size:13px;">Balance, within 7 days of us sharing your finished site</td><td style="padding:4px 0;color:${C.text};font-size:13px;text-align:right;">${gbp(q.quote.balancePounds)}</td></tr>
  </table>`;
}

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${C.bg};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.bg};"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
      <tr><td style="padding-bottom:24px;"><img src="${COMPANY.website}/logo-light.png" width="48" height="48" alt="Motion Visual" style="display:block;border:0;"></td></tr>
      ${inner}
    </table>
  </td></tr></table></body></html>`;
}

export function customerQuoteEmail(q: IssuedQuote, briefUrl?: string): { subject: string; html: string } {
  const first = escapeHtml(q.customer.name.trim().split(/\s+/)[0] || 'there');
  const html = shell(`
    <tr><td style="color:${C.muted};font-size:11px;letter-spacing:0.28em;text-transform:uppercase;padding-bottom:8px;">Quote ${escapeHtml(q.ref)}</td></tr>
    <tr><td style="color:${C.text};font-family:Georgia,serif;font-style:italic;font-size:30px;line-height:1.1;padding-bottom:16px;">Your Motion Visual quote</td></tr>
    <tr><td style="color:${C.muted};font-size:14px;line-height:1.6;padding-bottom:20px;">Hi ${first}, thanks for your enquiry. Here is the package you built on our website, issued on ${longDate(q.issuedOn)} and valid until <strong style="color:${C.text};">${longDate(q.validUntil)}</strong> (${QUOTE_VALID_DAYS} days).</td></tr>
    <tr><td style="background:${C.panel};border:1px solid ${C.line};border-radius:12px;padding:20px 22px;">${linesTable(q)}</td></tr>
    <tr><td style="color:${C.text};font-size:15px;padding:28px 0 10px;font-family:Georgia,serif;font-style:italic;">What happens next</td></tr>
    <tr><td style="color:${C.muted};font-size:14px;line-height:1.7;">
      1. <strong style="color:${C.text};">Reply to this email</strong> to say you'd like to go ahead. We'll send your Project Agreement to sign, and your deposit is paid when you sign it.<br>
      2. <strong style="color:${C.text};">Tell us about your business</strong> — ${briefUrl ? `fill in our <a href="${briefUrl}" style="color:${C.text};">short brief form</a> (it takes about 10 minutes) and share your social media pages if you have them — we'll take your logo and photos from there.` : 'tell us about your business and send us links to your social media pages if you have them — we\'ll take your logo and photos from there.'}<br>
      3. <strong style="color:${C.text};">Your first design:</strong> we aim to share it within 2 working days (our 48-hour target) of the day we have your signed agreement and your content, and your site is ready to share by day 14.
    </td></tr>
    <tr><td style="color:${C.muted};font-size:12px;line-height:1.7;padding-top:24px;">
      Optional care plans (hosting, updates and support): Essential ${gbp(49.99)}, Signature ${gbp(79)}, paid by direct debit — full details in our <a href="${COMPANY.website}/terms" style="color:${C.text};">Terms</a>. Third-party costs such as booking tools, SMS, stock photos and fonts are paid by you. We never guarantee search rankings or business results.<br><br>
      This quote isn't a contract. Your signed Project Agreement and our <a href="${COMPANY.website}/cancellation" style="color:${C.text};">Cancellation &amp; Refund Policy</a> apply once you sign. If you're a consumer, you have a 14-day right to cancel from signing.<br><br>
      Questions? Just reply, or email <a href="mailto:${COMPANY.email}" style="color:${C.text};">${COMPANY.email}</a> and quote ${escapeHtml(q.ref)}.
    </td></tr>
    <tr><td style="color:#6B675F;font-size:11px;line-height:1.6;padding-top:28px;border-top:1px solid ${C.line};margin-top:24px;">${escapeHtml(COMPANY_DISCLOSURE)} ${escapeHtml(VAT_NOTE)}</td></tr>`);
  return { subject: `Your Motion Visual quote ${q.ref}`, html };
}

/** Everything known about the request, as a plain-text brief you can paste straight into Claude. */
export function briefText(q: IssuedQuote): string {
  const { customer, quote } = q;
  return [
    `# First-draft brief — ${q.ref}`,
    '',
    `Customer: ${oneLine(customer.name)}`,
    `Email: ${customer.email}`,
    `Phone: ${oneLine(customer.phone) || 'not given'}`,
    `Project type: ${oneLine(customer.projectType)}`,
    '',
    `Package: ${quote.plan} — ${quote.pagesTotal} page${quote.pagesTotal > 1 ? 's' : ''} in total`,
    ...quote.lines.map(l => `- ${l.label}: ${l.pounds === 0 ? 'included' : l.pounds === null ? 'to be quoted' : gbp(l.pounds)}${l.note ? ` (${l.note})` : ''}`),
    `Total ${gbp(quote.totalPounds)} · deposit ${gbp(quote.depositPounds)} · balance ${gbp(quote.balancePounds)}`,
    '',
    'Customer notes:',
    customer.notes.trim() || '(none)',
    '',
    'Still to collect before the first design can be made (ask the customer):',
    '- Business name, what it does, location and opening hours',
    '- Social media links, if they have any (otherwise find their socials / Google photos yourself) and any brand colours / fonts',
    '- Text, services and prices for each page',
    '- Two or three websites they like, and anything they dislike',
    '- Any links needed (booking, Deliveroo, social, Google Business Profile)',
  ].join('\n');
}

/** Machine-readable record, attached to the internal email and filed with scripts/file-record.mjs. */
export function quoteRecord(q: IssuedQuote, recordedInDatabase: boolean) {
  return {
    type: 'quote',
    ref: q.ref,
    source: 'website (/api/quote-request)',
    issuedOn: q.issuedOn,
    validForDays: QUOTE_VALID_DAYS,
    validUntil: q.validUntil,
    customer: { name: oneLine(q.customer.name), email: q.customer.email, phone: oneLine(q.customer.phone) || null },
    project: `${q.quote.plan} website (${oneLine(q.customer.projectType)})`,
    plan: q.quote.plan,
    pagesTotal: q.quote.pagesTotal,
    lines: q.quote.lines,
    totalPounds: q.quote.totalPounds,
    depositPounds: q.quote.depositPounds,
    balancePounds: q.quote.balancePounds,
    notes: q.customer.notes.trim() || null,
    statusAtIssue: 'Quote emailed to customer; awaiting reply',
    recordedInDatabase,
    currentStatus: 'NOT RECORDED — update when the customer replies or signs',
    issuedUnderTerms: `${COMPANY.legalName}; deposit 25% of the build price (policy 2026-10-24)`,
    files: [`${q.ref}.json`, `${q.ref}-quote-email.html`],
  };
}

export function teamQuoteEmail(q: IssuedQuote, status: { customerEmailSent: boolean; recorded: boolean; briefUrl?: string }): { subject: string; html: string } {
  const { customerEmailSent, recorded, briefUrl } = status;
  const html = `<div style="font-family:-apple-system,sans-serif;max-width:640px;margin:0 auto;">
    <h2 style="margin-bottom:4px;">New web quote ${escapeHtml(q.ref)}</h2>
    <p style="color:#666;margin-top:0;">${escapeHtml(q.customer.name)} — ${escapeHtml(q.quote.plan)} ${escapeHtml(gbp(q.quote.totalPounds))}. Customer quote email: <strong>${customerEmailSent ? 'sent' : 'NOT SENT — send it manually'}</strong>.</p>
    <p style="color:#666;">Attached: <code>${escapeHtml(q.ref)}.json</code> (record) and <code>${escapeHtml(q.ref)}-quote-email.html</code> (what the customer received). File them with <code>node scripts/file-record.mjs quote &lt;json&gt; &lt;html&gt;</code>.</p>
    <p style="color:#666;">The 48-hour first-design target starts once the signed agreement and content are in (deposit is paid on signing) — not from this email.</p>
    <p style="color:#666;">${recorded ? 'Saved to the quotes database (visible in /studio/quotes).' : '<strong>NOT saved to the database</strong> (it was unreachable): this email and its attachments are the only record, and the reference is a fallback one.'}${briefUrl ? ` Customer brief form: <code>${escapeHtml(briefUrl)}</code>` : ''}</p>
    <pre style="white-space:pre-wrap;background:#f5f5f5;padding:14px;border-radius:8px;font-size:13px;line-height:1.5;">${escapeHtml(briefText(q))}</pre>
  </div>`;
  return { subject: `New web quote ${q.ref}: ${oneLine(q.customer.name)} (${q.quote.plan} ${gbp(q.quote.totalPounds)})`, html };
}

export function teamCallEmail(customer: QuoteCustomer, plan: string, addOnIds: string[]): { subject: string; html: string } {
  const html = `<div style="font-family:-apple-system,sans-serif;max-width:640px;margin:0 auto;">
    <h2 style="margin-bottom:4px;">Scoping call request</h2>
    <p style="color:#666;margin-top:0;">No automatic quote was sent — this is a Flagship / shop / e-commerce request.</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td>${escapeHtml(customer.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Email</td><td>${escapeHtml(customer.email)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Phone</td><td>${escapeHtml(customer.phone || 'Not provided')}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Project type</td><td>${escapeHtml(customer.projectType)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Package</td><td>${escapeHtml(plan)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Add-ons picked</td><td>${escapeHtml(addOnIds.join(', ') || 'none')}</td></tr>
      <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Notes</td><td>${escapeHtml(customer.notes.trim() || 'None').replace(/\n/g, '<br>')}</td></tr>
    </table></div>`;
  return { subject: `Scoping call request: ${oneLine(customer.name)}`, html };
}
