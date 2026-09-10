import LegalLayout from '../components/site/LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How Motion Visual collects, uses, and protects the personal data you share when you enquire about a website project."
      updated="July 2026">
      <h2>Who we are</h2>
      <p>
        Motion Visual Agency Ltd ("Motion Visual", "we", "us") is a web design agency based in
        Edinburgh, Scotland. This policy explains what personal data we collect when you use this
        website or get in touch with us, why we collect it, and what your rights are.
      </p>
      <p>
        Contact: <a href="mailto:admin.team@motion-visual.com">admin.team@motion-visual.com</a>
      </p>

      <h2>What we collect</h2>
      <p>When you submit an enquiry through our quote form, we collect:</p>
      <ul>
        <li>Your name</li>
        <li>Your email address</li>
        <li>Your phone number, if you choose to provide it — this field is optional</li>
        <li>The type of project you're enquiring about</li>
        <li>Your selected budget or package range</li>
        <li>Any additional notes you choose to share about your project</li>
      </ul>
      <p>
        We do not use cookies, analytics, or any third-party tracking scripts on this website.
      </p>

      <h2>How we use it</h2>
      <p>We use the information you provide to:</p>
      <ul>
        <li>Respond to your enquiry and prepare a proposal</li>
        <li>Contact you about your project if you decide to go ahead with us</li>
        <li>Keep a record of client relationships and project history</li>
      </ul>
      <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>

      <h2>Legal basis</h2>
      <p>
        We process your data on the basis of legitimate interest — responding to an enquiry you've
        chosen to submit to us — and, where you become a client, to perform a contract with you.
      </p>

      <h2>Where your data is stored</h2>
      <p>
        Your enquiry is stored securely in our client management system, and a copy is sent by
        email to our team via our email delivery provider, Resend, so we can respond promptly.
        Access is limited to our team.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep enquiry data for as long as necessary to respond to you and, if you become a
        client, for the duration of our working relationship and for as long afterwards as
        required for our accounting and legal obligations. If your enquiry doesn't lead to a
        project, we'll delete your details after a reasonable period.
      </p>

      <h2>Your rights</h2>
      <p>Under UK data protection law, you have the right to:</p>
      <ul>
        <li>Ask what personal data we hold about you</li>
        <li>Ask us to correct inaccurate data</li>
        <li>Ask us to delete your data</li>
        <li>Object to how we're using your data</li>
        <li>Ask for a copy of your data in a portable format</li>
      </ul>
      <p>
        To exercise any of these rights, email{' '}
        <a href="mailto:admin.team@motion-visual.com">admin.team@motion-visual.com</a>.
      </p>

      <h2>Complaints</h2>
      <p>
        If you're unhappy with how we've handled your data, you can complain to the Information
        Commissioner's Office (ICO) at{' '}
        <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
      </p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. The most current version will always be available on this page.</p>
    </LegalLayout>
  );
}
