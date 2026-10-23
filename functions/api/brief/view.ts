import { json, readJson, rpc, RpcError, TOKEN_PATTERN, type Ctx } from '../../../server/agreements';

// POST /api/brief/view { token } -> the quote summary the brief page shows (no email or phone).
export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<{ token?: string }>(request);
  const token = body?.token ?? '';
  if (!TOKEN_PATTERN.test(token)) return json({ error: 'not_found' }, 404);
  try {
    const quote = await rpc<unknown>(env, 'web_quote_brief_open', { p_token: token });
    if (!quote) return json({ error: 'not_found' }, 404);
    return json({ quote });
  } catch (err) {
    return json({ error: 'unavailable' }, err instanceof RpcError ? err.status : 500);
  }
};
