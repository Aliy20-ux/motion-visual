# Website AI assistant

A chat button on motion-visual.com answers questions from prospective clients about packages, prices, process and care plans,
and hands anyone who wants a person to the team ("Talk to a founder").

## How it works

- **What it knows:** only `src/assistantKnowledge.ts`, which is built from the same files as the pricing section
  (`src/pricing.ts`, `src/commercial.ts`, `src/flagship.ts`, `src/process.ts`, `src/legal/company.ts`). Change a price there and the
  assistant changes with it. Its rules are in `src/assistantPrompt.ts`: it must not invent anything, must stay on topic, treats
  everything a visitor types as a question (never as instructions), and sends anything uncertain to a founder.
- **Where it runs:** `functions/api/assistant.ts` (streams Claude's answer) and `functions/api/assistant-handoff.ts`
  (emails the team the visitor's details and chat). The browser never sees the API key.
- **Switch:** no key, or `ASSISTANT_ENABLED=false`, or the usage limiter unreachable = the chat button does not appear and the
  chat code is never downloaded.
- **Nothing is stored** from the chat itself. If a visitor presses "Talk to a founder", their details and the conversation go to
  `admin.team@` by email and into the CRM as a "Website Chat" lead.

## One-time setup

1. Run `supabase/migrations/20261024190000_assistant_usage.sql` (also `sql/8-website-assistant-usage.sql` in the setup folder) in
   the Supabase SQL editor. It adds the usage limits: 30 messages an hour per visitor, 5 hand-offs an hour, 1,500 chat messages a
   day for the whole site. Visitors are stored as a one-way hash only.
2. In Cloudflare: Workers & Pages -> `motion-visual-git` -> Settings -> Variables and Secrets, add a **secret**
   `ANTHROPIC_API_KEY` (from console.anthropic.com). Redeploy (merging does it).
3. Optional settings (plain variables): `ASSISTANT_MODEL` (default `claude-opus-5-5`; `claude-haiku-5-5` is far cheaper) and
   `ASSISTANT_ENABLED` (`false` pauses it).

## Cost

Each question sends about 2,400 tokens of instructions and facts plus the chat so far, and gets a short answer. At the published
prices (checked 2026-10-06) that is roughly **1.3p per message on Claude Opus 5.5** and **well under 0.1p on Claude Haiku 5.5**.
The 1,500-a-day cap bounds the worst case at roughly £15 a day on Opus. Check usage in the Anthropic console.

## Not included

- No memory between visits, no logging of conversations, and no way for it to book or send anything itself.
- If the model ever declines a request it says so politely and offers a founder; there is no automatic retry on another model.
