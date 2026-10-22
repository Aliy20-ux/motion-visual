import { clientIp, json, readJson, rpc, RpcError, SIGN_ERRORS, TOKEN_PATTERN, userAgent, type Ctx } from '../../../server/agreements';

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<{ token?: string }>(request);
  const token = body?.token ?? '';
  if (!TOKEN_PATTERN.test(token)) return json({ error: SIGN_ERRORS.not_found }, 404);

  try {
    const agreement = await rpc<unknown>(env, 'agreement_open', {
      p_token: token,
      p_ip: clientIp(request),
      p_user_agent: userAgent(request),
    });
    if (!agreement) return json({ error: SIGN_ERRORS.not_found }, 404);
    return json({ agreement });
  } catch (err) {
    const code = err instanceof RpcError ? err.code : 'rpc_failed';
    const status = err instanceof RpcError ? err.status : 500;
    return json({ error: SIGN_ERRORS[code] ?? 'Something went wrong loading this agreement.' }, status);
  }
};
