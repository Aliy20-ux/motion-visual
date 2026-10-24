import { json, readJson, rpc, RpcError, TOKEN_PATTERN, type Ctx } from '../../../server/agreements';
import { REVIEW_ERRORS, hasNul, notifyTeamOfReview } from '../../../server/reviews';

type Body = { token?: string; rating?: unknown; body?: unknown; name?: unknown; business?: unknown; consent?: unknown };

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<Body>(request);
  if (!body || !TOKEN_PATTERN.test(body.token ?? '')) return json({ error: REVIEW_ERRORS.not_found }, 404);

  const rating = typeof body.rating === 'number' && Number.isInteger(body.rating) ? body.rating : 0;
  const text = typeof body.body === 'string' ? body.body : '';
  const name = typeof body.name === 'string' ? body.name : '';
  const business = typeof body.business === 'string' ? body.business : '';
  if (rating < 1 || rating > 5) return json({ error: REVIEW_ERRORS.invalid_rating }, 400);
  if (hasNul(text, name, business)) return json({ error: 'Your review contains a character we can’t store. Please remove it and try again.' }, 400);

  try {
    const out = await rpc<{ ok: true; googleReviewUrl: string | null }>(env, 'review_submit', {
      p_token: body.token,
      p_rating: rating,
      p_body: text,
      p_name: name,
      p_business: business,
      p_consent: body.consent === true,
    });
    // The review is saved; a failed notification email is not the client's problem.
    await notifyTeamOfReview(env, { rating, name: name.trim(), business: business.trim() || null, body: text.trim(), consent: body.consent === true });
    return json({ ok: true, googleReviewUrl: out.googleReviewUrl ?? null });
  } catch (err) {
    const code = err instanceof RpcError ? err.code : 'rpc_failed';
    const status = code === 'not_found' ? 404 : err instanceof RpcError ? err.status : 500;
    return json({ error: REVIEW_ERRORS[code] ?? 'Something went wrong sending your review. Please try again.' }, status);
  }
};
