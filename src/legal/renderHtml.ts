// Email-safe HTML rendering of an agreement snapshot. Shared by the Pages
// Functions (receipt emails) — must stay free of browser/React imports.
import { formatDate, formatDateTime, formatGBP, KIND_LABEL } from './format';
import type { AgreementDocument, Block, LegalSection } from './types';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ink = '#1a1a1a';
const muted = '#5f5f5f';
const rule = '#e4e0d6';
const accent = '#a51818';

const h2 = (text: string) =>
  `<h2 style="font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:20px;color:${ink};margin:28px 0 8px;">${escapeHtml(text)}</h2>`;
const p = (text: string, style = '') =>
  `<p style="font-size:14px;line-height:1.6;color:${ink};margin:0 0 10px;${style}">${escapeHtml(text)}</p>`;
const ul = (items: string[]) =>
  `<ul style="margin:0 0 10px;padding-left:20px;">${items.map(i => `<li style="font-size:14px;line-height:1.6;color:${ink};margin-bottom:4px;">${escapeHtml(i)}</li>`).join('')}</ul>`;

function block(b: Block): string {
  if (b.type === 'p') return p(b.text);
  if (b.type === 'ul') return ul(b.items);
  return `<table style="width:100%;border-collapse:collapse;margin:4px 0 12px;font-size:13px;">
    <tr>${b.head.map(h => `<th style="text-align:left;padding:8px;border-bottom:2px solid ${rule};color:${muted};font-weight:600;">${escapeHtml(h)}</th>`).join('')}</tr>
    ${b.rows.map(r => `<tr>${r.map(c => `<td style="padding:8px;border-bottom:1px solid ${rule};color:${ink};vertical-align:top;">${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}
  </table>`;
}

function section(s: LegalSection, n: number): string {
  return `<div style="margin:0 0 18px;">
    <h3 style="font-size:15px;color:${ink};margin:0 0 6px;">${n}. ${escapeHtml(s.heading)}</h3>
    ${s.plain ? `<p style="font-size:13px;line-height:1.5;color:${muted};background:#f6f3ec;border-left:3px solid ${accent};padding:8px 10px;margin:0 0 8px;"><strong>In plain English:</strong> ${escapeHtml(s.plain)}</p>` : ''}
    ${s.blocks.map(block).join('')}
  </div>`;
}

export type SignatureRecord = {
  signerName: string;
  signedAt: string;
  ip: string | null;
  documentHash: string;
  startChoice?: string | null;
};

export function renderAgreementHtml(doc: AgreementDocument, signature?: SignatureRecord): string {
  const parts: string[] = [];
  parts.push(`<p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${muted};margin:0 0 4px;">${escapeHtml(KIND_LABEL[doc.kind])}${doc.delivery === 'ready-made' ? ' · Ready-made site' : ''}${doc.reference ? ` · ${escapeHtml(doc.reference)}` : ''}</p>`);
  parts.push(`<h1 style="font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:28px;color:${ink};margin:0 0 16px;">${escapeHtml(doc.title)}</h1>`);
  parts.push(p(`Between ${doc.provider.legalName} and ${doc.client.business ? `${doc.client.business} (${doc.client.name})` : doc.client.name} — issued ${formatDate(doc.issuedOn)}.`, `color:${muted};`));
  if (doc.parent) parts.push(p(`Relates to: ${doc.parent.reference ? `${doc.parent.reference} — ` : ''}${doc.parent.title}`, `color:${muted};`));

  if (doc.summary) { parts.push(h2('Summary')); parts.push(p(doc.summary)); }
  if (doc.kind === 'completion') {
    if (doc.delivered.length) { parts.push(h2('Delivered')); parts.push(ul(doc.delivered)); }
    if (doc.outstanding.length) { parts.push(h2('Outstanding')); parts.push(ul(doc.outstanding)); }
  } else {
    if (doc.delivery === 'ready-made' && doc.previewUrl) {
      parts.push(h2('The website you’re buying'));
      parts.push(`<p style="font-size:14px;line-height:1.6;margin:0 0 10px;"><a href="${escapeHtml(doc.previewUrl)}" style="color:${accent};">${escapeHtml(doc.previewUrl)}</a></p>`);
      parts.push(p('The site shown at this link, with the changes listed under “Included”, is what this agreement covers.', `color:${muted};font-size:13px;`));
    }
    if (doc.included.length) { parts.push(h2('Included')); parts.push(ul(doc.included)); }
    if (doc.excluded.length) { parts.push(h2('Not included')); parts.push(ul(doc.excluded)); }
    if (doc.thirdParty.length) { parts.push(h2('Third-party platforms')); parts.push(ul(doc.thirdParty)); }
  }

  if (doc.totalPence !== null || doc.payments.length) {
    parts.push(h2(doc.kind === 'completion' ? 'Final balance' : 'Price and payments'));
    if (doc.totalPence !== null) parts.push(p(`${doc.kind === 'completion' ? 'Balance due' : 'Total price'}: ${formatGBP(doc.totalPence)}`, 'font-weight:600;'));
    if (doc.payments.length) {
      parts.push(`<table style="width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:13px;">
        ${doc.payments.map(pl => `<tr><td style="padding:6px 8px;border-bottom:1px solid ${rule};">${escapeHtml(pl.label)}</td><td style="padding:6px 8px;border-bottom:1px solid ${rule};color:${muted};">${escapeHtml(pl.due)}</td><td style="padding:6px 8px;border-bottom:1px solid ${rule};text-align:right;">${formatGBP(pl.amountPence)}</td></tr>`).join('')}
      </table>`);
    }
    parts.push(p(doc.vatNote, `color:${muted};font-size:12px;`));
  }
  if (doc.timeline) { parts.push(h2('Timeline')); parts.push(p(doc.timeline)); }
  if (doc.revisions) { parts.push(h2('Revisions')); parts.push(p(doc.revisions)); }

  const terms = doc.sections.filter(s => !s.id.startsWith('cp-'));
  const policy = doc.sections.filter(s => s.id.startsWith('cp-'));
  parts.push(h2(doc.kind === 'completion' ? 'Terms of this sign-off' : 'Terms'));
  parts.push(p('The plain-English notes are there to help you read the terms. The full wording is what counts.', `color:${muted};font-size:12px;`));
  terms.forEach((s, i) => parts.push(section(s, i + 1)));
  if (policy.length) {
    parts.push(h2('Cancellation & Refund Policy'));
    policy.forEach((s, i) => parts.push(section(s, terms.length + i + 1)));
  }

  if (signature) {
    parts.push(`<div style="margin-top:28px;padding:16px;border:1px solid ${rule};background:#faf8f3;">
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${muted};margin:0 0 8px;">Electronic signature record</p>
      <p style="font-family:Georgia,serif;font-style:italic;font-size:26px;color:${ink};margin:0 0 10px;">${escapeHtml(signature.signerName)}</p>
      ${p(`Signed ${formatDateTime(signature.signedAt)}${signature.ip ? ` from IP address ${escapeHtml(signature.ip)}` : ''}.`)}
      ${signature.startChoice && doc.startChoices ? p(`Start of work: ${signature.startChoice === 'now' ? doc.startChoices.now : doc.startChoices.wait}`) : ''}
      ${doc.consents.map(c => p(`✓ ${c.label}`, `font-size:13px;color:${muted};`)).join('')}
      <p style="font-size:11px;line-height:1.5;color:${muted};margin:10px 0 0;word-break:break-all;">Document fingerprint (SHA-256): ${escapeHtml(signature.documentHash)}</p>
    </div>`);
  }

  return parts.join('\n');
}

/** Wraps body HTML in the Motion Visual email shell (light, for inbox readability). */
export function emailShell(body: string, footer: string): string {
  return `<div style="background:#f4f1ea;padding:24px 12px;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accent};margin:0 0 24px;">Motion Visual</p>
      ${body}
      <p style="font-size:11px;line-height:1.5;color:${muted};margin:32px 0 0;border-top:1px solid ${rule};padding-top:12px;">${escapeHtml(footer)}</p>
    </div>
  </div>`;
}
