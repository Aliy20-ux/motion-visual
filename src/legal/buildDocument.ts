import { COMPANY, VAT_NOTE } from './company';
import { cancellationSections, POLICY_VERSION } from './policy';
import { agreementTermsSections, completionSections } from './terms';
import type { AgreementDocument, AgreementKind, ClientType, Consent, Delivery, PaymentLine } from './types';

export const TERMS_VERSION = POLICY_VERSION;

export type DocumentInput = {
  kind: AgreementKind;
  /** Only meaningful for project agreements; change requests and sign-offs are always 'standard'. */
  delivery?: Delivery;
  previewUrl?: string | null;
  title: string;
  issuedOn: string;
  client: { name: string; business: string | null; email: string; type: ClientType };
  parent: AgreementDocument['parent'];
  summary: string;
  included: string[];
  excluded: string[];
  thirdParty: string[];
  delivered: string[];
  outstanding: string[];
  totalPence: number | null;
  payments: PaymentLine[];
  timeline: string;
  revisions: string;
};

export function buildDocument(input: DocumentInput): AgreementDocument {
  const { kind, client } = input;
  const business = client.type === 'business';
  const delivery: Delivery = kind === 'project' && input.delivery === 'ready-made' ? 'ready-made' : 'standard';

  const sections = kind === 'completion'
    ? completionSections(input.parent)
    : [
        ...agreementTermsSections(client.type, kind, input.parent, delivery),
        ...cancellationSections(client.type, delivery),
      ];

  const consents: Consent[] = kind === 'completion'
    ? [{ id: 'accept', required: true, label: 'I confirm the work has been delivered as agreed, apart from anything listed under “Outstanding”.' }]
    : [
        { id: 'terms', required: true, label: 'I have read and agree to this agreement, including the terms and the Cancellation & Refund Policy.' },
        { id: 'scope', required: true, label: 'I understand the price covers only the items listed under “Included”. Anything else — including everything under “Not included” — is extra work that needs a signed Change Request.' },
      ];
  if (business) {
    consents.push({
      id: 'authority',
      required: true,
      label: client.business
        ? `I’m authorised to sign on behalf of ${client.business}.`
        : 'I’m authorised to sign on behalf of the business named above.',
    });
  }

  const startChoiceRequired = !business && kind !== 'completion';

  return {
    schema: 1,
    termsVersion: TERMS_VERSION,
    kind,
    delivery,
    previewUrl: delivery === 'ready-made' ? input.previewUrl?.trim() || null : null,
    title: input.title.trim(),
    issuedOn: input.issuedOn,
    provider: {
      legalName: COMPANY.legalName,
      tradingName: COMPANY.tradingName,
      companyNumber: COMPANY.companyNumber,
      registeredIn: COMPANY.registeredIn,
      registeredOffice: COMPANY.registeredOffice,
      email: COMPANY.email,
    },
    client: {
      name: client.name.trim(),
      business: client.business?.trim() || null,
      email: client.email.trim(),
      type: client.type,
    },
    parent: input.parent,
    summary: input.summary.trim(),
    included: clean(input.included),
    excluded: clean(input.excluded),
    thirdParty: clean(input.thirdParty),
    delivered: clean(input.delivered),
    outstanding: clean(input.outstanding),
    totalPence: input.totalPence,
    vatNote: VAT_NOTE,
    payments: input.payments.map(p => ({ label: p.label.trim(), amountPence: p.amountPence, due: p.due.trim() })),
    timeline: input.timeline.trim(),
    revisions: input.revisions.trim(),
    sections,
    consents,
    startChoiceRequired,
    startChoices: startChoiceRequired
      ? {
          now: 'Please start work within my 14-day cancellation period. I understand that if I cancel within those 14 days, I’ll pay for the work done up to that point, and that I’ll lose my right to cancel once the work is fully completed.',
          wait: 'Please don’t start work until my 14-day cancellation period has ended.',
        }
      : null,
  };
}

function clean(lines: string[]): string[] {
  return lines.map(l => l.trim()).filter(Boolean);
}

/** One item per line in the studio editor's textareas. */
export function splitLines(text: string): string[] {
  return text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
}
