import { COMPANY } from './company';
import type { ClientType, Delivery, LegalSection } from './types';

export const POLICY_VERSION = '2026-10-18';
export const POLICY_UPDATED = 'October 2026';

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
          ? [{ type: 'p' as const, text: 'Some parts apply differently depending on whether you’re a business client (including sole traders and partnerships acting for their business) or a consumer (an individual buying for personal use). Where a rule applies to only one of these, we say so.' }]
          : []),
        ...(consumer ? [{ type: 'p' as const, text: 'Nothing in this policy affects your statutory rights as a consumer.' }] : []),
      ],
    },
    ready ? READY_SCHEDULE : {
      id: 'cp-schedule',
      heading: 'How a project runs',
      plain: 'First draft in 48 hours, a week to decide, and your site ready by day 14.',
      blocks: [
        { type: 'table', head: ['When', 'What happens'], rows: [
          ['Day 0', 'You approve your quote and pay the £100 deposit, and send us everything on our content checklist. Day 0 is the day we have both.'],
          ['Within 2 working days', 'We send your first draft — our 48-hour promise.'],
          ['The next 5 days', 'You send us one combined set of changes, and we make your second draft.'],
          ['End of day 7', 'Your decision deadline. If you’re not happy, cancel by then and we’ll refund your deposit in full.'],
          ['Days 8 to 14', 'We build your site. One more round of changes is included.'],
          ['By day 14', 'Your site is ready to launch, and the balance is due.'],
        ] },
        { type: 'p', text: 'The deposit is £100, paid when you approve your quote by signing your Project Agreement. It’s part of the price, not an extra charge.' },
        { type: 'p', text: 'Days are counted from day 0 and include weekends. “Working days” means Monday to Friday, excluding UK bank holidays.' },
        { type: 'p', text: 'We’ll remind you on day 6 that your decision deadline is the next day. If you haven’t cancelled by the end of day 7, we’ll go ahead with the build.' },
        { type: 'p', text: 'If you hold things up — for example by sending content, feedback or approvals late — our deadlines move back by the same amount of time. Your payment dates don’t.' },
        { type: 'p', text: 'Bigger projects can have a longer timeline and more payment stages. Where your Project Agreement sets different dates, those dates replace the ones above, and the rest of this policy applies to them in the same way.' },
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
          : 'Your price includes two rounds of changes: one on your first draft, which becomes your second draft, and one more during the build. A round means one combined set of feedback, sent together.' },
        { type: 'p', text: 'Further rounds, changes to something you’ve already approved, and anything not listed as “Included” in your Project Agreement are extra work. We’ll quote it in a Change Request and only start once you’ve signed it. A signed Change Request becomes part of your agreement, and this policy applies to it based on its own price and dates.' },
      ],
    },
  ];

  if (consumer) {
    sections.push(
      {
        id: 'cp-cooling-off',
        heading: `Your 14-day right to cancel${consumerOnly}`,
        plain: 'If you’re buying as an individual, the law gives you 14 days to cancel for any reason. If you asked us to start straight away, you only pay for the work done up to then.',
        blocks: [
          { type: 'p', text: 'If you’re a consumer and you agreed this contract with us online, by phone, by email, or anywhere other than our business premises, you have the right to cancel it within 14 days without giving any reason. The cancellation period ends 14 days after the day you signed your Project Agreement.' },
          { type: 'p', text: `To cancel, tell us clearly before the 14 days run out — email ${COMPANY.email} or write to us at ${COMPANY.registeredOffice}. You can use the model cancellation form below, but you don’t have to.` },
          { type: 'p', text: 'If you cancel, we’ll refund all payments you’ve made to us within 14 days of the day you told us, using the same payment method you used unless you agree otherwise. You won’t be charged a fee for the refund.' },
          { type: 'p', text: 'If you asked us to start work during the 14-day period, you’ll pay an amount in proportion to the work we carried out before you told us you were cancelling, compared with the full scope of the agreement. We’ll deduct it from your refund.' },
          ...(ready ? [] : [{ type: 'p' as const, text: 'If you cancel by the end of day 7, we’ll refund your deposit in full anyway.' }]),
          { type: 'p', text: 'If you asked us to start work during the 14-day period and we fully complete the work within that period, you lose your right to cancel once the work is complete. We only start early if you ask us to when you sign.' },
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
    ready ? readyYouCancel(consumer) : {
      id: 'cp-you-cancel',
      heading: 'If you cancel',
      plain: 'Cancel by the end of day 7 and you get your deposit back. After that the deposit is kept, and once you’ve seen your finished site the full price is due.',
      blocks: [
        { type: 'p', text: `You can cancel by emailing ${COMPANY.email} and quoting your agreement reference. Cancellation takes effect on the day we receive your email, and we’ll confirm it in writing within two working days.` },
        { type: 'table', head: ['When you cancel', 'What happens'], rows: [
          ['By the end of day 7', 'Your deposit is refunded in full.'],
          ['After day 7, before we’ve shared your finished site', 'Your deposit is non-refundable. You owe nothing more.'],
          ['After we’ve shared your finished site for review', 'The full price is due.'],
        ] },
        { type: 'p', text: 'In every case, you also pay for any third-party costs we’ve committed to on your behalf with your agreement — for example a domain name, paid fonts or a software licence — at cost.' },
        { type: 'p', text: 'We share drafts and designs on preview links only. They stay ours until the price is paid in full, so if you cancel we don’t hand over design files, and you may not use or copy our drafts or designs.' },
        { type: 'p', text: 'These amounts reflect the time we reserve for your project — often turning down other work to do so — and the work completed by each stage. They are not a penalty.' },
        ...(consumer
          ? [{ type: 'p' as const, text: 'If you’re a consumer, we’ll never charge you more than the value of the work we’ve actually carried out plus any third-party costs. If that comes to less than the amount above, you pay the lower amount.' }]
          : []),
      ],
    },
    ready ? READY_DEADLINES : {
      id: 'cp-our-deadlines',
      heading: 'If we miss a deadline',
      plain: 'If we miss our 48-hour or day-14 promise through our own fault, you can cancel and get your deposit back.',
      blocks: [
        { type: 'p', text: 'We promise two deadlines: your first draft within 2 working days of day 0, and your site ready to launch by day 14 (or the dates in your Project Agreement). If we miss either one for a reason within our control, you can cancel within 7 days of the missed deadline and we’ll refund your deposit in full.' },
        { type: 'p', text: 'This doesn’t apply to delays you cause — such as late content, feedback or approvals — or to events outside our reasonable control. It’s a right to cancel: you can’t keep the website and also have the deposit refunded.' },
      ],
    },
    {
      id: 'cp-delays',
      heading: 'If the project stalls on your side',
      plain: 'If we’re waiting on you for a while, the project pauses. After a long silence and a final warning, it’s treated as cancelled.',
      blocks: [
        { type: 'p', text: 'If we’re waiting on you for more than 14 days, we’ll pause the project, and we may give your slot to another client and restart when we next have availability.' },
        { type: 'p', text: 'If we don’t hear from you for 30 days, we’ll email you a final notice. If you still haven’t responded 14 days after that notice, we’ll treat the project as cancelled by you on that date, and “If you cancel” applies. Restarting after that needs a new agreement and may mean a new quote.' },
      ],
    },
    ready ? READY_PAYING : {
      id: 'cp-paying',
      heading: 'Paying the balance, and launch',
      plain: 'The balance is due when your site is ready, and no later than day 14. We launch once it’s paid.',
      blocks: [
        { type: 'p', text: 'The balance is due when your site is ready to launch, or on day 14 — whichever comes first. If the site isn’t ready by day 14 because of a delay on our side, the balance is due when we deliver it.' },
        { type: 'p', text: 'We launch your site, or hand over files and access, once the balance has cleared. Ownership of the work we create for you passes to you only when the price has been paid in full.' },
        { type: 'p', text: 'If we host your site or provide other ongoing services and a payment is more than 30 days overdue, we may suspend those services after giving you at least 7 days’ written notice, and we’ll restore them once the account is up to date.' },
      ],
    },
    ...(audience === 'public' ? [READY_SUMMARY] : []),
    {
      id: 'cp-late',
      heading: 'Late payment',
      plain: 'We never charge interest. If a payment is still unpaid 7 days after a reminder, a 5% late fee is added — and we give it to charity.',
      blocks: [
        { type: 'p', text: 'If a payment isn’t made by its due date, we’ll send you a reminder. If it’s still unpaid 7 days after that reminder, a one-off late fee of 5% of the unpaid amount is added. We donate every late fee in full to charity — it is never kept as income.' },
        { type: 'p', text: 'We never charge interest on late payments. We may pause work until the account is up to date.' },
      ],
    },
    {
      id: 'cp-we-cancel',
      heading: 'If we cancel',
      plain: 'We can end the project if payments go unpaid, the agreement is seriously broken, or our team is mistreated. If we pull out for any other reason, you get back what you paid for work not delivered.',
      blocks: [
        { type: 'p', text: 'We may stop work and cancel the project by email if:' },
        { type: 'ul', items: [
          'a payment is still unpaid 14 days after we’ve sent you a written reminder;',
          'you seriously break the agreement and don’t put it right within 14 days of us asking you to;',
          'you ask us to do something unlawful, or to use material that infringes someone else’s rights; or',
          'you, or anyone acting for you, is abusive, threatening or harassing towards our team.',
        ] },
        { type: 'p', text: 'In those cases, “If you cancel” applies as if you had cancelled on that day.' },
        { type: 'p', text: 'If we cancel for any other reason, we’ll refund everything you’ve paid for work we haven’t delivered within 14 days, and hand over any completed work you’ve paid for.' },
      ],
    },
    {
      id: 'cp-care-plans',
      heading: 'Care plans (monthly direct debit)',
      plain: 'Care plans run for at least 3 months. After that, cancel any time with 5 working days’ notice before your next payment.',
      blocks: [
        { type: 'p', text: 'Care plans (hosting, updates and support) are paid monthly by direct debit and have a minimum term of 3 months from the start date.' },
        { type: 'p', text: `After the minimum term, you can cancel at any time by emailing ${COMPANY.email} at least 5 working days before your next payment date. If you tell us later than that, the next payment is still taken and your plan ends at the end of that month. We don’t refund part-months.` },
        { type: 'p', text: 'Cancelling your direct debit with your bank doesn’t cancel your plan — you still need to give us notice, and payments due under the plan remain due. Your bank can always stop a direct debit under the Direct Debit Guarantee.' },
        { type: 'p', text: 'Domain renewals are included in a care plan. If you cancel your plan, we’ll invoice future renewals at cost, or transfer the domain to you if you’d rather manage it yourself.' },
        ...(consumer ? [{ type: 'p' as const, text: `${audience === 'public' ? 'If you’re a consumer, your' : 'Your'} 14-day right to cancel also applies when you start a new care plan, whatever the minimum term.` }] : []),
      ],
    },
    {
      id: 'cp-third-party',
      heading: 'Third-party platforms',
      plain: 'Services like booking or payment platforms have their own contracts and fees. Cancelling them is up to you.',
      blocks: [
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
  plain: 'You’ve already seen the site. Approve the quote, we tailor it to your business, and it goes live within 3 working days of your balance clearing.',
  blocks: [
    { type: 'table', head: ['When', 'What happens'], rows: [
      ['You approve your quote', 'You pay the £100 deposit and send us your content — logo, text, photos and anything else on our checklist.'],
      ['Within 5 working days', 'We make one combined round of changes to fit the site to your business, and share the finished site with you.'],
      ['Within 7 days of that', 'You pay the balance.'],
      ['Within 3 working days of payment', 'Your site goes live.'],
    ] },
    { type: 'p', text: 'The website is the one shown at the preview link in your Project Agreement. The deposit is £100, paid when you approve your quote by signing your Project Agreement, and it’s part of the price.' },
    { type: 'p', text: 'Until the price is paid in full, the site stays ours and stays on our preview address. “Working days” means Monday to Friday, excluding UK bank holidays. If you send content or feedback late, our deadlines move back by the same amount of time.' },
  ],
};

function readyYouCancel(consumer: boolean): LegalSection {
  return {
    id: 'cp-you-cancel',
    heading: 'If you cancel',
    plain: 'Cancel before we start your changes and you get your deposit back. After that the deposit is kept, and once you’ve seen the finished site the full price is due.',
    blocks: [
      { type: 'p', text: `You can cancel by emailing ${COMPANY.email} and quoting your agreement reference. Cancellation takes effect on the day we receive your email, and we’ll confirm it in writing within two working days.` },
      { type: 'table', head: ['When you cancel', 'What happens'], rows: [
        ['Before we start your changes', 'Your deposit is refunded in full.'],
        ['After we’ve started your changes, before we share the finished site', 'Your deposit is non-refundable. You owe nothing more.'],
        ['After we’ve shared the finished site with your changes', 'The full price is due.'],
      ] },
      { type: 'p', text: 'If you cancel, the site stays ours. We’ll remove your name, logo and content, and we may reuse the design.' },
      { type: 'p', text: 'These amounts reflect the work already done and the time we reserve for your changes. They are not a penalty.' },
      ...(consumer
        ? [{ type: 'p' as const, text: 'If you’re a consumer, we’ll never charge you more than the value of the work we’ve actually carried out for you plus any third-party costs. If that comes to less than the amount above, you pay the lower amount.' }]
        : []),
    ],
  };
}

const READY_DEADLINES: LegalSection = {
  id: 'cp-our-deadlines',
  heading: 'If we miss a deadline',
  plain: 'If we don’t finish your changes within 5 working days through our own fault, you can cancel and get your deposit back.',
  blocks: [
    { type: 'p', text: 'We promise to finish your changes within 5 working days of receiving your content. If we miss that for a reason within our control, you can cancel within 7 days of the missed deadline and we’ll refund your deposit in full.' },
    { type: 'p', text: 'This doesn’t apply to delays you cause or to events outside our reasonable control. It’s a right to cancel: you can’t keep the website and also have the deposit refunded.' },
  ],
};

const READY_PAYING: LegalSection = {
  id: 'cp-paying',
  heading: 'Paying the balance, and launch',
  plain: 'The balance is due within 7 days of us sharing your finished site. It goes live within 3 working days of payment.',
  blocks: [
    { type: 'p', text: 'The balance is due within 7 days of us sharing your finished site with your changes made. We launch it within 3 working days of the balance clearing.' },
    { type: 'p', text: 'Ownership of the site passes to you only when the price has been paid in full.' },
    { type: 'p', text: 'If we host your site or provide other ongoing services and a payment is more than 30 days overdue, we may suspend those services after giving you at least 7 days’ written notice, and we’ll restore them once the account is up to date.' },
  ],
};

const READY_SUMMARY: LegalSection = {
  id: 'cp-ready-made',
  heading: 'Ready-made sites',
  plain: 'If we show you a site we’ve already built and you buy it, the timeline is faster and the rules are a little different.',
  blocks: [
    { type: 'p', text: 'Sometimes we show you a website we’ve already built for your business. Until you buy it, it stays ours and is only shown on our preview address. If you go ahead:' },
    { type: 'ul', items: [
      'you pay the £100 deposit when you approve your quote, and we make one round of changes to fit your business within 5 working days of receiving your content;',
      'your deposit is refunded if you cancel before we start your changes, and kept after that;',
      'the full price is due once we’ve shared the finished site with your changes, and the balance is payable within 7 days of that;',
      'your site goes live within 3 working days of the balance clearing; and',
      'if you decide not to buy it, we remove your name, logo and content, and may reuse the design.',
    ] },
    { type: 'p', text: 'Everything else in this policy applies in the same way.' },
  ],
};
