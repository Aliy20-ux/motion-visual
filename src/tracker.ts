// The logic behind the client project tracker page, kept apart from the page so it can be tested. Browser-free: bundled into functions/.
import { DELIVERY_DAYS } from './commercial';

export const TRACKER_STAGES = ['Discovery', 'Design', 'Build', 'Client Review', 'Launch', 'Live'] as const;

export type TrackerRaw = {
  projectName: string;
  businessName: string | null;
  stage: string;
  today: string; // the server's date (UK), so the day count is the same for everyone
  launchDate: string | null;
  contentReceivedOn: string | null;
  note: string | null;
  agreement: { status: string; signedOn: string | null; signToken: string | null } | null;
  reviewToken: string | null;
};

export type WaitingItem = { id: 'agreement' | 'agreement-expired' | 'content' | 'design'; text: string; href?: string };

export type TrackerView = {
  phase: 'live' | 'underway' | 'not-started';
  /** Days since day 0 (0 on the day the clock starts), or null if the clock hasn't started. */
  day: number | null;
  totalDays: number;
  pastTarget: boolean;
  progress: number;
  dayZero: string | null;
  firstDesignBy: string | null;
  siteBy: string | null;
  stageIndex: number;
  waiting: WaitingItem[];
};

const noon = (iso: string) => new Date(`${iso}T12:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

export const daysBetween = (from: string, to: string) => Math.round((noon(to).getTime() - noon(from).getTime()) / 86_400_000);
export const addDays = (date: string, n: number) => iso(new Date(noon(date).getTime() + n * 86_400_000));

/** Counts Monday to Friday only. (Bank holidays aren't known here, so the date is a target, not a promise.) */
export function addWorkingDays(date: string, n: number): string {
  let d = noon(date);
  let left = n;
  while (left > 0) {
    d = new Date(d.getTime() + 86_400_000);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) left--;
  }
  return iso(d);
}

export function buildTracker(raw: TrackerRaw): TrackerView {
  const stageIndex = Math.max(0, TRACKER_STAGES.indexOf(raw.stage as (typeof TRACKER_STAGES)[number]));
  const live = raw.stage === 'Live';
  const finishing = raw.stage === 'Launch' || live;
  const signedOn = raw.agreement?.signedOn ?? null;
  const agreementOk = raw.agreement === null || raw.agreement.status === 'signed';

  // Day 0 is the day we have BOTH the signed agreement and the content (the same rule as the agreement itself).
  // A project with no agreement on file (made by hand) starts from the content date alone.
  let dayZero: string | null = null;
  if (raw.contentReceivedOn && agreementOk) dayZero = raw.agreement === null || !signedOn ? raw.contentReceivedOn : (signedOn > raw.contentReceivedOn ? signedOn : raw.contentReceivedOn);

  const day = dayZero ? Math.max(0, daysBetween(dayZero, raw.today)) : null;
  const waiting: WaitingItem[] = [];
  if (!live) {
    if (raw.agreement && raw.agreement.status !== 'signed' && raw.agreement.status !== 'void') {
      if (raw.agreement.status === 'sent' && raw.agreement.signToken) waiting.push({ id: 'agreement', text: 'Sign your Project Agreement', href: `/agreement/${raw.agreement.signToken}` });
      else if (raw.agreement.status === 'sent') waiting.push({ id: 'agreement-expired', text: 'Your agreement link has expired. Email us and we’ll send a fresh one.' });
    }
    if (!raw.contentReceivedOn && !finishing) waiting.push({ id: 'content', text: 'Send us your content: your words, logo and photos.' });
    if (raw.stage === 'Client Review') waiting.push({ id: 'design', text: 'Look over your site and send us your feedback.' });
  }

  return {
    phase: live ? 'live' : dayZero ? 'underway' : 'not-started',
    day,
    totalDays: DELIVERY_DAYS,
    pastTarget: !live && day !== null && day > DELIVERY_DAYS,
    progress: live ? 1 : day === null ? 0 : Math.min(1, day / DELIVERY_DAYS),
    dayZero,
    firstDesignBy: dayZero ? addWorkingDays(dayZero, 2) : null,
    siteBy: dayZero ? addDays(dayZero, DELIVERY_DAYS) : null,
    stageIndex,
    waiting,
  };
}
