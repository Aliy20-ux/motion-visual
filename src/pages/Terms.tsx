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
        <li>Essential — £800, one-off: a single landing page</li>
        <li>Signature — £1,600, one-off: up to 5 pages, including the Lite Order Builder</li>
        <li>Flagship — scoped and quoted individually on a call</li>
      </ul>
      <p>
        Add-ons are priced separately, and an extra page is £80. Exact pricing for your project is
        confirmed in writing before work begins. Third-party costs — such as booking tools, SMS,
        stock photos and fonts — are paid by you.
      </p>

      <h2>Deposit and payment</h2>
      <p>
        You pay a deposit when you sign your Project Agreement: about 25% of the build price,
        rounded up to the nearest £5. Your agreement shows the exact amount, and it's part of the
        price. We start work once your deposit has cleared and we have the content we need. The
        balance is due within 7 days of us sharing your finished site with you, and we launch your
        site once it has cleared. Flagship payment terms are agreed individually in your project
        details. We never charge interest.
      </p>

      <h2>Delivery</h2>
      <p>
        We aim to have every site — Essential, Signature and Flagship — ready to share by day 14.
        The 14-day clock starts once we have your signed agreement and your content, such as your
        your brief and links to your social pages. We aim to share your first design within 2 working days (our
        48-hour target) of that day; if we haven't by then for a reason within our control, you can
        cancel before we share it and we'll refund your deposit in full. Two rounds of changes are included. If you don't reply to something
        we've shared within 7 days, it counts as approved, and if we've heard nothing from you for
        14 days while we're waiting on you, the project pauses. Our dates move back when the delay
        is on your side. If you buy a ready-made site we've already built for you, we make one
        round of changes and it goes live within 3 working days of your balance clearing.
      </p>

      <h2>Late payment</h2>
      <p>
        We never charge interest or late fees. If a payment is late, we may pause work on your
        project until it's settled, and if we host your live site we may pause it too, after at
        least 7 days' written notice. Ownership of the work stays with us until you've paid in
        full. If you pay your balance early, we'll thank you with one small extra update.
      </p>

      <h2>Cancellation</h2>
      <p>
        If you're a consumer, you have 14 days from signing to cancel for a full refund, and you
        choose whether we start straight away or wait. If you ask us to start and then cancel
        within the 14 days, you pay only a fair share for the work done, never more than the price.
        If you're a business, including a sole trader buying for your business, what you owe
        depends on how far the project has got: nothing before we begin, your deposit if work has
        started, 40% once we've shared the design direction, 70% once the build is underway, and
        100% once we've shared your finished site, with your deposit counting towards each amount.
        If we cancel or can't deliver, you get a full refund. The full rules are in our{' '}
        <Link to="/cancellation">Cancellation &amp; Refund Policy</Link>, which forms part of every
        Project Agreement.
      </p>

      <h2>Ownership</h2>
      <p>
        Once a project is paid in full, you own the final website we deliver to you. Until then
        it stays ours. We retain the right to showcase completed work in our own portfolio and
        marketing, unless you ask us not to.
      </p>

      <h2>Domains</h2>
      <p>
        We register your domain through our Cloudflare account in your name, as the legal holder,
        and manage it for you. The first year is included in your price; after that, renewals are
        included in a care plan or invoiced at cost. If you already have a domain with another
        provider, we'll move it to us with your help. You can take your domain over at any time —
        we'll transfer it within 5 working days of your request, once all invoices are paid. If
        you'd also like us to move your hosting elsewhere, there is a £150 handover fee.
      </p>

      <h2>Care plans</h2>
      <p>
        For 30 days after launch, we'll fix bugs — things that don't work as agreed — free of
        charge. New features, content changes and changes to approved designs are extra work.
        After 30 days, support is available through a care plan or at a quoted price.
      </p>
      <p>
        Care plans (hosting, updates and support) are optional. Every plan includes hosting, an SSL
        certificate, backups, uptime monitoring and small design tweaks. Essential care is £49.99,
        with 3 updates and a reply within 2 working days. Signature care is £79, with 6 updates, a
        reply within 1 working day and a short report. Flagship care is from £129, scoped with you,
        with up to 12 updates (fair use), same-day replies and a quarterly review call. Unused
        updates don't roll over.
      </p>
      <p>
        Care plans are paid monthly by direct debit and have a minimum term of 3 months from the
        start date. You can prepay a year and pay for 11 payments instead of 12. After the minimum
        term, you can cancel at any time by emailing{' '}
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
      <p>
        After the minimum term you can step down to a smaller plan, or to Keep-alive (£30:
        hosting, security, backups and monitoring, with no updates), with 5 working days' written
        notice, effective from your next payment. Keep-alive is only available as a step down; on
        Keep-alive a small update is £15 and an extra page is £80. You can also pause a care plan
        for up to 2 months, once a year: your site stays live and no updates are made. Stepping
        down, pausing or leaving doesn't give any refund or reduction of the original build price.
      </p>
      <p>
        You can upgrade from Essential to Signature after 12 months on an active Essential care
        plan, counted from your launch date. The one-off fee is £800, less credit for anything
        you've already bought that Signature includes (extra pages, up to 4 at £80 each, and the
        Lite Order Builder at £250), with a minimum fee of £400. Your care plan rises from £49.99
        to £79 from the payment period after the fee is paid.
      </p>

      <h2>Liability</h2>
      <p>
        We'll do our best work on every project, but we can't guarantee specific business
        outcomes — like search rankings, traffic or sales — resulting from your website, since those depend on
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
