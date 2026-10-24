// The one place for the numbers and terms that appear in more than one document: care plans, deposit rule,
// payment days, fees. The website pages, the legal wording, the quote emails and the admin (via
// docs/commercial-terms.json and the commercial_terms table) all read from here, and tests/commercial.test.ts
// fails if any of them drift. Change a price HERE, then run `npm run sync-terms`.
// Keep browser-free: this file is bundled into functions/.
import { ADD_ONS, EXTRA_PAGE_PRICE, PLAN_PAGES, PLAN_PRICE, depositFor, gbp } from './pricing';
import { COMPANY } from './legal/company';

export type CarePlanKey = 'essential' | 'signature' | 'flagship';

export const CARE_PLANS: Record<CarePlanKey, { name: string; price: number; from: boolean; updatesPerMonth: number }> = {
  essential: { name: 'Essential care', price: 49.99, from: false, updatesPerMonth: 3 },
  signature: { name: 'Signature care', price: 79.99, from: false, updatesPerMonth: 6 },
  flagship: { name: 'Flagship care', price: 129.99, from: true, updatesPerMonth: 12 },
};

/** "£49.99", or "From £129.99" for the scoped plan. */
export const carePriceLabel = (key: CarePlanKey): string => `${CARE_PLANS[key].from ? 'From ' : ''}${gbp(CARE_PLANS[key].price)}`;

export const KEEP_ALIVE_PRICE = 30;
export const SMALL_UPDATE_PRICE = 15;
export const HANDOVER_FEE = 150;
export const MIN_CARE_TERM_MONTHS = 3;
export const CARE_NOTICE_WORKING_DAYS = 5;
export const QUOTE_VALID_DAYS = 14;
export const BALANCE_DUE_DAYS = 7;
export const DELIVERY_DAYS = 14;
export const BUG_FIX_DAYS = 30;
export const UPGRADE = { fee: 800, minimumFee: 400, afterMonths: 12 } as const;
export const CANCELLATION_STAGES = [
  { when: 'Before we begin work', owesPercent: 0, note: 'Deposit refunded in full' },
  { when: 'Work started, first design not shared', owesPercent: null, note: 'Deposit kept' },
  { when: 'First design shared', owesPercent: 40, note: 'Less the deposit' },
  { when: 'Build underway', owesPercent: 70, note: 'Less what has been paid' },
  { when: 'Finished site shared', owesPercent: 100, note: 'The full price' },
] as const;

export const DEPOSIT = { percent: 25, rule: '25% of the build price' } as const;

/** What the admin (and anything else outside this repo) reads. Deterministic: no dates, so it can be diffed in tests. */
export function buildCommercialTerms(meta: { version: string; updated: string }) {
  return {
    schema: 1,
    version: meta.version,
    updated: meta.updated,
    company: {
      legalName: COMPANY.legalName,
      tradingName: COMPANY.tradingName,
      companyNumber: COMPANY.companyNumber,
      registeredOffice: COMPANY.registeredOffice,
      website: COMPANY.website,
      vatRegistered: COMPANY.vatRegistered,
    },
    packages: (Object.keys(PLAN_PRICE) as (keyof typeof PLAN_PRICE)[]).map(name => ({ name, price: PLAN_PRICE[name], pages: PLAN_PAGES[name] })),
    flagship: { name: 'Flagship', scopedOnACall: true },
    extraPagePrice: EXTRA_PAGE_PRICE,
    addOns: ADD_ONS.map(a => ({
      id: a.id,
      name: a.name,
      blurb: a.blurb,
      price: a.price ?? null,
      plans: a.plans,
      includedIn: a.includedIn ?? [],
      scopedOnACall: !!a.flagship,
    })),
    deposit: {
      ...DEPOSIT,
      examples: [800, 1600, 2000].map(total => ({ total, deposit: depositFor(total), balance: total - depositFor(total) })),
    },
    carePlans: (Object.keys(CARE_PLANS) as CarePlanKey[]).map(key => ({ key, ...CARE_PLANS[key] })),
    keepAlivePrice: KEEP_ALIVE_PRICE,
    smallUpdatePrice: SMALL_UPDATE_PRICE,
    handoverFee: HANDOVER_FEE,
    minimumCareTermMonths: MIN_CARE_TERM_MONTHS,
    careNoticeWorkingDays: CARE_NOTICE_WORKING_DAYS,
    quoteValidDays: QUOTE_VALID_DAYS,
    balanceDueDays: BALANCE_DUE_DAYS,
    deliveryDays: DELIVERY_DAYS,
    bugFixDays: BUG_FIX_DAYS,
    upgrade: UPGRADE,
    cancellationStages: CANCELLATION_STAGES,
    documents: [
      { key: 'terms', title: 'Terms of Service', url: `${COMPANY.website}/terms` },
      { key: 'privacy', title: 'Privacy Policy', url: `${COMPANY.website}/privacy` },
      { key: 'cancellation', title: 'Cancellation & Refund Policy', url: `${COMPANY.website}/cancellation` },
    ],
  };
}
