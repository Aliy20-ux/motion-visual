import { json, readJson, rpc, RpcError, TOKEN_PATTERN, type Ctx } from '../../../server/agreements';
import { REVIEW_ERRORS } from '../../../server/reviews';

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<{ token?: string }>(request);
  const token = body?.token ?? '';
  if (!TOKEN_PATTERN.test(token)) return json({ error: REVIEW_ERRORS.not_found }, 404);

  try {
    const review = await rpc<unknown>(env, 'review_open', { p_token: token });
    return json({ review });
  } catch (err) {
    const code = err instanceof RpcError ? err.code : 'rpc_failed';
    const status = code === 'not_found' ? 404 : err instanceof RpcError ? err.status : 500;
    return json({ error: REVIEW_ERRORS[code] ?? 'Something went wrong loading this page.' }, status);
  }
};
