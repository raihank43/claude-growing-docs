---
description: Manual save-and-verify sweep — reconcile the docs with the actual code AND the current conversation, capture anything discussed-but-not-written (decisions, gotchas, rejected ideas), refresh staleness markers, and leave a handoff note. Run at save points or before starting a fresh conversation. For growing-docs projects.
---

# Checkpoint

A deliberate doc-reconciliation sweep you invoke by hand. The per-change workflow in CLAUDE.md keeps docs in sync *if* the agent stays diligent across a long session — but attention drifts, and the drift is silent. `/checkpoint` is the manual catch-up: for this one pass, **syncing the docs is the only job**, so it gets full attention.

**When to run it:**
- A feature or chunk of work just landed.
- You're about to take a break.
- The conversation has gotten large and you want to **start a fresh one** — checkpoint first so the new session inherits everything through the docs. This is the deliberate, lossless alternative to waiting for auto-compaction: *you* decide what's captured and verify it, instead of letting an automatic summary decide.

This command reconciles docs but **never changes code**. If the repo has no `CLAUDE.md` / `docs/` (not a growing-docs project yet), tell the user to run `/project-adopt` first.

## 1. Establish scope — what's happened since the last checkpoint
- Read `docs/PLAN.md`. If it has a `Last checkpoint: <sha>` line, **first confirm that SHA is still in the branch** (`git merge-base --is-ancestor <sha> HEAD`). If it is, scope = `git diff <sha>..HEAD` + uncommitted changes. If it is **not** an ancestor (history was rewritten / force-pushed since the last checkpoint, so the baseline is orphaned), or there's no marker at all, treat this as a first checkpoint and rebaseline: scope = recent history (`git log --oneline -20`) + the working tree.
- Run `git status` and `git diff` to see the actual code changes you'll be reconciling.

## 2. Reconcile docs against BOTH the code and the conversation

This is the core. There are two sources of truth-that-isn't-written-down:

**A. The code** (what changed since last checkpoint):
- For each area the diff touched, open the relevant `docs/feature-*.md` and read the **real current code**. Fix any drift — Files/Interface/Gotchas that no longer match, a "still not done" item that's now done, a brand-new feature with no doc (create it from `docs/_feature-template.md` and add a row to PLAN's Features table).
- **Code is the source of truth** — where a doc disagrees with the code, fix the doc.

**B. This conversation** (knowledge that only exists in the chat):
- Scan back over the conversation for things decided, discovered, or discarded that never made it into a doc:
  - **Decisions** made out loud → `docs/PLAN.md` Decisions log.
  - **Gotchas / non-obvious behavior** hit while working → the relevant `feature-*.md` Gotchas.
  - **Ideas considered and rejected** → `docs/PLAN.md` Rejected Ideas (with the *why*).
  - **New conventions or anti-patterns** agreed → `docs/RULES.md`.
  - **User-visible changes** → `README.md`.
- This is the half a plain code-diff misses, and it's the most important for surviving compaction or a fresh start — once the conversation is gone, this knowledge is gone with it.

## 3. Refresh staleness markers
Update the `Last updated:` line on every doc you touched (today's date + the current short commit SHA).

## 4. Write the handoff note
Update the **Current Focus** section in `docs/PLAN.md` (add it if missing) so a fresh session can resume without the old conversation:
- **In progress:** what's mid-flight right now, plus any state a new session would need to know.
- **Next:** the immediate next steps.

Keep it short — it's a pointer for resuming, not a transcript.

## 5. Commit — following the project's OWN convention

**Privacy check (before committing).** These docs are derived from the conversation, which can hold things that don't belong in a public repo. First check if the repo is public: `git remote -v` (no remote → local-only, skip this) and, if there's a GitHub remote and `gh` is available, `gh repo view --json visibility -q .visibility`. If it's public — or a remote exists and visibility is unknown — scan the docs you're about to commit for private / cross-project content: **other project names, internal URLs/hostnames, credentials, personal details**. If you find any, **STOP and ask** (AskUserQuestion): (A) sanitize/genericize it, (B) keep these docs local-only (gitignore `/CLAUDE.md` + `/docs/`, root-anchored so product code/templates stay tracked), or (C) proceed as-is. Never silently commit private context to a public repo.

- Read CLAUDE.md's **Git Convention** / release section. If the project mandates a release path (e.g. a publish script, or an explicit "never hand-run git commit"), **follow it** — don't bypass it. Otherwise commit directly.
- **If the dev docs are gitignored / local-only** (some public repos keep their own docs untracked), the updates just stay on disk — there's nothing to commit for them; only commit *tracked* changes. Still update the marker in the local `docs/PLAN.md`.
- Message: `docs: checkpoint — sync docs with code + conversation ({one line of what drifted})`.
- Record the checkpoint point: update (or add) the `Last checkpoint: <sha>` line in `docs/PLAN.md` to the HEAD you reconciled to.

## 6. Report
Concisely tell the user:
- What was already in sync vs. what had drifted and got fixed.
- What you captured from the conversation that wasn't written down anywhere.
- The new checkpoint SHA and the Current Focus handoff.
- If they checkpointed in order to start fresh: confirm it's safe now — everything important is in the docs, so a new conversation will inherit the full picture.

## Notes
- **It's a tool, not a guarantee** — it only runs when invoked. The per-change workflow still carries the load between checkpoints.
- **Don't paper over a bug.** If reconciling reveals the *code* looks wrong (a doc describes intended behavior the code no longer has, and the code seems broken), surface it to the user — don't silently rewrite the doc to match a bug.
- **"Nothing drifted" is a good result** — say so plainly; a clean checkpoint is a useful signal, not a wasted run.
