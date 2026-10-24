import type { AgreementKind } from './types';

export function formatGBP(pence: number): string {
  const pounds = pence / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(pounds);
}

/** Deposit rule: exactly 25% of the build price, to the nearest penny (no rounding to whole pounds). */
export function depositPence(totalPence: number): number {
  return Math.round(totalPence * 0.25);
}

/** "£1,200" / "1200.50" / "1,200" → pence, or null if it isn't a positive amount. */
export function parsePounds(input: string): number | null {
  const cleaned = input.replace(/[£,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/London', timeZoneName: 'short',
  });
}

export const KIND_LABEL: Record<AgreementKind, string> = {
  project: 'Project Agreement',
  change: 'Change Request',
  completion: 'Completion Sign-off',
};
