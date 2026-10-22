export type ClientType = 'business' | 'consumer';
export type AgreementKind = 'project' | 'change' | 'completion';
export type AgreementStatus = 'draft' | 'sent' | 'signed' | 'void' | 'expired';
/** standard: built after the deposit (48h draft / day 7 / day 14). ready-made: already built and shown on a preview link. */
export type Delivery = 'standard' | 'ready-made';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] };

export type LegalSection = {
  id: string;
  heading: string;
  /** Plain-English summary shown beside the clause. Explains, never adds to, the wording. */
  plain?: string;
  blocks: Block[];
};

export type Consent = { id: string; label: string; required: boolean };

export type PaymentLine = { label: string; amountPence: number; due: string };

/**
 * The exact document a client sees and signs. It is built once, stored as
 * JSON on the agreement row, and hashed by the database — the client page and
 * the emails render from this snapshot, never from the current code, so a
 * later change to the wording can't alter what someone already signed.
 */
export type AgreementDocument = {
  schema: 1;
  termsVersion: string;
  reference?: string;
  kind: AgreementKind;
  /** Absent on documents created before ready-made sites existed — treat as 'standard'. */
  delivery?: Delivery;
  /** Where a ready-made site can be seen; it is the scope of the agreement. */
  previewUrl?: string | null;
  title: string;
  issuedOn: string;
  provider: {
    legalName: string;
    tradingName: string;
    companyNumber: string;
    registeredIn: string;
    registeredOffice: string;
    email: string;
  };
  client: { name: string; business: string | null; email: string; type: ClientType };
  /** The agreement a change request or completion sign-off relates to. */
  parent: { reference: string | null; title: string } | null;
  summary: string;
  included: string[];
  excluded: string[];
  thirdParty: string[];
  delivered: string[];
  outstanding: string[];
  totalPence: number | null;
  vatNote: string;
  payments: PaymentLine[];
  timeline: string;
  revisions: string;
  sections: LegalSection[];
  consents: Consent[];
  startChoiceRequired: boolean;
  startChoices: { now: string; wait: string } | null;
};

export type PublicAgreement = {
  reference: string;
  status: AgreementStatus;
  document: AgreementDocument;
  documentHash: string;
  expiresAt: string | null;
  signedAt: string | null;
  signerName: string | null;
  signerConsents: Record<string, boolean | string> | null;
};
