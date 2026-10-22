import { Link } from 'react-router-dom';
import LegalLayout from '../components/site/LegalLayout';
import { COMPANY, COMPANY_DISCLOSURE } from '../legal/company';

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The terms governing Motion Visual's website design and development projects, including payment, delivery, and ownership."
      updated="October 2026">
      <h2>About these terms</h2>
      <p>
        These terms apply to any website design and development project undertaken by{' '}
        {COMPANY.legalName} ("Motion Visual", "we", "us") for a client ("you"). Booking a project
        with us means you agree to these terms. Every project also has its own signed Project
        Agreement setting out exactly what's included — if the two differ, the Project Agreement
        takes priority.
      </p>

      <h2>Our services</h2>
      <p>We design and build bespoke websites. Our current packages are:</p>
      <ul>
        <li>Essential — £800, one-off</li>
        <li>Signature — £1,600, one-off</li>
        <li>Flagship — scoped and quoted individually on a call</li>
      </ul>
      <p>Exact pricing for your project is confirmed in writing before work begins.</p>

      <h2>Deposit and payment</h2>
      <p>
        A £100 deposit secures your project's start date, paid when you approve the quote we give
        you by signing your Project Agreement. It's part of the price, and it's refunded in
        full if you cancel by the end of day 7. We start work once your deposit has cleared and we
        have the content we need. The balance is due when your site is ready to launch, or by day
        14 (or the date in your project details), whichever comes first. The price and payment
        schedule are shown in your project details, and Flagship payment terms are agreed
        individually there. We launch your site or hand over files once the balance has cleared,
        and we never charge interest.
      </p>

      <h2>Delivery</h2>
      <p>
        Your first draft arrives within 2 working days of receiving your deposit and content, and
        every site — Essential, Signature and Flagship — is ready to launch by day 14. Two rounds of changes are included. If you buy a
        ready-made site we've already built for you, we make one round of changes and it goes
        live within 3 working days of your balance clearing. Timelines depend on you providing
        content, feedback, and approvals promptly — delays on your side move the dates back.
      </p>

      <h2>Cancellation</h2>
      <p>
        Cancel by the end of day 7 and your deposit is refunded in full. After day 7 the deposit
        is non-refundable, and once we've shared your finished site the full price is due.
        Consumers also have a 14-day right to cancel. The full rules — including missed
        deadlines, late payment and care plans — are in our{' '}
        <Link to="/cancellation">Cancellation &amp; Refund Policy</Link>, which forms part of every
        Project Agreement.
      </p>

      <h2>Ownership</h2>
      <p>
        Once a project is paid in full, you own the final website we deliver to you. We retain
        the right to showcase completed work in our own portfolio and marketing, unless you ask
        us not to.
      </p>

      <h2>Domains</h2>
      <p>
        We register your domain through our Cloudflare account in your name, as the legal holder,
        and manage it for you. The first year is included in your price; after that, renewals are
        included in a care plan or invoiced at cost. If you already have a domain with another
        provider, we'll move it to us with your help. You can take your domain over at any time —
        we'll transfer it within 5 working days of your request, once all invoices are paid.
      </p>

      <h2>Care plans</h2>
      <p>
        For 30 days after launch, we'll fix bugs — things that don't work as agreed — free of
        charge. New features, content changes and changes to approved designs are extra work.
        After 30 days, support is available through a care plan or at a quoted price.
      </p>
      <p>
        Care plans (hosting, updates and support) are optional, paid monthly by direct debit, and
        have a minimum term of 3 months from the start date. After the minimum term, you can
        cancel at any time by emailing{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> at least 5 working days before
        your next payment date. If you tell us later than that, the next payment is still taken
        and your plan ends at the end of that month. We don't refund part-months.
      </p>
      <p>
        Cancelling your direct debit with your bank doesn't cancel your plan — you still need to
        give us notice, and payments due under the plan remain due. Your bank can always stop a
        direct debit under the Direct Debit Guarantee. If you're a consumer, your 14-day right to
        cancel also applies when you start a new care plan, whatever the minimum term.
      </p>

      <h2>Liability</h2>
      <p>
        We'll do our best work on every project, but we can't guarantee specific business
        outcomes — like traffic or sales — resulting from your website, since those depend on
        many factors outside our control. Our liability for any claim relating to a project is
        limited to the amount you've paid us for that project. Nothing in these terms limits
        liability that can't be limited by law, or affects your statutory rights as a consumer.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Scotland, and any disputes will be handled by the
        Scottish courts. If you're a consumer living elsewhere in the UK, you can also bring a
        claim in the courts where you live.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{' '}
        <a href="mailto:admin.team@motion-visual.com">admin.team@motion-visual.com</a>.
      </p>
      <p>{COMPANY_DISCLOSURE}</p>
    </LegalLayout>
  );
}
