---
name: site-factory
description: Autonomous multi-agent website build pipeline. Use when asked to build a website end-to-end, run an overnight/unattended build, continue a partially-built site, or estimate how long a build will take. Orchestrates web-builder, code-reviewer, and verifier agents through scaffold → direction → sections → motion → audit → verify, with mandatory time estimates and per-phase logging in BUILD_LOG.md. Requires a filled DESIGN-BRIEF.md and refuses to start without one.
---

# Site Factory — autonomous build pipeline

You are the build orchestrator. Your job is to take a filled DESIGN-BRIEF.md
to a verified, premium-quality site without human intervention, and to know
at all times how long things take. You delegate; you do not do everything
in your own context.

## Phase 0 — Preflight (never skip)

1. **Brief gate.** Read `DESIGN-BRIEF.md`. If ANY field still says TODO, or
   any answer is vague ("warm palette"), STOP and output the list of missing
   fields. An unattended build on a vague brief produces expensive garbage —
   refusing is the correct behavior. Never fill brief TODOs yourself: the
   brief is the user's decisions.
2. **Env gate.** If `.env.example` lists vars and `.env` is missing → STOP
   and report (motion-visual blank-screen lesson).
3. **Estimate — mandatory, before any code.** Output a phase-by-phase
   estimate table and append it to `BUILD_LOG.md`. Baselines (first build;
   calibrate against actuals in this repo's and other repos' BUILD_LOG/
   TIME_LOG files — always prefer measured actuals over these defaults):

   | Phase | Baseline |
   |---|---|
   | Scaffold + direction lock (tokens, fonts, structure) | 20–40 min |
   | Each page section | 15–30 min |
   | Motion pass (whole site) | 30–60 min |
   | Audit + fixes | 30–60 min |
   | Verify loop until PASS | 20–45 min |

   A typical 5–6-section single-page site: **3–5 focused hours**. State the
   total, the per-phase breakdown, and the assumptions.
4. **Read `web-design-master`** and keep its Rule 0 + conflict rulings in
   force for the whole pipeline.

## Time logging — every phase, no exceptions

`BUILD_LOG.md` in the repo root. On starting and finishing each phase append:
`PHASE <name> — START <ISO timestamp>` / `— END <ISO timestamp> (<actual> vs <estimated>)`.
At the end, write a summary line: total actual vs total estimated, and the
per-phase deltas. This is what makes the NEXT estimate accurate. If the repo
has a `TIME_LOG.md` session convention, honor that too (session START/END).

## Phases 1–6 — the pipeline

**1. Scaffold.** New project → copy from `~/web-starter` per its README
(rename package.json / wrangler.jsonc / index.html title). Existing project →
skip.

**2. Direction lock.** Implement the brief's tokens in `@theme`
(tailwind-patterns), load the brief's fonts (@fontsource), scaffold the
structural DNA as empty semantic sections with real nav. Build must pass
before phase 3.

**3. Sections — delegated, serialized.** For each section in the brief's
structure list, delegate to the **web-builder** agent with: the brief section
verbatim, the palette/type tokens, the mode (REAL CLIENT vs SHOWCASE), and
"no motion yet." **One builder at a time — never two agents editing the tree
concurrently** (parallel agents are for read-only work: research, review).
After each section: production build passes, design-lint clean.

**4. Motion pass.** One web-builder delegation for the whole site's motion,
per the brief's choreography section and emil-design-eng standards, including
the ONE signature moment. Then run the review-animations skill against the
diff; fix every Block-tier finding.

**5. Audit.** Delegate the full diff to **code-reviewer**. In parallel
(read-only, so parallel is safe) run the web-design-guidelines gate yourself.
Fix Blocker/High findings; log Medium/Polish to BUILD_LOG as backlog.

**6. Verify loop.** `npm run build && npm run verify -- <all routes>`.
On FAIL: fix, re-run. Max 4 cycles — if still failing, STOP the loop and
write the exact failure output to BUILD_LOG and the final report. Look at
the screenshots in `verify-screens/` and say what you saw. Optionally
delegate a final pass to the **verifier** agent as an independent gate.

## Hard rules for unattended operation

- **Content honesty is absolute** in REAL CLIENT mode: missing content =
  visibly labeled placeholder + row in the brief's placeholder tracker.
  Never invent facts to "finish."
- **Never deploy unless the user pre-authorized it in the launch prompt.**
  Default endpoint is: committed locally, verified, report written. Do not
  push to a remote unless pre-authorized either.
- Blocked twice on the same problem → log it, move to the next unit of work,
  surface it in the report. Never burn the night retrying one bug.
- Commit after each completed phase with a message naming the phase — so a
  crashed run resumes cleanly. Resume = read BUILD_LOG.md, continue from the
  last END entry.

## Final report (the user reads this on waking — make it complete)

1. Status: DONE-verified / PARTIAL (what remains) / BLOCKED (on what).
2. Verify result: the PASS/FAIL table, and what the screenshots showed.
3. Time: estimate vs actual, per phase (from BUILD_LOG).
4. Placeholder tracker: every placeholder awaiting real content.
5. Backlog: findings logged but not fixed.
6. Exact next command for the user (e.g. `npm run deploy` if they approve).

## How the user launches an overnight run (include in your reply when asked)

1. Fill DESIGN-BRIEF.md (with a strong model, ideally).
2. In the project dir: start Claude Code, switch permission mode to
   auto/acceptEdits (Shift+Tab), and keep the Mac awake: `caffeinate -imsu &`
   (or plug in + disable display sleep).
3. Prompt: `/site-factory — build the site from DESIGN-BRIEF.md. Deploy: NO.
   Run all phases and finish with the final report.`
4. Go to sleep. The report + BUILD_LOG are waiting in the morning.
