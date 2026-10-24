import LegalLayout from '../components/site/LegalLayout';
import LegalSections from '../components/agreement/LegalSections';
import { cancellationSections, POLICY_UPDATED } from '../legal/policy';
import { COMPANY, COMPANY_DISCLOSURE } from '../legal/company';

const atAGlance = [
  'Your 14 days start once we have your signed agreement and your content.',
  'First design within 2 working days of that — our 48-hour target.',
  'Consumers can cancel within 14 days of signing. If you asked us to start in that time, you pay only for the work done.',
  'Business clients: what you owe depends on how far the project has got.',
  'Balance due within 7 days of us sharing your finished site.',
  'We never charge interest or late fees.',
];

export default function Cancellation() {
  return (
    <LegalLayout
      title="Cancellation & Refund Policy"
      description="How a Motion Visual project runs and what happens if it’s cancelled — the 14-day consumer right to cancel, cancellation stages, late payment and care plans."
      updated={POLICY_UPDATED}
      prose={false}>
      <section aria-label="At a glance" className="mb-10 p-6 sm:p-8" style={{ border: '1px solid rgba(237,232,220,0.1)', background: 'rgba(237,232,220,0.03)' }}>
        <p className="font-body text-[9px] tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(237,232,220,0.5)' }}>At a glance</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
          {atAGlance.map(line => (
            <li key={line} className="flex gap-3 font-body font-light text-sm leading-relaxed" style={{ color: '#EDE8DC' }}>
              <span aria-hidden="true" className="mt-2.5 w-3 h-px shrink-0 gradient-bg" />
              {line}
            </li>
          ))}
        </ul>
        <p className="font-body font-light text-xs leading-relaxed mt-6" style={{ color: 'rgba(237,232,220,0.5)', maxWidth: '62ch' }}>
          Every project has a signed agreement, and this policy forms part of it. The plain-English notes beside each section are there to help; the full wording is what counts.
        </p>
      </section>

      <LegalSections sections={cancellationSections('public')} headingLevel={2} />

      <div className="legal-prose" style={{ borderTop: '1px solid rgba(237,232,220,0.07)', paddingTop: '1.75rem' }}>
        <h2>Contact</h2>
        <p>
          To cancel, or with any questions about this policy, email{' '}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and quote your agreement reference.
        </p>
        <p>{COMPANY_DISCLOSURE}</p>
      </div>
    </LegalLayout>
  );
}
