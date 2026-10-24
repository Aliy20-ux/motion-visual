// Everything the website assistant is allowed to say, built from the same files that drive the site, so a price or term
// changed there changes here with no second edit. Keep browser-free: this file is bundled into functions/.
import { ADD_ONS, EXTRA_PAGE_PRICE, MAX_EXTRA_PAGES, PLANS, PLAN_PAGES, PLAN_PRICE, gbp } from './pricing';
import {
  BALANCE_DUE_DAYS, BUG_FIX_DAYS, CANCELLATION_STAGES, CARE_INCLUDES, CARE_NOTICE_WORKING_DAYS, CARE_PLANS, DELIVERY_DAYS, HANDOVER_FEE,
  KEEP_ALIVE_PRICE, MIN_CARE_TERM_MONTHS, QUOTE_VALID_DAYS, SMALL_UPDATE_PRICE, UPGRADE, carePriceLabel,
} from './commercial';
import { COMPANY } from './legal/company';
import { FLAGSHIP } from './flagship';
import { PROCESS_STEPS } from './process';

const bullets = (rows: readonly string[]) => rows.map(r => `- ${r}`).join('\n');

/** The plain-text facts the assistant answers from. */
export function buildKnowledge(): string {
  const packages = PLANS.map(p => `${p} is ${gbp(PLAN_PRICE[p])} for ${PLAN_PAGES[p] === 1 ? 'a 1-page landing site' : `up to ${PLAN_PAGES[p]} pages`}.`);
  const addOns = ADD_ONS.filter(a => !a.flagship).map(a => {
    const where = a.plans.length === 1 ? `Signature only` : `Essential and Signature`;
    const incl = a.includedIn?.length ? ` Included at no extra cost in ${a.includedIn.join(' and ')}.` : '';
    return `${a.name}: ${gbp(a.price!)} one-off (${where}).${incl} ${a.blurb}`;
  });
  const care = (Object.keys(CARE_PLANS) as (keyof typeof CARE_PLANS)[]).map(k => `${CARE_PLANS[k].name}: ${carePriceLabel(k)} a month, ${CARE_PLANS[k].updatesPerMonth} updates per payment period${k === 'flagship' ? ' (fair use), scoped with you, with a quarterly review call' : k === 'signature' ? ', plus a short report each period' : ''}.`);
  const cancel = CANCELLATION_STAGES.map(s => `${s.when}: ${s.owesPercent === null ? 'the deposit is kept' : s.owesPercent === 0 ? 'nothing owed' : `${s.owesPercent}% of the price is owed`} (${s.note.toLowerCase()}).`);
  const steps = PROCESS_STEPS.map(s => `${s.num} ${s.title} (${s.duration}): ${s.body}`);

  return `COMPANY
- ${COMPANY.tradingName} is a web design agency based in Edinburgh, Scotland, working fully online with clients across the UK. It is the trading name of ${COMPANY.legalName}, a company registered in ${COMPANY.registeredIn} (company number ${COMPANY.companyNumber}). It is not registered for VAT, so no VAT is charged.
- The team is four founders: Ali, Munib, Nadir and Robbie. Every project is built in-house, with no contractors and no outsourcing.
- Contact: ${COMPANY.email}. A founder aims to reply to enquiries within 24 hours.
- Previous work shown on the site includes Texture Lounge, Trim2Fresh, Kell Executive and S2 Studio.

PACKAGES (one-off build prices)
${bullets(packages)}
- Flagship is scoped individually on a call, so there is no fixed price. ${FLAGSHIP.description} It includes: ${FLAGSHIP.features.join('; ')}.
- Extra pages are ${gbp(EXTRA_PAGE_PRICE)} each (the website's package builder allows up to ${MAX_EXTRA_PAGES} extra pages).
- Signature includes cinematic animations, advanced and local SEO and the Lite order builder.

ADD-ONS (Essential and Signature builds)
${bullets(addOns)}
- An online shop or ordering system with payments is a Flagship project, scoped on a call.
- Add-ons are one-off prices. Motion Visual never guarantees search rankings or business results.

PAYMENT AND TERMS
- The deposit is exactly 25% of the build price, paid when the Project Agreement is signed. The balance is due within ${BALANCE_DUE_DAYS} days of the finished site being shared. There are no interest or late fees.
- Quotes are valid for ${QUOTE_VALID_DAYS} days.
- Delivery takes ${DELIVERY_DAYS} days. The ${DELIVERY_DAYS} days start once Motion Visual has the client's content and a signed agreement. The first design is shared within 2 working days of that (a 48-hour target).
- For ${BUG_FIX_DAYS} days after launch, bugs are fixed free of charge. After that, support is through an optional care plan or at a quoted price.
- The site belongs to the client once it is paid for in full.
- If a client cancels, what is owed depends on how far the work has got:
${bullets(cancel)}
- Consumers (people buying for themselves, not a business) also have a 14-day right to cancel. The full details are on the Terms and Cancellation pages: ${COMPANY.website}/terms and ${COMPANY.website}/cancellation.

CARE PLANS (optional, paid monthly by direct debit)
${bullets(care)}
- Every care plan includes: ${CARE_INCLUDES.join(', ')}.
- Minimum term ${MIN_CARE_TERM_MONTHS} months, then ${CARE_NOTICE_WORKING_DAYS} working days' written notice to step down, pause or leave. Unused updates do not roll over.
- Keep-alive plan: ${gbp(KEEP_ALIVE_PRICE)} a month for hosting, security, backups and monitoring with no updates. Extra small updates are ${gbp(SMALL_UPDATE_PRICE)} each. Moving hosting away when leaving has a ${gbp(HANDOVER_FEE)} handover fee.
- After a full year on Essential with an active care plan, a client can upgrade to Signature for ${gbp(UPGRADE.fee)} (never less than ${gbp(UPGRADE.minimumFee)}).

PROCESS (${DELIVERY_DAYS} days)
${bullets(steps)}

HOW TO GET STARTED
- Price an Essential or Signature package yourself in the "Build your perfect package" section on this page, then press "Request this package" to get a quote by email.
- For Flagship, use the Flagship enquiry form on this page and a founder will arrange a scoping call.
- Or email ${COMPANY.email}, or press "Talk to a founder" in this chat.`;
}
