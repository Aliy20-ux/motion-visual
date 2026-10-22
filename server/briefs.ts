// The customer's first-design brief: validation, the paste-ready Claude prompt and the emails.
// Pure functions (no I/O). The prompt is a template — nothing is sent to an AI service automatically,
// so a person always reviews it first.
import { COMPANY } from '../src/legal/company';
import { ADD_ONS, gbp } from '../src/pricing';
import { escapeHtml } from './quotes';

export const BRIEF_FIELDS = [
  { key: 'businessName', label: 'Business name', max: 120, required: true },
  { key: 'whatYouDo', label: 'What the business does', max: 1500, required: true },
  { key: 'location', label: 'Location and opening hours', max: 600 },
  { key: 'contactDetails', label: 'Contact details to show on the site', max: 600 },
  { key: 'logoAndColours', label: 'Logo, brand colours and fonts', max: 800 },
  { key: 'pages', label: 'What each page should say or show', max: 4000 },
  { key: 'servicesAndPrices', label: 'Services, products and prices', max: 3000 },
  { key: 'links', label: 'Links to use (booking, ordering, social, Google Business Profile)', max: 1000 },
  { key: 'likedSites', label: 'Websites you like', max: 1000 },
  { key: 'dislikes', label: 'Anything you dislike or want to avoid', max: 1000 },
  { key: 'tone', label: 'The feel or tone you want', max: 600 },
  { key: 'anythingElse', label: 'Anything else', max: 2000 },
] as const;

export type BriefKey = typeof BRIEF_FIELDS[number]['key'];
export type Brief = Record<BriefKey, string>;

/** Returns the cleaned brief, or an error message for the first problem. Unknown keys are dropped. */
export function validateBrief(input: unknown): { ok: true; brief: Brief } | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Invalid brief' };
  const raw = input as Record<string, unknown>;
  const brief = {} as Brief;
  for (const f of BRIEF_FIELDS) {
    const value = raw[f.key] ?? '';
    if (typeof value !== 'string' || value.length > f.max) return { ok: false, error: `${f.label} is too long` };
    const trimmed = value.trim();
    if ('required' in f && f.required && !trimmed) return { ok: false, error: `${f.label} is required` };
    brief[f.key] = trimmed;
  }
  return { ok: true, brief };
}

export type BriefQuote = {
  reference: string;
  customerName: string;
  customerEmail: string;
  plan: string;
  extraPages: number;
  addOnIds: string[];
  lines: { label: string; pounds: number | null; note?: string }[];
  totalPence: number;
  status: string;
};

const addOnNames = (ids: string[]) => ids.map(id => ADD_ONS.find(a => a.id === id)?.name ?? id);

/** A prompt to paste into Claude, which writes the build prompt for the first draft. */
export function claudePrompt(q: BriefQuote, brief: Brief): string {
  const pages = q.plan === 'Essential' ? 1 + q.extraPages : 5 + q.extraPages;
  const field = (label: string, value: string) => `${label}: ${value || '(not provided — use a clearly labelled placeholder, do not invent)'}`;
  return [
    'You are helping a web design studio (Motion Visual) start a client website.',
    `Write a detailed, ready-to-use build prompt for the FIRST DRAFT design of this website, from the brief below. The prompt will be given to a coding assistant, so be specific about structure, sections, copy slots, visual direction and interactions.`,
    '',
    'Rules for the prompt you write:',
    '- Never invent business facts, prices, reviews, awards, staff names or client names. Anything missing must appear as a visibly labelled placeholder.',
    '- Mobile-first, accessible, fast. Respect prefers-reduced-motion. Distinctive typography (no generic template look).',
    '- Do not promise search rankings or business results.',
    `- Stack: React + Vite, Tailwind CSS v4, Framer Motion / motion. Scope it to ${pages} page${pages > 1 ? 's' : ''}, nothing more.`,
    '',
    `## Package (${q.reference})`,
    `${q.plan} — ${gbp(q.totalPence / 100)} one-off`,
    ...q.lines.map(l => `- ${l.label}${l.note ? ` (${l.note})` : ''}`),
    q.addOnIds.length ? `Add-ons to design for: ${addOnNames(q.addOnIds).join(', ')}` : 'No add-ons.',
    '',
    '## Client brief',
    ...BRIEF_FIELDS.map(f => field(f.label, brief[f.key])),
  ].join('\n');
}

export function teamBriefEmail(q: BriefQuote, brief: Brief): { subject: string; html: string } {
  const prompt = claudePrompt(q, brief);
  const html = `<div style="font-family:-apple-system,sans-serif;max-width:680px;margin:0 auto;">
    <h2 style="margin-bottom:4px;">Brief received — ${escapeHtml(q.reference)}</h2>
    <p style="color:#666;margin-top:0;">${escapeHtml(brief.businessName)} (${escapeHtml(q.customerName)}, ${escapeHtml(q.customerEmail)}) — ${escapeHtml(q.plan)} ${escapeHtml(gbp(q.totalPence / 100))}. Quote status: <strong>${escapeHtml(q.status)}</strong>.</p>
    <p style="color:#b00020;"><strong>Don't start the first design until the Project Agreement is signed and the deposit has cleared</strong> (check /studio). The 48-hour target runs from the signed agreement and content.</p>
    <p style="color:#666;">Logos and photos aren't collected by the form — the customer was asked to email them quoting ${escapeHtml(q.reference)}.</p>
    <p style="color:#666;">Paste this into Claude to get the first-draft build prompt (review it before use):</p>
    <pre style="white-space:pre-wrap;background:#f5f5f5;padding:14px;border-radius:8px;font-size:13px;line-height:1.5;">${escapeHtml(prompt)}</pre>
  </div>`;
  return { subject: `Brief received ${q.reference}: ${brief.businessName}`, html };
}

export function customerBriefReceipt(q: BriefQuote, brief: Brief): { subject: string; html: string } {
  const first = escapeHtml(q.customerName.trim().split(/\s+/)[0] || 'there');
  const html = `<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;line-height:1.6;">
    <p>Hi ${first},</p>
    <p>Thanks — we've received your brief for <strong>${escapeHtml(brief.businessName)}</strong> (quote ${escapeHtml(q.reference)}).</p>
    <p>Please email your <strong>logo and photos</strong> to <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>, quoting ${escapeHtml(q.reference)}.</p>
    <p>We'll start your first design once your Project Agreement is signed and we have your content, and we aim to share it within 2 working days of that. If you haven't got your agreement yet, just reply to this email.</p>
    <p style="color:#666;font-size:12px;">${escapeHtml(COMPANY.legalName)} · ${escapeHtml(COMPANY.registeredOffice)}</p>
  </div>`;
  return { subject: `We've got your brief (${q.reference})`, html };
}
