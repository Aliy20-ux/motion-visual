// Single source of prices for the add-ons builder (browser) and /api/quote-request (server).
// The server recomputes every quote from these numbers, so a tampered request can't change a price.
// Keep browser-free: this file is bundled into functions/.

export type PlanKey = 'Essential' | 'Signature';
export const PLANS: PlanKey[] = ['Essential', 'Signature'];

export const PLAN_PRICE: Record<PlanKey, number> = { Essential: 800, Signature: 1600 };
export const PLAN_PAGES: Record<PlanKey, number> = { Essential: 1, Signature: 5 };
export const EXTRA_PAGE_PRICE = 80;
export const MAX_EXTRA_PAGES = 15;

// Deposit rule: about 25% of the total, rounded up to the nearest £5.
export const depositFor = (total: number) => Math.ceil((total * 0.25) / 5) * 5;

export type AddOn = {
  id: string;
  name: string;
  blurb: string;
  price?: number;          // undefined = quote on a call (Flagship territory)
  plans: PlanKey[];        // plans that can buy it — hidden on any other plan
  includedIn?: PlanKey[];  // already part of that plan, so shown as included
  flagship?: boolean;      // selecting it means a Flagship scoping call, not an automatic quote
};

export const ADD_ONS: AddOn[] = [
  { id: 'order-lite', name: 'Interactive order builder (Lite)', blurb: 'Customers build their order or package on your site and send it to you as an enquiry or summary email. No card payment.', price: 250, plans: ['Essential', 'Signature'], includedIn: ['Signature'] },
  { id: 'order-full', name: 'Interactive order builder (full)', blurb: 'A fuller version of the builder, still ending in an enquiry or summary email. No card payment.', price: 400, plans: ['Signature'] },
  { id: 'local-seo', name: 'Local SEO Boost', blurb: 'Local keywords, schema markup and Google Business Profile optimisation, to help nearby customers find you.', price: 250, plans: ['Essential', 'Signature'] },
  { id: 'ai-chatbox', name: 'AI chatbox', blurb: 'A chat box on your site that answers visitors’ questions about your business — hours, services, prices and FAQs — using the details you give us.', price: 249, plans: ['Essential', 'Signature'] },
  { id: 'gallery', name: 'Gallery with filters', blurb: 'A photo gallery your visitors can filter by category.', price: 75, plans: ['Essential', 'Signature'] },
  { id: 'reviews', name: 'Reviews wall', blurb: 'Your best customer reviews displayed on the site.', price: 75, plans: ['Essential', 'Signature'] },
  { id: 'confirmations', name: 'Email / WhatsApp confirmations', blurb: 'Automatic confirmation messages when someone enquires or books.', price: 100, plans: ['Signature'] },
  { id: 'booking', name: 'Booking', blurb: 'Let customers book appointments or tables straight from your site.', price: 200, plans: ['Signature'] },
  { id: 'editor', name: 'Content editor', blurb: 'A simple dashboard to change text, prices and photos yourself.', price: 150, plans: ['Signature'] },
  { id: 'shop', name: 'Online shop / ordering', blurb: 'Take payments and orders online, with stock and delivery options. Scoped and quoted on a call.', plans: ['Essential', 'Signature'], flagship: true },
];

export const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`;

/** What `plan` costs for `pagesTotal` pages and the picked add-ons (included and ineligible add-ons cost nothing). */
export function priceFor(plan: PlanKey, pagesTotal: number, pickedIds: string[]): number {
  const extra = Math.max(0, pagesTotal - PLAN_PAGES[plan]);
  const addOnSum = ADD_ONS
    .filter(a => pickedIds.includes(a.id) && a.price !== undefined && a.plans.includes(plan) && !a.includedIn?.includes(plan))
    .reduce((sum, a) => sum + a.price!, 0);
  return PLAN_PRICE[plan] + extra * EXTRA_PAGE_PRICE + addOnSum;
}

export type QuoteInput = { plan: PlanKey; extraPages: number; addOnIds: string[] };

export type QuoteLine = { label: string; pounds: number | null; note?: string };

export type Quote = {
  plan: PlanKey;
  pagesTotal: number;
  extraPages: number;
  lines: QuoteLine[];
  totalPounds: number;
  depositPounds: number;
  balancePounds: number;
};

export type QuoteCheck =
  | { ok: true; quote: Quote }
  | { ok: false; error: string };

/**
 * Validates a request and prices it. Anything the plan can't buy, or any unknown id, is an error —
 * the server never silently drops or re-prices what the customer asked for. Shop / ordering requests
 * are Flagship territory and are handled as a call request, not a quote.
 */
export function buildQuote(input: { plan: unknown; extraPages: unknown; addOnIds: unknown }): QuoteCheck {
  const { plan, extraPages, addOnIds } = input;
  if (plan !== 'Essential' && plan !== 'Signature') return { ok: false, error: 'Unknown plan' };
  if (!Number.isInteger(extraPages) || (extraPages as number) < 0 || (extraPages as number) > MAX_EXTRA_PAGES) return { ok: false, error: 'Invalid page count' };
  if (!Array.isArray(addOnIds) || addOnIds.some(id => typeof id !== 'string') || new Set(addOnIds).size !== addOnIds.length) return { ok: false, error: 'Invalid add-ons' };

  const ids = addOnIds as string[];
  for (const id of ids) {
    const addOn = ADD_ONS.find(a => a.id === id);
    if (!addOn) return { ok: false, error: `Unknown add-on: ${id}` };
    if (addOn.flagship) return { ok: false, error: 'Flagship request' };
    if (!addOn.plans.includes(plan)) return { ok: false, error: `${addOn.name} isn't available on ${plan}` };
  }

  const extra = extraPages as number;
  const pagesTotal = PLAN_PAGES[plan] + extra;
  const lines: QuoteLine[] = [
    { label: `${plan} plan`, pounds: PLAN_PRICE[plan], note: PLAN_PAGES[plan] === 1 ? '1 landing page' : `up to ${PLAN_PAGES[plan]} pages` },
  ];
  if (extra > 0) lines.push({ label: `${extra} extra page${extra > 1 ? 's' : ''}`, pounds: extra * EXTRA_PAGE_PRICE, note: `${gbp(EXTRA_PAGE_PRICE)} each` });
  for (const id of ids) {
    const addOn = ADD_ONS.find(a => a.id === id)!;
    const included = addOn.includedIn?.includes(plan);
    lines.push({ label: addOn.name, pounds: included ? 0 : addOn.price!, note: included ? 'included in your plan' : undefined });
  }

  const totalPounds = priceFor(plan, pagesTotal, ids);
  const depositPounds = depositFor(totalPounds);
  return { ok: true, quote: { plan, pagesTotal, extraPages: extra, lines, totalPounds, depositPounds, balancePounds: totalPounds - depositPounds } };
}
