// POST /api/project/open { token } -> the client's project tracker (see src/tracker.ts for how the page reads it).
import { json, readJson, rpc, RpcError, TOKEN_PATTERN, type Ctx } from '../../../server/agreements';

const NOT_FOUND = 'We couldn’t find this project page. Please check the link we sent you.';

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<{ token?: string }>(request);
  const token = body?.token ?? '';
  if (!TOKEN_PATTERN.test(token)) return json({ error: NOT_FOUND }, 404);
  try {
    return json({ project: await rpc<unknown>(env, 'project_tracker_open', { p_token: token }) });
  } catch (err) {
    if (err instanceof RpcError && err.code === 'not_found') return json({ error: NOT_FOUND }, 404);
    const status = err instanceof RpcError ? err.status : 500;
    return json({ error: 'This page isn’t available right now. Please email admin.team@motion-visual.com.' }, status === 503 ? 503 : 500);
  }
};
