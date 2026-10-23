import {
  clientIp, json, readJson, rpc, RpcError, sendEmail, SIGN_ERRORS, TEAM_INBOX, TOKEN_PATTERN, userAgent, type Ctx,
} from '../../../server/agreements';
import { emailShell, escapeHtml, renderAgreementHtml } from '../../../src/legal/renderHtml';
import { KIND_LABEL } from '../../../src/legal/format';
import { COMPANY, COMPANY_DISCLOSURE } from '../../../src/legal/company';
import type { AgreementDocument } from '../../../src/legal/types';

type SignBody = {
  token?: string;
  documentHash?: string;
  signerName?: string;
  consents?: Record<string, boolean | string>;
};

type Signed = {
  reference: string;
  status: string;
  document: AgreementDocument;
  documentHash: string;
  signedAt: string;
  signerName: string;
  signerConsents: Record<string, boolean | string>;
  clientEmail: string;
  clientName: string;
  signerIp: string | null;
};

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<SignBody>(request);
  if (!body || !TOKEN_PATTERN.test(body.token ?? '')) return json({ error: SIGN_ERRORS.not_found }, 404);

  const consents: Record<string, boolean | string> = {};
  for (const [k, v] of Object.entries(body.consents ?? {})) {
    if (typeof v === 'boolean' || (k === 'startChoice' && (v === 'now' || v === 'wait'))) consents[k] = v;
  }

  let signed: Signed;
  try {
    signed = await rpc<Signed>(env, 'agreement_sign', {
      p_token: body.token,
      p_document_hash: body.documentHash ?? '',
      p_signer_name: body.signerName ?? '',
      p_consents: consents,
      p_ip: clientIp(request),
      p_user_agent: userAgent(request),
    });
  } catch (err) {
    const code = err instanceof RpcError ? err.code : 'rpc_failed';
    const status = err instanceof RpcError ? err.status : 500;
    return json({ error: SIGN_ERRORS[code] ?? 'Something went wrong while signing. Please try again.' }, status);
  }

  const doc = signed.document;
  const link = `${COMPANY.website}/agreement/${body.token}`;
  const html = emailShell(
    `<p style="font-size:14px;line-height:1.6;margin:0 0 16px;">Hi ${escapeHtml(signed.clientName.split(' ')[0] || 'there')},</p>
     <p style="font-size:14px;line-height:1.6;margin:0 0 16px;">Thanks for signing. Here’s your copy of the signed ${escapeHtml(KIND_LABEL[doc.kind].toLowerCase())} for your records — it includes the full terms, the Cancellation &amp; Refund Policy and the signature record. You can also view it online at <a href="${escapeHtml(link)}" style="color:#a51818;">${escapeHtml(link)}</a>.</p>
     <hr style="border:none;border-top:1px solid #e4e0d6;margin:20px 0;" />
     ${renderAgreementHtml(doc, {
       signerName: signed.signerName,
       signedAt: signed.signedAt,
       ip: signed.signerIp,
       documentHash: signed.documentHash,
       startChoice: typeof signed.signerConsents.startChoice === 'string' ? signed.signerConsents.startChoice : null,
     })}`,
    COMPANY_DISCLOSURE,
  );

  // The signature is already stored; a failed email is reported, not fatal,
  // so the client still sees their signed copy on the page.
  const emailed = await sendEmail(env, {
    to: [signed.clientEmail],
    bcc: [TEAM_INBOX],
    subject: `Signed: ${doc.title} (${signed.reference})`,
    html,
  }).catch(() => false);

  const { clientEmail: _e, clientName: _n, signerIp: _i, ...publicAgreement } = signed;
  return json({ agreement: publicAgreement, emailed });
};
