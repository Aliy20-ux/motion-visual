// The website's AI assistant.
//   GET  /api/assistant  -> { enabled } : whether the chat button should appear (key set, not switched off, usage limits reachable).
//   POST /api/assistant  -> a streamed answer (newline-delimited JSON) to the visitor's conversation.
// See docs/ASSISTANT.md. The model only ever sees the visitor's messages and the facts in src/assistantKnowledge.ts.
import { clientIp, json, readJson, type Ctx } from '../../server/agreements';
import { SAFE_REPLIES, checkAllowance, hashVisitor, isEnabled, parseConversation, streamAnswer } from '../../server/assistant';

export const onRequestGet = async ({ env }: Ctx): Promise<Response> => {
  const enabled = isEnabled(env) && (await checkAllowance(env, 'status-check-visitor', 'chat', false)) !== 'unavailable';
  return Response.json({ enabled }, { headers: { 'Cache-Control': 'public, max-age=60' } });
};

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!isEnabled(env)) return json({ error: SAFE_REPLIES.off }, 503);
  const body = await readJson<{ messages?: unknown }>(request);
  const turns = parseConversation(body?.messages);
  if (!turns) return json({ error: 'Please send a short question and try again.' }, 400);

  const allowance = await checkAllowance(env, await hashVisitor(clientIp(request)), 'chat');
  if (allowance === 'unavailable') return json({ error: SAFE_REPLIES.off }, 503);
  if (allowance !== 'ok') return json({ error: SAFE_REPLIES.limit }, 429);

  return streamAnswer(env, turns);
};
