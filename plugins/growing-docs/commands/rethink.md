---
description: Challenge the project's architecture and vision against its documented intent and propose better implementations — read-and-propose, never auto-refactor. Re-examines rejected ideas as Chesterton's fences. Run when a new model drops or at a milestone. For growing-docs projects.
---

# Rethink

The divergent, generative counterpart to `/forge`. Where forge *converges* a chosen idea into a decided design, **rethink *diverges*: it takes a fresh, critical look at the whole project (or a targeted area) and proposes ways to build it better** — reasoning from the *documented intent*, not just the code. Its best moment is right after a new, sharper model lands: point it at the project and let it see what the previous model couldn't.

**Read-and-propose, never auto-refactor.** Rethink writes a proposal document and discusses it with you. Accepted proposals graduate into PLAN and hand off to `/forge`; nothing changes in the code until you say so.

If the repo has no `CLAUDE.md` / `docs/` (not a growing-docs project), tell the user to run `/project-adopt` or `/project-init` first.

## Phase 1 — Scope & mode

1. **Resolve scope:**
   - bare `/rethink` → the **whole project** (the "fresh eyes on everything" sweep).
   - `/rethink <area-or-feature>` → focus on one part.
2. **Ask the mode** (nudge by scope):
   - **Focused** — a small, impact-ranked cap (~3 for a targeted run, ~5–7 for a whole-project sweep).
   - **Full** — no hard cap; surface everything genuinely interesting. Best for a whole-project / new-model run.
   - Both modes keep the same structure (below). "No cap" lifts the *count*, never the *quality bar*.

## Phase 2 — Understand intent, then reality

Read the **documented intent** first, then the **code**, and hunt for the gap between them:

- **Intent (the docs):** PLAN's Vision, Features table, Decisions log, **Rejected Ideas**; the per-feature docs (their *goals* and gotchas); RULES and ARCHITECTURE.
- **Reality (the code):** how each feature is actually implemented.
- **The opportunity** is where the implementation under-serves the documented goal, where a feature's intent could be met a better way, or where the architecture/vision itself deserves a challenge.

**Honor the negative space** before proposing anything:
- A documented **gotcha is a constraint with a reason** — understand it before proposing around it.
- A **rejected idea is a Chesterton's fence**: don't blindly avoid it *or* blindly re-propose it. Ask whether the original *why* still holds — especially under a new model or new capability — and if it no longer does, that re-opening is itself one of the most valuable proposals you can make.

## Phase 3 — Propose

Produce the proposals. Each one is:
- **tagged by altitude** — implementation / feature-design / architecture-vision,
- **tagged by confidence** — high-confidence win vs speculative bet,
- **ranked by impact**, and
- **citing the documented intent it serves** ("better fulfils feature X's stated goal of …"). A proposal that can't tie itself to a documented goal is noise — cut it.

Guard against over-eagerness: **don't import generic best-practices that ignore the project's deliberate choices** — the docs exist precisely to record those deviations. Approach undocumented "improvements" with humility.

Write them to `docs/proposals/<YYYY-MM-DD>-rethink.md` (create `docs/proposals/` if absent). Then **present the tiered list and discuss** — this is a conversation, not a verdict.

## Phase 4 — Triage, graduate & persist

After the user triages:
- **Accepted** → add to PLAN (a Features row + a Decisions entry), and **offer to `/forge`** each into a decided design. Forge → build is the path to actually shipping it.
- **Rejected** → log to PLAN's **Rejected Ideas** with the reason, so a future `/rethink` re-examines it as a fence instead of re-proposing it blindly.
- The dated proposal file **stays as the full record** — including the not-pursued proposals (preserved negative space).
- **Privacy guard** (same as `/checkpoint` / `/project-adopt`): on a public repo, scan the chat-sourced docs for private / cross-project content before committing.
- **Commit the docs-only output** following the project's git convention. **Never commit code** (rethink writes none). Push only if a remote is configured.

## Notes

- **Rethink proposes; forge decides; the build ships.** Keep the three separate — rethink's value is the *divergent* fresh look, and coupling it to execution would pressure it toward safe, shallow suggestions.
- **The docs are what make it more than `/refactor`.** A generic refactor reasons from code alone; rethink reasons from the written *intent*, which is how it can challenge whether the implementation still serves the goal — and why it must respect the rejected ideas and gotchas it reads.
- **It's deliberate.** No proactive trigger — run it when a new model drops or at a real milestone.
