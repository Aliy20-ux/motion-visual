import { COMPANY, COMPANY_DISCLOSURE } from './company';
import type { AgreementDocument, ClientType, Delivery, LegalSection } from './types';

type Parent = AgreementDocument['parent'];

function parentLabel(parent: Parent): string {
  if (!parent) return 'your existing agreement with us';
  return parent.reference ? `agreement ${parent.reference} (“${parent.title}”)` : `your existing agreement with us (${parent.title})`;
}

export function agreementTermsSections(clientType: ClientType, kind: 'project' | 'change', parent: Parent, delivery: Delivery = 'standard'): LegalSection[] {
  const business = clientType === 'business';
  const ready = delivery === 'ready-made';
  const sections: LegalSection[] = [];

  if (kind === 'change') {
    sections.push({
      id: 'tc-change',
      heading: 'This Change Request',
      plain: 'This adds extra work to your existing agreement. Everything else stays the same.',
      blocks: [
        { type: 'p', text: `This Change Request adds the work described above to ${parentLabel(parent)}. The price and payments shown above are in addition to the price of that agreement. The terms below and the Cancellation & Refund Policy apply to the extra work, and the rest of your existing agreement is unchanged.` },
      ],
    });
  }

  sections.push(
    {
      id: 'tc-agreement',
      heading: 'This agreement',
      plain: 'This document, these terms and our Cancellation Policy are the whole deal. If something isn’t written here, it isn’t part of the price.',
      blocks: [
        { type: 'p', text: `This agreement is between ${COMPANY.legalName}, a company registered in ${COMPANY.registeredIn} (company number ${COMPANY.companyNumber}) whose registered office is at ${COMPANY.registeredOffice} (“Motion Visual”, “we”, “us”), and the client named above (“you”).` },
        { type: 'p', text: 'It is made up of the project details above (including the lists of what is and isn’t included), these terms, and the Cancellation & Refund Policy below, together with any Change Requests you sign later. If they conflict, the project details take priority, then these terms, then the policy. This agreement takes priority over the general Terms of Service on our website.' },
        business
          ? { type: 'p', text: 'This agreement is the entire agreement between us about the project. It replaces any earlier quotes, proposals, conversations, messages or understandings about it, whether written or spoken. Neither of us is relying on any statement or promise that isn’t written in this agreement.' }
          : { type: 'p', text: 'This agreement sets out everything we’ve agreed to do for you. If something we told you before signing is important to you, please make sure it’s written into the project details so there’s no doubt about it.' },
      ],
    },
    {
      id: 'tc-scope',
      heading: 'What’s included',
      plain: 'We’ll deliver exactly what’s listed under “Included”. Anything else is a separate, signed change.',
      blocks: [
        ...(ready
          ? [{ type: 'p' as const, text: 'This is a ready-made site: the website is the one shown at the preview link in the project details, with the changes listed under “Included”. What you see at that link, plus those changes, is what you’re buying.' }]
          : []),
        { type: 'p', text: 'We’ll carry out the work listed under “Included” with reasonable care and skill, to a professional standard. Items listed under “Not included”, and anything else that isn’t listed under “Included”, are not part of the price.' },
        { type: 'p', text: 'If you’d like to add or change something, we’ll send you a Change Request with the price and any effect on the timeline. Extra work starts only once you’ve signed it. A verbal or informal request isn’t enough on its own — this protects both of us.' },
        { type: 'p', text: 'Where your site links to or embeds a third-party platform, such as an external booking or payment service, we set up the link or embed only. Building a custom alternative to that platform is a separate piece of work unless it’s listed under “Included”.' },
      ],
    },
    {
      id: 'tc-your-part',
      heading: 'Your part',
      plain: 'Send us content and feedback on time, and only give us material you have the right to use.',
      blocks: [
        { type: 'p', text: 'To keep the project on track, you agree to:' },
        { type: 'ul', items: [
          'provide the text, images, logos, account access and other content we need, in good time;',
          'give feedback and approvals within 7 days of each request, through one main point of contact;',
          'make sure everything you give us is accurate and lawful, and that you own it or have permission to use it; and',
          'check the work we share with you and tell us promptly about anything that doesn’t match this agreement.',
        ] },
        ...(business
          ? [{ type: 'p' as const, text: 'You’re responsible for any claim that material you supplied to us infringes someone else’s rights.' }]
          : []),
      ],
    },
    {
      id: 'tc-revisions',
      heading: 'Revisions',
      plain: ready
        ? 'One round of changes to fit the site to your business is included. Extra rounds are quoted first.'
        : 'Two rounds of changes are included: one on your first draft and one during the build. Extra rounds are quoted first.',
      blocks: [
        { type: 'p', text: ready
          ? 'Unless the project details say otherwise, your price includes one round of changes to fit the site to your business. A round is one combined set of feedback. Further rounds, or changes to something you’ve already approved, are extra work and handled by Change Request.'
          : 'Unless the project details say otherwise, your price includes two rounds of changes: one on your first draft, which becomes your second draft, and one more during the build. A round is one combined set of feedback on the work we’ve shared. Further rounds, or changes to something you’ve already approved, are extra work and handled by Change Request.' },
      ],
    },
    {
      id: 'tc-payment',
      heading: 'Price and payment',
      plain: ready
        ? 'We start your changes once your deposit clears. The balance is due within 7 days of us sharing the finished site, and we go live once it’s paid. We never charge interest.'
        : 'We start once your deposit clears. The balance is due when your site is ready, by day 14 at the latest, and we go live once it’s paid. We never charge interest.',
      blocks: [
        { type: 'p', text: 'The price and payment schedule are shown in the project details. Prices are in pounds sterling.' },
        { type: 'p', text: ready
          ? 'We start your changes once your deposit has cleared and we have the content we need. The balance is due within 7 days of us sharing the finished site with your changes (or by the date in the project details), and we launch your site within 3 working days of it clearing.'
          : 'We start work once your deposit has cleared and we have the content we need. The balance is due when your site is ready to launch, or by day 14 (or the date in the project details), whichever comes first. We launch your site or hand over files once the balance has cleared.' },
        { type: 'p', text: 'We never charge interest. Late payment is covered in the Cancellation & Refund Policy.' },
      ],
    },
    {
      id: 'tc-timeline',
      heading: 'Timeline',
      plain: ready
        ? 'Your changes within 5 working days of receiving your content, and live within 3 working days of payment. Our deadlines move back if we’re waiting on you.'
        : 'First draft in 48 hours, a week to decide, site ready by day 14 — unless the project details set different dates. Our deadlines move back if we’re waiting on you.',
      blocks: [
        { type: 'p', text: ready
          ? 'For a ready-made site, we finish your changes within 5 working days of receiving your content and launch within 3 working days of your balance clearing, as set out in the Cancellation & Refund Policy, together with what happens if we miss a deadline. If the project details set a different timeline, that timeline applies instead.'
          : 'Our standard schedule — first draft within 2 working days, your decision by the end of day 7, and your site ready to launch by day 14 — is set out in the Cancellation & Refund Policy, together with what happens if we miss a deadline. If the project details set a different timeline, that timeline applies instead.' },
        { type: 'p', text: 'Our deadlines depend on you providing content, feedback and approvals on time, and delays on your side move them back by the same amount. We’re not responsible for delays caused by things outside our reasonable control, such as third-party outages, illness or extreme events, but we’ll keep you updated and do our best to limit the impact.' },
      ],
    },
    {
      id: 'tc-approval',
      heading: 'Approval, launch and fixes',
      plain: 'Check the finished work and tell us about problems within 7 days. We fix bugs free for 30 days after launch.',
      blocks: [
        { type: 'p', text: 'When the work is ready, we’ll share it for your review. Please tell us within 7 days about anything that doesn’t match this agreement, and we’ll fix it. If you don’t raise anything within 7 days, or you ask us to launch, the work is treated as approved. We may also ask you to sign a Completion Sign-off.' },
        { type: 'p', text: 'For 30 days after launch, we’ll fix bugs — things that don’t work as agreed — free of charge. New features, content changes and changes to approved designs are extra work. After 30 days, support is available through a care plan or at a quoted price.' },
        ...(!business
          ? [{ type: 'p' as const, text: 'This doesn’t limit your legal rights. If our work isn’t carried out with reasonable care and skill, you can ask us to redo it or, if that isn’t possible, to reduce the price.' }]
          : []),
      ],
    },
    {
      id: 'tc-ownership',
      heading: 'Ownership',
      plain: 'Once you’ve paid in full, the work is yours. We keep our own tools, and may show the work in our portfolio unless you say no.',
      blocks: [
        { type: 'p', text: 'Once the price has been paid in full, you own the final designs, content and site code we created specifically for you, and we’ll transfer them to you on request. Until then, they remain ours: we share drafts and designs on preview links only, and you may use them only to review the work.' },
        { type: 'p', text: 'We keep ownership of our own pre-existing tools, code libraries, templates and know-how, and give you a permanent, non-exclusive licence to use them as part of your site. Third-party items, such as fonts, stock imagery, plugins and platforms, are licensed under their own terms.' },
        { type: 'p', text: 'If we use AI-generated or stock imagery in your project, we’ll tell you, so it’s never presented as your own photography.' },
        { type: 'p', text: 'We may show the finished work in our portfolio and marketing, unless you ask us in writing not to.' },
      ],
    },
    {
      id: 'tc-accounts',
      heading: 'Domains, hosting and accounts',
      plain: 'We buy your domain in your name and look after it on our Cloudflare account. The first year is included; after that it’s covered by your care plan or billed at cost. If you leave, we transfer it to you.',
      blocks: [
        { type: 'p', text: 'Unless the project details say otherwise, we register your domain name through our Cloudflare account with you named as the registrant — the legal holder of the domain — and we manage it for you. The first year, and any fee for transferring an existing domain to us, is included in the price.' },
        { type: 'p', text: 'After the first year, domain renewals are included in your care plan. If you don’t have a care plan, we’ll invoice the renewal at cost before the renewal date. If that invoice isn’t paid, we may let the domain lapse after giving you at least 14 days’ written notice.' },
        { type: 'p', text: 'If you already have a domain with another provider, you’ll give us the access or transfer code we need to move it to our Cloudflare account. Transfers depend on the previous provider, and we’re not responsible for delays they cause. Please tell us about any email or other services that use the domain, so we can keep them working during the move — we can’t be responsible for services we weren’t told about.' },
        { type: 'p', text: 'If you’d like to manage the domain yourself, or you stop working with us, we’ll transfer it to you within 5 working days of your request, once all invoices are paid.' },
        { type: 'p', text: 'You’re responsible for any other third-party subscriptions in your name. Hosting and support after launch are included only if they’re listed in the project details or covered by a care plan.' },
      ],
    },
    {
      id: 'tc-data',
      heading: 'Your customers’ data',
      plain: 'If your site collects customer data, such as bookings, that data is yours. We handle it only to run your site, keep it secure, and delete it when our work ends.',
      blocks: [
        { type: 'p', text: 'If the work involves collecting or storing personal data about your customers — for example through booking systems, contact forms or accounts — you are the controller of that data and we act as your processor under UK data protection law. We will:' },
        { type: 'ul', items: [
          'process that data only on your documented instructions, to provide the agreed services;',
          'make sure anyone with access to it is bound by confidentiality;',
          'keep it secure with appropriate technical and organisational measures;',
          'use only sub-processors (such as hosting, database and email providers) that give equivalent protection, and tell you about any changes;',
          'help you respond to requests from individuals and meet your security and breach-reporting obligations, and tell you without undue delay if we become aware of a data breach;',
          'delete or return the data when our services end, unless the law requires us to keep it; and',
          'give you the information you need to show these obligations are being met.',
        ] },
        { type: 'p', text: 'You’re responsible for having a lawful basis for collecting the data, for your own privacy notice, and for registering with the Information Commissioner’s Office if you need to.' },
      ],
    },
    {
      id: 'tc-confidentiality',
      heading: 'Confidentiality',
      plain: 'We both keep each other’s private information private.',
      blocks: [
        { type: 'p', text: 'We’ll each keep the other’s confidential information private and use it only for the project, unless the information is already public or the law requires it to be disclosed.' },
      ],
    },
    business
      ? {
          id: 'tc-liability',
          heading: 'Liability',
          plain: 'Our total liability is capped at what you’ve paid us under this agreement. We can’t guarantee business results.',
          blocks: [
            { type: 'p', text: 'Nothing in this agreement limits or excludes liability for death or personal injury caused by negligence, for fraud, or for anything else that can’t be limited or excluded by law.' },
            { type: 'p', text: 'Subject to that, our total liability to you under or in connection with this agreement is limited to the total price you’ve paid us under it, and we’re not liable for any loss of profit, revenue, business, goodwill or anticipated savings, or for any indirect or consequential loss.' },
            { type: 'p', text: 'We don’t guarantee particular business outcomes — such as search rankings, traffic, bookings or sales — because they depend on many factors outside our control. We’re not responsible for the availability, changes or errors of third-party platforms and services.' },
          ],
        }
      : {
          id: 'tc-liability',
          heading: 'Liability',
          plain: 'If we break this agreement, we’re responsible for the losses that could be foreseen. We can’t guarantee results like search rankings.',
          blocks: [
            { type: 'p', text: 'If we fail to comply with this agreement, we’re responsible for loss or damage you suffer that is a foreseeable result of our breach or of our failing to use reasonable care and skill. Loss is foreseeable if it’s obvious it will happen, or if both of us knew it might happen when we signed this agreement.' },
            { type: 'p', text: 'We don’t exclude or limit our liability where it would be unlawful to do so, including for death or personal injury caused by our negligence, for fraud, or for breaching your legal rights in relation to the services.' },
            { type: 'p', text: 'We don’t guarantee outcomes such as search rankings or traffic, because they depend on factors outside our control.' },
          ],
        },
    {
      id: 'tc-cancellation',
      heading: 'Cancellation',
      plain: 'See the Cancellation & Refund Policy below.',
      blocks: [
        { type: 'p', text: 'Either of us may cancel this agreement as set out in the Cancellation & Refund Policy, which forms part of this agreement.' },
      ],
    },
    {
      id: 'tc-disputes',
      heading: 'Disputes and governing law',
      plain: 'If something goes wrong, tell us first and we’ll try to fix it. Scots law applies.',
      blocks: [
        { type: 'p', text: 'If you’re unhappy with anything, please tell us in writing first. We’ll respond within 7 days and do our best to resolve it within 14 days. If we can’t, we’re both willing to consider mediation before going to court.' },
        business
          ? { type: 'p', text: 'This agreement is governed by the law of Scotland, and the Scottish courts have exclusive jurisdiction over any dispute arising from it.' }
          : { type: 'p', text: 'This agreement is governed by the law of Scotland. If you live in Scotland, you can bring a claim in the Scottish courts. If you live in England and Wales or in Northern Ireland, you can bring a claim either in the Scottish courts or in the courts where you live.' },
      ],
    },
    signingSection(),
    {
      id: 'tc-general',
      heading: 'General',
      plain: 'The usual small print about subcontractors, transfers and the rest.',
      blocks: [
        { type: 'ul', items: [
          'We may use trusted subcontractors to help deliver the work, but we remain responsible for it.',
          'Neither of us may transfer this agreement to anyone else without the other’s written agreement, except that we may transfer it as part of a sale or reorganisation of our business.',
          'If any part of this agreement is found to be unenforceable, the rest still applies.',
          'If either of us delays enforcing a right, we can still enforce it later.',
          'Nobody other than you and us has any rights under this agreement.',
        ] },
        { type: 'p', text: COMPANY_DISCLOSURE },
      ],
    },
  );

  return sections;
}

export function completionSections(parent: Parent): LegalSection[] {
  return [
    {
      id: 'tc-completion',
      heading: 'What you’re confirming',
      plain: 'You’re confirming the project was delivered as agreed. Bugs are still fixed free for 30 days after launch.',
      blocks: [
        { type: 'p', text: `By signing, you confirm that the work under ${parentLabel(parent)} has been delivered as agreed, apart from anything listed as “Outstanding” above, which we’ll complete as described.` },
        { type: 'p', text: 'Our free bug-fix period of 30 days after launch still applies, and so do your legal rights. Anything beyond what was agreed — new features, pages, or changes to approved work — is new work, and we’ll quote it in a Change Request.' },
        { type: 'p', text: 'The rest of the agreement, including its payment terms, continues to apply. Any final balance shown above is now due.' },
      ],
    },
    signingSection(),
    {
      id: 'tc-general',
      heading: 'About us',
      blocks: [{ type: 'p', text: COMPANY_DISCLOSURE }],
    },
  ];
}

function signingSection(): LegalSection {
  return {
    id: 'tc-signing',
    heading: 'Signing electronically',
    plain: 'Typing your name and clicking sign is as binding as a handwritten signature. You’ll get a signed copy by email.',
    blocks: [
      { type: 'p', text: 'You can sign this document electronically by typing your name and confirming you agree. Your electronic signature is legally binding in the same way as a handwritten one. We record the date and time, the IP address and device used, and a unique fingerprint (SHA-256 hash) of the exact document you signed, and we email a copy of the signed document to you and to us. Notices about this agreement can be given by email to the addresses in it.' },
    ],
  };
}
