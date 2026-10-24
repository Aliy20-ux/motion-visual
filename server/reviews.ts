// Shared bits for the review Pages Functions (the client page at /review/<token> and the public list on the home page).
import { TEAM_INBOX, sendEmail, type AgreementEnv } from './agreements';
import { emailShell, escapeHtml } from '../src/legal/renderHtml';
import { COMPANY_DISCLOSURE } from '../src/legal/company';

/** Client-facing wording for the error codes raised by the review_* functions in the migration. */
export const REVIEW_ERRORS: Record<string, string> = {
  not_found: 'We couldn’t find this review link. Please check the link in your invoice email.',
  already_submitted: 'You’ve already left a review for this project. Thank you!',
  expired: 'This review link has expired. If you’d still like to leave a review, email us and we’ll send a fresh one.',
  invalid_rating: 'Please choose a star rating from 1 to 5.',
  invalid_name: 'Please add your name (up to 80 characters).',
  invalid_body: 'Your review is too long. Please keep it under 2,000 characters.',
  invalid_business: 'That business name is too long.',
  not_configured: 'Reviews aren’t available right now. Please email us and we’ll sort it out.',
  not_authorised: 'Reviews aren’t available right now. Please email us and we’ll sort it out.',
};

/** NUL bytes can't be stored by Postgres and would turn into a 500; refuse them up front. */
export const hasNul = (...values: unknown[]) => values.some(v => typeof v === 'string' && v.includes('\u0000'));

export async function notifyTeamOfReview(env: AgreementEnv, r: { rating: number; name: string; business: string | null; body: string; consent: boolean }): Promise<boolean> {
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  const who = r.business ? `${r.name}, ${r.business}` : r.name;
  const html = emailShell(
    `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">A new client review is waiting for approval.</p>
     <p style="font-size:22px;margin:0 0 8px;color:#a51818;letter-spacing:2px;">${stars}</p>
     <p style="font-size:14px;line-height:1.6;margin:0 0 12px;"><strong>${escapeHtml(who)}</strong> ${r.consent ? 'agreed to it being shown on the website.' : '<em>did not</em> agree to it being shown, so it can’t be published.'}</p>
     ${r.body ? `<blockquote style="margin:0 0 16px;padding:0 0 0 12px;border-left:3px solid #e4e0d6;font-size:14px;line-height:1.6;">${escapeHtml(r.body).replace(/\n/g, '<br />')}</blockquote>` : '<p style="font-size:14px;color:#6b665c;">(No written review: stars only.)</p>'}
     <p style="font-size:14px;line-height:1.6;margin:0;">Approve or hide it in the admin: <a href="https://admin.motion-visual.com/reviews" style="color:#a51818;">admin.motion-visual.com/reviews</a></p>`,
    COMPANY_DISCLOSURE,
  );
  return sendEmail(env, { to: [TEAM_INBOX], subject: `New ${r.rating}-star review from ${r.name}`, html }).catch(() => false);
}
