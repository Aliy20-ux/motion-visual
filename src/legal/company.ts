// Legal identity used on every legal page, agreement and email. Trading
// disclosures (name, number, place of registration, registered office) are
// required on a Ltd's website, order forms and emails — keep this the single
// source so they can't drift apart.
export const COMPANY = {
  legalName: 'Motion Visual Studios Ltd',
  tradingName: 'Motion Visual',
  companyNumber: 'SC895834',
  registeredIn: 'Scotland',
  registeredOffice: '5 South Charlotte Street, Edinburgh, EH2 4AN',
  email: 'admin.team@motion-visual.com',
  website: 'https://motion-visual.com',
  vatRegistered: false,
} as const;

export const COMPANY_DISCLOSURE =
  `${COMPANY.legalName} is a company registered in ${COMPANY.registeredIn} (company number ${COMPANY.companyNumber}). ` +
  `Registered office: ${COMPANY.registeredOffice}.`;

export const VAT_NOTE = COMPANY.vatRegistered
  ? 'Prices include VAT at the current rate unless stated otherwise.'
  : `${COMPANY.legalName} is not registered for VAT, so no VAT is charged.`;
