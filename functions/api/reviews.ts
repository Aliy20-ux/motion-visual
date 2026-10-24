import { rpc, type Ctx } from '../../server/agreements';

/** Approved client reviews for the home page. Cached for five minutes; if anything fails the page simply shows none. */
export const onRequestGet = async ({ env }: Ctx): Promise<Response> => {
  const empty = { count: 0, average: null, reviews: [] };
  let out: typeof empty = empty;
  try {
    out = await rpc<typeof empty>(env, 'reviews_public', {});
  } catch {
    return Response.json(empty, { headers: { 'Cache-Control': 'public, max-age=30' } });
  }
  return Response.json(out, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } });
};
