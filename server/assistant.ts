// Shared helpers for the website assistant's Pages Functions.
import Anthropic from '@anthropic-ai/sdk';
import { rpc, RpcError, type AgreementEnv } from './agreements';
import { hasControlChars } from './input';
import { buildSystemPrompt } from '../src/assistantPrompt';

export const DEFAULT_MODEL = 'claude-opus-5-5';
export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_CHARS = 1000;
export const MAX_TOTAL_CHARS = 8000;

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** The visitor's conversation, checked. Returns null if it isn't a plausible chat (so nothing reaches the model). */
export function parseConversation(input: unknown): ChatTurn[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null;
  const turns: ChatTurn[] = [];
  let total = 0;
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null;
    const { role, content } = raw as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim();
    if (!text || text.length > MAX_MESSAGE_CHARS || hasControlChars(text)) return null;
    total += text.length;
    turns.push({ role, content: text });
  }
  if (total > MAX_TOTAL_CHARS || turns[0].role !== 'user' || turns[turns.length - 1].role !== 'user') return null;
  for (let i = 1; i < turns.length; i++) if (turns[i].role === turns[i - 1].role) return null;
  return turns;
}

export async function hashVisitor(ip: string | null): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`mv-assistant:${ip ?? 'unknown'}`));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

export type Allowance = 'ok' | 'ip_limit' | 'daily_limit' | 'unavailable';

/** Asks the database whether this visitor may send another message (and counts it). Fails closed: no database, no assistant. */
export async function checkAllowance(env: AgreementEnv, ipHash: string, kind: 'chat' | 'handoff', consume = true): Promise<Allowance> {
  try {
    const out = await rpc<string>(env, 'assistant_allow', { p_ip_hash: ipHash, p_kind: kind, p_consume: consume });
    return out === 'ok' || out === 'ip_limit' || out === 'daily_limit' ? out : 'unavailable';
  } catch (err) {
    if (err instanceof RpcError) return 'unavailable';
    return 'unavailable';
  }
}

export const isEnabled = (env: AgreementEnv): boolean => !!env.ANTHROPIC_API_KEY && env.ASSISTANT_ENABLED !== 'false';

export const SAFE_REPLIES = {
  busy: 'I’m having trouble answering right now. Please press “Talk to a founder” and we’ll get back to you, or email admin.team@motion-visual.com.',
  limit: 'You’ve sent a lot of messages in a short time. Please press “Talk to a founder” or email admin.team@motion-visual.com and we’ll help directly.',
  declined: 'I can’t help with that one. Please press “Talk to a founder” and a member of the team will.',
  off: 'The assistant isn’t available right now. Please press “Talk to a founder” or email admin.team@motion-visual.com.',
} as const;

const line = (o: object) => JSON.stringify(o) + '\n';

/** Streams Claude's answer to the browser as newline-delimited JSON: {"t":"text","v":"…"} … then {"t":"done"} or {"t":"error","v":"…"}. */
export function streamAnswer(env: AgreementEnv, turns: ChatTurn[]): Response {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, baseURL: env.ANTHROPIC_BASE_URL_OVERRIDE, maxRetries: 1, timeout: 45_000 });
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (o: object) => controller.enqueue(encoder.encode(line(o)));
      try {
        const stream = client.messages.stream({
          model: env.ASSISTANT_MODEL?.trim() || DEFAULT_MODEL,
          max_tokens: 700,
          // A fixed prefix every time (instructions + site facts), so it can be cached and costs less on busy days.
          system: [{ type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } }],
          // Short chat answers: low effort keeps replies fast and cheap. Thinking is left at the model's default.
          output_config: { effort: 'low' },
          messages: turns,
        });
        stream.on('text', delta => send({ t: 'text', v: delta }));
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal') send({ t: 'text', v: SAFE_REPLIES.declined });
        send({ t: 'done' });
      } catch (err) {
        // Never show the visitor an API error; log the type (not the conversation) for the team.
        console.error('assistant error', err instanceof Anthropic.APIError ? `${err.status} ${err.name}` : (err as Error)?.name);
        send({ t: 'error', v: SAFE_REPLIES.busy });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
