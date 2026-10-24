import { COMPANY } from './company';
import type { ClientType, Delivery, LegalSection } from './types';

export const POLICY_VERSION = '2026-10-24';
export const POLICY_UPDATED = 'October 2026';

const DEPOSIT_RULE = '25% of the build price';

/** Who the wording is for: a business client, a consumer, or the public page (both, labelled). */
export type Audience = ClientType | 'public';

export function cancellationSections(audience: Audience, delivery: Delivery = 'standard'): LegalSection[] {
  const consumer = audience === 'consumer' || audience === 'public';
  const ready = delivery === 'ready-made';
  const consumerOnly = audience === 'public' ? ' (consumers)' : '';

  const sections: LegalSection[] = [
    {
      id: 'cp-applies',
      heading: 'Who this policy applies to',
      plain: 'This explains how a project runs and what happens if either of us cancels. Your signed agreement sets your price and dates.',
      blocks: [
        { type: 'p', text: `This policy applies to every website design, development and related project carried out by ${COMPANY.legalName} (“Motion Visual”, “we”, “us”) for a client (“you”). It forms part of your Project Agreement, which sets out your price, deposit and payment dates.` },
        ...(audience === 'public'
          ? [{ type: 'p' as const, text: 'Some parts apply differently depending on whether you’re a business client (including sole traders and partnerships buying for their business) or a consumer (an individual buying for personal use). Where a rule applies to only one of these, we say so.' }]
          : []),
        ...(consumer ? [{ type: 'p' as const, text: 'Nothing in this policy takes away or limits your statutory rights as a consumer, including your rights under the Consumer Rights Act 2015.' }] : []),
      ],
    },
    ready ? READY_SCHEDULE : {
      id: 'cp-schedule',
      heading: 'How a project runs',
      plain: 'Your 14 days start once we have your signed agreement and your content. Your first design follows within 2 working days, and the balance is due within 7 days of us sharing your finished site.',
      blocks: [
        { type: 'table', head: ['When', 'What happens'], rows: [
          ['Day 0', 'We have your signed Project Agreement and the content we need — your brief, plus anything else we’ve asked for. The 14-day clock starts today. You pay your deposit when you sign.'],
          ['Within 2 working days', 'We share your first design — the design direction for your site — with you on a preview link. This is our 48-hour target.'],
          ['Then', 'You send us one combined set of changes on it.'],
          ['During the build', 'We build your site. One more round of changes is included.'],
          ['By day 14', 'We share your finished site with you.'],
          ['Within 7 days of that', 'You pay the balance. We launch your site once it has cleared.'],
        ] },
        { type: 'p', text: `The deposit is ${DEPOSIT_RULE}, and your Project Agreement shows the exact amount. It’s part of the price, not an extra charge.` },
        { type: 'p', text: 'Days are counted from day 0 and include weekends. “Working days” means Monday to Friday, excluding UK bank holidays.' },
        ...(consumer ? [{ type: 'p' as const, text: `${audience === 'public' ? 'If you’re a consumer and you choose to wait until your 14-day cancellation period has ended before we start, day 0 is the first day on which we have your signed agreement, your content and your go-ahead.' : 'If you choose to wait until your 14-day cancellation period has ended before we start, day 0 is the first day on which we have your signed agreement, your content and your go-ahead.'}` }] : []),
        { type: 'p', text: 'If you hold things up — for example by sending content, feedback or approvals late — our deadlines move back by the same amount of time. Your payment dates don’t.' },
        { type: 'p', text: 'Bigger projects can be phased, with a longer timeline and more payment stages. Where your Project Agreement sets different dates, those dates replace the ones above, and the rest of this policy applies to them in the same way.' },
      ],
    },
    {
      id: 'cp-changes',
      heading: 'Changes included, and extra work',
      plain: ready
        ? 'One round of changes is included. Anything more is quoted and signed for before we start it.'
        : 'Two rounds of changes are included. Anything more is quoted and signed for before we start it.',
      blocks: [
        { type: 'p', text: ready
          ? 'Your price includes one round of changes to fit the site to your business. A round means one combined set of feedback, sent together.'
          : 'Your price includes two rounds of changes: one on your first design, and one more during the build. A round means one combined set of feedback, sent together.' },
        { type: 'p', text: 'Further rounds, changes to something you’ve already approved, and anything not listed as “Included” in your Project Agreement are extra work. We’ll quote it in a Change Request and only start once you’ve signed it. A signed Change Request becomes part of your agreement, and this policy applies to it based on its own price and dates.' },
      ],
    },
  ];

  if (consumer) {
    sections.push(
      {
        id: 'cp-cooling-off',
        heading: `Your 14-day right to cancel${consumerOnly}`,
        plain: 'If you’re buying as an individual, the law gives you 14 days from signing to cancel for any reason, and you choose whether we start now or wait. If you asked us to start straight away, you only pay a fair share for the work done up to then.',
        blocks: [
          { type: 'p', text: 'If you’re a consumer and you agreed this contract with us online, by phone, by email, or anywhere other than our business premises, you have the right to cancel it within 14 days without giving any reason, under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013. The cancellation period ends 14 days after the day you signed your Project Agreement.' },
          { type: 'p', text: `To cancel, tell us clearly before the 14 days run out — email ${COMPANY.email} or write to us at ${COMPANY.registeredOffice}. You can use the model cancellation form below, but you don’t have to. It’s enough to send your cancellation before the period ends.` },
          { type: 'p', text: 'If you cancel, we’ll refund all payments you’ve made to us within 14 days of the day you told us, using the same payment method you used unless you agree otherwise. You won’t be charged a fee for the refund.' },
          { type: 'p', text: 'You choose when we start. When you sign, you can ask us to start work straight away, or ask us to wait until your 14 days have ended. We only start within the 14 days if you ask us to, clearly, when you sign.' },
          { type: 'p', text: 'If you asked us to start work during the 14 days and then cancel, you pay only an amount in proportion to what we’ve done up to the time you told us you were cancelling, compared with everything in the agreement. It will never be more than the price. We’ll deduct it from your refund, and if you’ve paid us less than that amount, you pay the difference.' },
          { type: 'p', text: 'If you asked us to start work during the 14 days and we fully complete the work within that period, you lose your right to cancel once the work is complete. You acknowledge this when you ask us to start.' },
          { type: 'p', text: 'If we haven’t given you the information the law requires about your right to cancel, your cancellation period can be longer than 14 days.' },
        ],
      },
      {
        id: 'cp-model-form',
        heading: `Model cancellation form${consumerOnly}`,
        plain: 'Optional. Copy it, fill it in and email it to us if you want to cancel within 14 days.',
        blocks: [
          { type: 'p', text: `To: ${COMPANY.legalName}, ${COMPANY.registeredOffice} — ${COMPANY.email}` },
          { type: 'p', text: 'I hereby give notice that I cancel my contract for the supply of the following service: [describe the service or give the agreement reference]' },
          { type: 'ul', items: ['Agreed on: [date]', 'Name: [your name]', 'Address: [your address]', 'Signature: [only if you send this form on paper]', 'Date: [date]'] },
        ],
      },
    );
  }

  sections.push(
    ready ? readyYouCancel(audience) : {
      id: 'cp-you-cancel',
      heading: audience === 'consumer'
        ? 'If you cancel after your 14 days'
        : audience === 'public'
          ? 'If you cancel (business clients, and consumers after the 14 days)'
          : 'If you cancel',
      plain: audience === 'consumer'
        ? 'After your 14-day right to cancel, a fair share of the price applies depending on how far the project has got — and never more than the work we’ve actually done.'
        : 'What you owe depends on how far the project has got when you cancel, as a percentage of the build price. Your deposit counts towards it.',
      blocks: [
        { type: 'p', text: `You can cancel by emailing ${COMPANY.email} and quoting your agreement reference. Cancellation takes effect on the day we receive your email, and we’ll confirm it in writing within two working days.` },
        { type: 'p', text: 'What you owe depends on the stage your project has reached, as a percentage of the total build price. Your deposit counts towards the amount, so you only pay the difference.' },
        { type: 'table', head: ['When you cancel', 'What you owe'], rows: [
          ['Before we begin work', 'Nothing. Your deposit is refunded in full.'],
          ['Work has started, but we haven’t shared your first design', `Your deposit is kept (${DEPOSIT_RULE}), unless we’ve missed our first-design target — see “If we can’t deliver”. You owe nothing more.`],
          ['We’ve shared your first design (the design direction)', '40% of the build price, less your deposit.'],
          ['The build is underway', '70% of the build price, less what you’ve paid.'],
          ['We’ve shared your finished site', '100% — the full price is due.'],
          ['We cancel, or we can’t deliver', 'Nothing. Everything you’ve paid is refunded in full.'],
        ] },
        { type: 'p', text: 'Your first design is the design direction: the look and layout we propose for your site, shared on a preview link. “The build is underway” means we’ve started building your pages from it.' },
        { type: 'p', text: 'In every case, you also pay for any third-party costs we’ve committed to on your behalf with your agreement — for example a domain name, paid fonts, booking tools, SMS or stock photos — at cost.' },
        { type: 'p', text: 'We share drafts and designs on preview links only. They stay ours until the price is paid in full, so if you cancel we don’t hand over design files, and you may not use or copy our drafts or designs.' },
        { type: 'p', text: 'These amounts reflect the time we reserve for your project — often turning down other work to do so — and the work completed by each stage. They are a fair share of the price for work done and time reserved, not a penalty.' },
        ...(consumer
          ? [{ type: 'p' as const, text: `${audience === 'public' ? 'If you’re a consumer, we’ll' : 'We’ll'} never charge you more than the value of the work we’ve actually carried out for you plus any third-party costs. If that comes to less than the amount in the table, you pay the lower amount. This section applies once your 14-day right to cancel has ended; during those 14 days the section above applies instead.` }]
          : []),
      ],
    },
    ready ? READY_DEADLINES : {
      id: 'cp-our-deadlines',
      heading: 'If we can’t deliver',
      plain: 'If we cancel, or we can’t deliver your site, you get back everything you’ve paid.',
      blocks: [
        { type: 'p', text: 'If we cancel your project for a reason other than those listed under “If we cancel”, or we’re unable to deliver your site, we’ll refund everything you’ve paid us in full, within 14 days.' },
        { type: 'p', text: 'We aim to share your first design within 2 working days of day 0. If we haven’t shared it by then for a reason within our control, you can cancel before we share it and we’ll refund your deposit in full.' },
        { type: 'p', text: 'Our dates move back when the delay is caused by you — such as late content, feedback or approvals — or by events outside our reasonable control.' },
        ...(consumer ? [{ type: 'p' as const, text: `${audience === 'public' ? 'If you’re a consumer, your' : 'Your'} legal rights apply if we’re late or if our work isn’t carried out with reasonable care and skill, including the right to ask us to put things right or to reduce the price.` }] : []),
      ],
    },
    {
      id: 'cp-delays',
      heading: 'Approvals, and if the project stalls on your side',
      plain: 'If you don’t reply to something we’ve shared for 7 days, it counts as approved. If we’re waiting on you for 14 days, the project pauses.',
      blocks: [
        { type: 'p', text: 'When we share something for your approval — a design, a draft or your finished site — please reply within 7 days. If you haven’t responded after 7 days, we’ll treat it as approved and carry on.' },
        { type: 'p', text: 'If we’ve heard nothing from you for 14 days while we’re waiting on you, we’ll pause the project. We may give your slot to another client and restart when we next have availability.' },
      ],
    },
    ready ? READY_PAYING : {
      id: 'cp-paying',
      heading: 'Paying the balance, and launch',
      plain: 'The balance is due within 7 days of us sharing your finished site. We launch once it’s paid.',
      blocks: [
        { type: 'p', text: 'The balance is due within 7 days of us sharing your finished site with you. We launch your site, or hand over files and access, once the balance has cleared.' },
        { type: 'p', text: 'Ownership of the work we create for you stays with us, and passes to you only when the price has been paid in full.' },
      ],
    },
    ...(audience === 'public' ? [READY_SUMMARY] : []),
    {
      id: 'cp-late',
      heading: 'Late payment',
      plain: 'We never charge interest or late fees. If a payment is late, we may pause work, and the work stays ours until it’s paid.',
      blocks: [
        { type: 'p', text: 'We never charge interest of any kind on late payments — no statutory interest, no late-payment interest and no late fees.' },
        { type: 'p', text: 'Instead, if a payment isn’t made by its due date, we’ll send you a reminder. If it’s still unpaid 7 days after that reminder, we may pause work on your project until the account is up to date. If your site is live and we host it, we may pause the site too, once we’ve given you at least 7 days’ written notice, and we’ll restore it as soon as the account is settled.' },
        { type: 'p', text: 'Ownership of the work stays with us until the price has been paid in full.' },
        { type: 'p', text: 'If you pay your balance before it’s due, we’ll thank you with one small extra update, free of charge.' },
      ],
    },
    {
      id: 'cp-we-cancel',
      heading: 'If we cancel',
      plain: 'We can end the project if payments go unpaid, the agreement is seriously broken, or our team is mistreated. If we pull out for any other reason, you get back everything you’ve paid.',
      blocks: [
        { type: 'p', text: 'We may stop work and cancel the project by email if:' },
        { type: 'ul', items: [
          'a payment is still unpaid 14 days after we’ve sent you a written reminder;',
          'you seriously break the agreement and don’t put it right within 14 days of us asking you to;',
          'you ask us to do something unlawful, or to use material that infringes someone else’s rights; or',
          'you, or anyone acting for you, is abusive, threatening or harassing towards our team.',
        ] },
        { type: 'p', text: 'In those cases, “If you cancel” applies as if you had cancelled on that day.' },
        { type: 'p', text: 'If we cancel for any other reason, we’ll refund everything you’ve paid in full, within 14 days.' },
      ],
    },
    {
      id: 'cp-care-plans',
      heading: 'Care plans',
      plain: 'Care plans are optional, paid by direct debit, and run for at least 3 months. After that you can step down, pause or leave with 5 working days’ written notice.',
      blocks: [
        { type: 'p', text: 'A care plan covers your hosting, SSL certificate, backups, uptime monitoring and small design tweaks, plus a set number of content updates. Unused updates don’t roll over. Your Project Agreement or care plan order shows the plan you’ve chosen and its price.' },
        { type: 'table', head: ['Plan', 'Price', 'What you get'], rows: [
          ['Essential care', '£49.99', '3 updates per payment period; we reply within 2 working days.'],
          ['Signature care', '£79', '6 updates per payment period; we reply within 1 working day; a short report each period.'],
          ['Flagship care', 'From £129, scoped with you', 'Up to 12 updates per payment period, with fair use; same-day reply; a quarterly review call.'],
        ] },
        { type: 'p', text: 'Care plans are paid monthly by direct debit and have a minimum term of 3 months from the start date. You can prepay a year — you pay for 11 payments and get 12.' },
        { type: 'p', text: `After the minimum term, you can cancel at any time by emailing ${COMPANY.email} at least 5 working days before your next payment date. If you tell us later than that, the next payment is still taken and your plan ends at the end of that month. We don’t refund part-months.` },
        { type: 'p', text: 'Cancelling your direct debit with your bank doesn’t cancel your plan — you still need to give us notice, and payments due under the plan remain due. Your bank can always stop a direct debit under the Direct Debit Guarantee.' },
        { type: 'p', text: 'Stepping down: after the minimum term, you can move to a smaller care plan, or to our Keep-alive plan (£30: hosting, security, backups and monitoring, with no updates), by giving 5 working days’ written notice. The change takes effect from your next payment. Keep-alive is only available as a step down. On Keep-alive, a small update is £15 and an extra page is £80.' },
        { type: 'p', text: 'Pausing: you can pause your care plan for up to 2 months, once a year. Your site stays live, and no updates are made during the pause.' },
        { type: 'p', text: 'Leaving: the finished site belongs to you once you’ve paid for it in full, and your domain is in your name or transferable to you. If you’d like us to move your hosting elsewhere, there is a £150 handover fee. Stepping down, pausing or leaving a care plan doesn’t give any refund or reduction of the original build price.' },
        { type: 'p', text: 'Upgrading: you can upgrade from Essential to Signature once you’ve had an active Essential care plan for 12 months, counted from your launch date. The one-off upgrade fee is £800, less credit for anything you’ve already bought that Signature includes (extra pages, up to 4 at £80 each, and the Lite Order Builder at £250). The minimum fee is £400. Your care plan rises from £49.99 to £79 from the payment period after the upgrade fee is paid.' },
        { type: 'p', text: 'Domain renewals are included in a care plan. If you cancel your plan, we’ll invoice future renewals at cost, or transfer the domain to you if you’d rather manage it yourself.' },
        ...(consumer ? [{ type: 'p' as const, text: `${audience === 'public' ? 'If you’re a consumer, your' : 'Your'} 14-day right to cancel also applies when you start a new care plan, whatever the minimum term.` }] : []),
      ],
    },
    {
      id: 'cp-third-party',
      heading: 'Third-party platforms and costs',
      plain: 'Booking tools, SMS, stock photos and fonts have their own fees, which you pay. Cancelling them is up to you.',
      blocks: [
        { type: 'p', text: 'Third-party costs — such as booking tools, SMS credits, stock photos and fonts — are paid by you, and we’ll tell you about them before we commit to them on your behalf.' },
        { type: 'p', text: 'If your site connects to third-party platforms — for example booking systems such as Treatwell or Fresha, payment providers such as Stripe, or email and hosting services — your use of them is governed by their own terms and fees. Cancelling them is your responsibility, and we can’t refund their charges. We’re not responsible for their outages or for changes they make to their services.' },
      ],
    },
    {
      id: 'cp-refunds',
      heading: 'Refunds',
      plain: 'Refunds are paid within 14 days, the same way you paid.',
      blocks: [
        { type: 'p', text: 'Any refund due under this policy is paid within 14 days of cancellation, using the same payment method you used unless we agree otherwise.' },
      ],
    },
  );

  return sections;
}

const READY_SCHEDULE: LegalSection = {
  id: 'cp-schedule',
  heading: 'How a ready-made site works',
  plain: 'You’ve already seen the site. Sign the agreement, we tailor it to your business, and it goes live within 3 working days of your balance clearing.',
  blocks: [
    { type: 'table', head: ['When', 'What happens'], rows: [
      ['You sign your agreement', 'You pay your deposit and send us your content — your brief and anything else on our checklist.'],
      ['Within 5 working days', 'We make one combined round of changes to fit the site to your business, and share the finished site with you.'],
      ['Within 7 days of that', 'You pay the balance.'],
      ['Within 3 working days of payment', 'Your site goes live.'],
    ] },
    { type: 'p', text: `The website is the one shown at the preview link in your Project Agreement. The deposit is ${DEPOSIT_RULE}, paid when you sign, and it’s part of the price.` },
    { type: 'p', text: 'Until the price is paid in full, the site stays ours and stays on our preview address. “Working days” means Monday to Friday, excluding UK bank holidays. If you send content or feedback late, our deadlines move back by the same amount of time.' },
  ],
};

function readyYouCancel(audience: Audience): LegalSection {
  const consumer = audience === 'consumer' || audience === 'public';
  return {
    id: 'cp-you-cancel',
    heading: audience === 'consumer'
      ? 'If you cancel after your 14 days'
      : audience === 'public'
        ? 'If you cancel (business clients, and consumers after the 14 days)'
        : 'If you cancel',
    plain: 'Cancel before we start your changes and you get your deposit back. After that the deposit is kept, and once you’ve seen the finished site the full price is due.',
    blocks: [
      { type: 'p', text: `You can cancel by emailing ${COMPANY.email} and quoting your agreement reference. Cancellation takes effect on the day we receive your email, and we’ll confirm it in writing within two working days.` },
      { type: 'table', head: ['When you cancel', 'What happens'], rows: [
        ['Before we start your changes', 'Your deposit is refunded in full.'],
        ['After we’ve started your changes, before we share the finished site', 'Your deposit is kept. You owe nothing more.'],
        ['After we’ve shared the finished site with your changes', 'The full price is due.'],
      ] },
      { type: 'p', text: 'If you cancel, the site stays ours. We’ll remove your name, logo and content, and we may reuse the design.' },
      { type: 'p', text: 'These amounts reflect the work already done and the time we reserve for your changes. They are not a penalty.' },
      ...(consumer
        ? [{ type: 'p' as const, text: `${audience === 'public' ? 'If you’re a consumer, we’ll' : 'We’ll'} never charge you more than the value of the work we’ve actually carried out for you plus any third-party costs. If that comes to less than the amount above, you pay the lower amount. This applies once your 14-day right to cancel has ended.` }]
        : []),
    ],
  };
}

const READY_DEADLINES: LegalSection = {
  id: 'cp-our-deadlines',
  heading: 'If we can’t deliver',
  plain: 'If we cancel, or we can’t deliver your changes, you get back everything you’ve paid.',
  blocks: [
    { type: 'p', text: 'We aim to finish your changes within 5 working days of receiving your content. If we cancel for a reason other than those listed under “If we cancel”, or we’re unable to deliver, we’ll refund everything you’ve paid us in full, within 14 days.' },
    { type: 'p', text: 'Our dates move back when the delay is caused by you or by events outside our reasonable control.' },
  ],
};

const READY_PAYING: LegalSection = {
  id: 'cp-paying',
  heading: 'Paying the balance, and launch',
  plain: 'The balance is due within 7 days of us sharing your finished site. It goes live within 3 working days of payment.',
  blocks: [
    { type: 'p', text: 'The balance is due within 7 days of us sharing your finished site with your changes made. We launch it within 3 working days of the balance clearing.' },
    { type: 'p', text: 'Ownership of the site stays with us, and passes to you only when the price has been paid in full.' },
  ],
};

const READY_SUMMARY: LegalSection = {
  id: 'cp-ready-made',
  heading: 'Ready-made sites',
  plain: 'If we show you a site we’ve already built and you buy it, the timeline is faster and the rules are a little different.',
  blocks: [
    { type: 'p', text: 'Sometimes we show you a website we’ve already built for your business. Until you buy it, it stays ours and is only shown on our preview address. If you go ahead:' },
    { type: 'ul', items: [
      `you pay your deposit (${DEPOSIT_RULE}) when you sign, and we make one round of changes to fit your business within 5 working days of receiving your content;`,
      'your deposit is refunded if you cancel before we start your changes, and kept after that;',
      'the full price is due once we’ve shared the finished site with your changes, and the balance is payable within 7 days of that;',
      'your site goes live within 3 working days of the balance clearing; and',
      'if you decide not to buy it, we remove your name, logo and content, and may reuse the design.',
    ] },
    { type: 'p', text: 'Everything else in this policy applies in the same way.' },
  ],
};
