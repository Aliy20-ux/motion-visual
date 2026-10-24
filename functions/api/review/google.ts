import { json, readJson, rpc, TOKEN_PATTERN, type Ctx } from '../../../server/agreements';

/** Records that the client pressed "Post on Google", so the team can see who followed through. Best effort. */
export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const body = await readJson<{ token?: string }>(request);
  if (!TOKEN_PATTERN.test(body?.token ?? '')) return json({ ok: false }, 404);
  await rpc(env, 'review_google_clicked', { p_token: body!.token }).catch(() => null);
  return json({ ok: true });
};
