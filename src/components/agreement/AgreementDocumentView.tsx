import { Check, Minus } from 'lucide-react';
import LegalSections from './LegalSections';
import { formatDate, formatDateTime, formatGBP, KIND_LABEL } from '../../legal/format';
import type { AgreementDocument } from '../../legal/types';

const muted = 'rgba(237,232,220,0.5)';
const body = 'rgba(237,232,220,0.72)';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: muted }}>{children}</p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display italic mb-5" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.015em', color: '#EDE8DC' }}>
      {children}
    </h2>
  );
}

function ItemList({ items, tone }: { items: string[]; tone: 'in' | 'out' | 'plain' }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 font-body font-light text-[0.9rem] leading-relaxed" style={{ color: tone === 'out' ? body : '#EDE8DC' }}>
          {tone === 'in' && <Check size={15} aria-hidden="true" className="mt-1 shrink-0" style={{ color: '#E83838' }} />}
          {tone === 'out' && <Minus size={15} aria-hidden="true" className="mt-1 shrink-0" style={{ color: muted }} />}
          {tone === 'plain' && <span aria-hidden="true" className="mt-2.5 w-1.5 h-px shrink-0" style={{ background: muted }} />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type SignatureView = { signerName: string; signedAt: string; startChoice?: string | null; documentHash: string };

export default function AgreementDocumentView({ doc, signature, expiresAt }: {
  doc: AgreementDocument;
  signature?: SignatureView | null;
  expiresAt?: string | null;
}) {
  const terms = doc.sections.filter(s => !s.id.startsWith('cp-'));
  const policy = doc.sections.filter(s => s.id.startsWith('cp-'));
  const clientLine = doc.client.business ? `${doc.client.business} — ${doc.client.name}` : doc.client.name;
  const isCompletion = doc.kind === 'completion';

  return (
    <article className="print-doc">
      {/* ── Title block ── */}
      <header className="mb-14">
        <Eyebrow>{KIND_LABEL[doc.kind]}{doc.delivery === 'ready-made' ? ' · Ready-made site' : ''}{doc.reference ? ` · ${doc.reference}` : ''}</Eyebrow>
        <h1 className="font-display italic" style={{ fontSize: 'clamp(2.4rem,6vw,4.6rem)', lineHeight: 0.95, letterSpacing: '-0.025em', color: '#EDE8DC' }}>
          {doc.title}
        </h1>

        <dl className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-6 mt-10 pt-8" style={{ borderTop: '1px solid rgba(237,232,220,0.1)' }}>
          <div>
            <dt className="font-body text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: muted }}>Between</dt>
            <dd className="font-body font-light text-sm leading-relaxed" style={{ color: '#EDE8DC' }}>
              {doc.provider.legalName}
              <span className="block text-xs mt-0.5" style={{ color: muted }}>
                Company {doc.provider.companyNumber} · {doc.provider.registeredOffice}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-body text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: muted }}>And</dt>
            <dd className="font-body font-light text-sm leading-relaxed" style={{ color: '#EDE8DC' }}>
              {clientLine}
              <span className="block text-xs mt-0.5" style={{ color: muted }}>
                {doc.client.email} · {doc.client.type === 'business' ? 'Business client' : 'Consumer'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-body text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: muted }}>Issued</dt>
            <dd className="font-body font-light text-sm" style={{ color: '#EDE8DC' }}>
              {formatDate(doc.issuedOn)}
              {expiresAt && !signature && <span style={{ color: muted }}> · open until {formatDate(expiresAt)}</span>}
            </dd>
          </div>
          {doc.parent && (
            <div>
              <dt className="font-body text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: muted }}>Relates to</dt>
              <dd className="font-body font-light text-sm" style={{ color: '#EDE8DC' }}>
                {doc.parent.reference ? `${doc.parent.reference} — ` : ''}{doc.parent.title}
              </dd>
            </div>
          )}
        </dl>
      </header>

      {doc.summary && (
        <section className="mb-14" aria-labelledby="summary-h">
          <Eyebrow><span id="summary-h">Summary</span></Eyebrow>
          <p className="font-body font-light leading-relaxed" style={{ color: '#EDE8DC', fontSize: '1.02rem', maxWidth: '62ch' }}>{doc.summary}</p>
        </section>
      )}

      {/* ── Scope: what the price buys, and what it doesn't ── */}
      {isCompletion ? (
        <section className="grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-10 mb-14" aria-label="Delivery">
          {doc.delivered.length > 0 && (
            <div><H2>Delivered</H2><ItemList items={doc.delivered} tone="in" /></div>
          )}
          {doc.outstanding.length > 0 && (
            <div><H2>Outstanding</H2><ItemList items={doc.outstanding} tone="plain" /></div>
          )}
        </section>
      ) : (
        <section className="mb-14" aria-label="Scope">
          {doc.delivery === 'ready-made' && doc.previewUrl && (
            <div className="mb-10 p-5 sm:p-6" style={{ border: '1px solid rgba(196,30,30,0.3)', background: 'rgba(196,30,30,0.05)' }}>
              <Eyebrow>The website you’re buying</Eyebrow>
              <a href={doc.previewUrl} target="_blank" rel="noopener noreferrer"
                className="font-body text-sm underline underline-offset-4 break-all" style={{ color: '#E83838' }}>
                {doc.previewUrl}
              </a>
              <p className="font-body font-light text-xs leading-relaxed mt-3" style={{ color: muted, maxWidth: '62ch' }}>
                The site shown at this link, with the changes listed under “Included”, is what this agreement covers. It stays ours until it’s paid for in full.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-10">
            <div>
              <H2>Included</H2>
              <ItemList items={doc.included} tone="in" />
            </div>
            {doc.excluded.length > 0 && (
              <div className="md:pl-8 md:border-l border-[rgba(237,232,220,0.08)]">
                <H2>Not included</H2>
                <ItemList items={doc.excluded} tone="out" />
                <p className="font-body font-light text-xs leading-relaxed mt-5" style={{ color: muted }}>
                  Anything not listed under “Included” can be added with a signed Change Request.
                </p>
              </div>
            )}
          </div>
          {doc.thirdParty.length > 0 && (
            <div className="mt-10">
              <Eyebrow>Third-party platforms (their own terms and fees apply)</Eyebrow>
              <ItemList items={doc.thirdParty} tone="plain" />
            </div>
          )}
        </section>
      )}

      {/* ── Money ── */}
      {(doc.totalPence !== null || doc.payments.length > 0) && (
        <section className="mb-14" aria-labelledby="price-h">
          <H2><span id="price-h">{isCompletion ? 'Final balance' : 'Price and payments'}</span></H2>
          {doc.totalPence !== null && (
            <p className="font-display italic gradient-text mb-6" style={{ fontSize: 'clamp(2.6rem,6vw,4rem)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {formatGBP(doc.totalPence)}
            </p>
          )}
          {doc.payments.length > 0 && (
            <ol className="flex flex-col">
              {doc.payments.map((p, i) => (
                <li key={i} className="grid grid-cols-[1fr_auto] gap-x-6 py-3" style={{ borderTop: '1px solid rgba(237,232,220,0.08)' }}>
                  <span className="font-body text-sm" style={{ color: '#EDE8DC' }}>{p.label}</span>
                  <span className="font-body text-sm tabular-nums text-right" style={{ color: '#EDE8DC' }}>{formatGBP(p.amountPence)}</span>
                  <span className="font-body font-light text-xs mt-1 col-span-2" style={{ color: muted }}>{p.due}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="font-body font-light text-xs mt-4" style={{ color: muted }}>{doc.vatNote}</p>
        </section>
      )}

      {(doc.timeline || doc.revisions) && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-14" aria-label="Timeline and revisions">
          {doc.timeline && (
            <div><Eyebrow>Timeline</Eyebrow><p className="font-body font-light text-sm leading-relaxed" style={{ color: '#EDE8DC' }}>{doc.timeline}</p></div>
          )}
          {doc.revisions && (
            <div><Eyebrow>Revisions</Eyebrow><p className="font-body font-light text-sm leading-relaxed" style={{ color: '#EDE8DC' }}>{doc.revisions}</p></div>
          )}
        </section>
      )}

      {/* ── Terms ── */}
      <section aria-labelledby="terms-h" className="mb-10">
        <H2><span id="terms-h">{isCompletion ? 'Terms of this sign-off' : 'Terms'}</span></H2>
        <p className="font-body font-light text-xs leading-relaxed mb-4" style={{ color: muted, maxWidth: '60ch' }}>
          The plain-English notes are there to help you read the terms. The full wording is what counts.
        </p>
        <LegalSections sections={terms} />
      </section>

      {policy.length > 0 && (
        <section aria-labelledby="policy-h" className="mb-10">
          <H2><span id="policy-h">Cancellation &amp; Refund Policy</span></H2>
          <LegalSections sections={policy} startAt={terms.length + 1} />
        </section>
      )}

      {signature && (
        <section aria-label="Signature record" className="mt-16 p-6 sm:p-8" style={{ border: '1px solid rgba(237,232,220,0.12)', background: 'rgba(237,232,220,0.03)' }}>
          <Eyebrow>Signed electronically</Eyebrow>
          <p className="font-display italic" style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.05, color: '#EDE8DC' }}>
            {signature.signerName}
          </p>
          <p className="font-body font-light text-sm mt-3" style={{ color: body }}>{formatDateTime(signature.signedAt)}</p>
          {signature.startChoice && doc.startChoices && (
            <p className="font-body font-light text-xs leading-relaxed mt-3" style={{ color: muted }}>
              Start of work: {signature.startChoice === 'now' ? doc.startChoices.now : doc.startChoices.wait}
            </p>
          )}
          <p className="font-body text-[11px] leading-relaxed mt-5 break-all" style={{ color: muted }}>
            Document fingerprint (SHA-256): {signature.documentHash}
          </p>
        </section>
      )}
    </article>
  );
}
