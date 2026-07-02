---
description: Manual save-and-verify sweep — reconcile the docs with the actual code AND the current conversation, capture anything discussed-but-not-written (decisions, gotchas, rejected ideas), refresh staleness markers, and leave a handoff note. Run at save points or before starting a fresh conversation. For growing-docs projects.
model: sonnet
---

# Checkpoint

A deliberate doc-reconciliation sweep you invoke by hand. The per-change workflow in CLAUDE.md keeps docs in sync *if* the agent stays diligent across a long session — but attention drifts, and the drift is silent. `/checkpoint` is the manual catch-up: for this one pass, **syncing the docs is the only job**, so it gets full attention.

**When to run it:**
- A feature or chunk of work just landed.
- You're about to take a break.
- The conversation has gotten large and you want to **start a fresh one** — checkpoint first so the new session inherits everything through the docs. This is the deliberate, lossless alternative to waiting for auto-compaction: *you* decide what's captured and verify it, instead of letting an automatic summary decide.

This command reconciles docs but **never changes code**. If the repo has no `CLAUDE.md` / `docs/` (not a growing-docs project yet), tell the user to run `/project-adopt` first.

## Lint mode — `/checkpoint lint` (on-demand whole-tree consistency sweep)

If the invocation carries the argument `lint`, run THIS instead of the numbered steps below. Where a normal checkpoint reconciles what the diff and the conversation touched, lint mechanically walks the **whole doc tree** for consistency rot. Boundaries: template-*structure* drift is `/project-adopt` Upgrade's job; design *challenge* is `/rethink`'s — lint is consistency only.

**The checks:**
1. **Features table ↔ feature docs, both directions** — every `docs/feature-*.md` has a Features-table row (orphan docs); every row's Doc link resolves (dead rows).
2. **Dangling links** — doc-to-doc links in `CLAUDE.md` + `docs/` pointing at files or anchors that don't exist.
3. **Staleness outliers** — a `Last updated:` far behind recent git activity on that feature's files. **Flag these, don't refresh them** — bumping a marker without verifying the content is the unearned-verified-badge disease.
4. **Bounded contradiction pass** — where the same claim lives in more than one doc (README ↔ ARCHITECTURE ↔ feature docs: versions, counts, behavior descriptions), check they agree. Resolve via the precedence rule (code → feature doc → ARCHITECTURE/PLAN → README); ask the user only when genuinely ambiguous.

**Fix policy:** mechanical findings — a missing Features row, a dead link, a wrong count — **fix directly**. Judgment findings — a contradiction precedence can't settle, a doc describing intended behavior the code lost (don't paper over a bug), code diverging from a `Decided design` section (see step 2A's exception) — **surface to the user** instead.

**Report & persist:** append a lint entry to `docs/CHECKPOINTS.md` (`## <date> — <sha> — lint: N checked, M fixed, K surfaced`), then privacy-check + commit the fixes like a normal checkpoint (docs-only, project's convention). **Do NOT move the `Last checkpoint:` marker** — lint reconciles neither the diff nor the conversation, so moving it would falsely claim a full checkpoint happened.

## 1. Establish scope — what's happened since the last checkpoint
- Read `docs/PLAN.md`. If it has a `Last checkpoint: <sha>` line, **first confirm that SHA is still in the branch** (`git merge-base --is-ancestor <sha> HEAD`). If it is, scope = `git diff <sha>..HEAD` + uncommitted changes. If it is **not** an ancestor (history was rewritten / force-pushed since the last checkpoint, so the baseline is orphaned), or there's no marker at all, treat this as a first checkpoint and rebaseline: scope = recent history (`git log --oneline -20`) + the working tree.
- Run `git status` and `git diff` to see the actual code changes you'll be reconciling.

## 2. Reconcile docs against BOTH the code and the conversation

This is the core. There are two sources of truth-that-isn't-written-down:

**A. The code** (what changed since last checkpoint):
- For each area the diff touched, open the relevant `docs/feature-*.md` and read the **real current code**. Fix any drift — Files/Interface/Gotchas that no longer match, a "still not done" item that's now done, a brand-new feature with no doc (create it from `docs/_feature-template.md` and add a row to PLAN's Features table).
- **Code is the source of truth** — where a doc disagrees with the code, fix the doc.
- **Exception: a `Decided design` section is intent-of-record, not description.** If code has diverged from a decision recorded there, the divergence is a **question, never a silent sync** — ask the user: did the *design change* (append a dated revision, move the superseded choice into the rejected alternatives) or did the *build drift* from the decision (flag it)? Rewriting a recorded *why* to match drifted code destroys the one thing the section exists to preserve. Same spirit as "don't paper over a bug," extended from broken-looking code to decision-contradicting code.

**B. This conversation** (knowledge that only exists in the chat):
- Scan back over the conversation for things decided, discovered, or discarded that never made it into a doc:
  - **Decisions** made out loud → `docs/PLAN.md` Decisions log.
  - **Gotchas / non-obvious behavior** hit while working → the relevant `feature-*.md` Gotchas.
  - **Ideas considered and rejected** → `docs/PLAN.md` Rejected Ideas (with the *why*).
  - **Future-work ideas mentioned but not tracked** (an idea dump, "we should also…", "someday…") → a dated batch in `docs/BACKLOG.md` (create it on first use — see the stub below). Route by kind: future-work **ideas** go to the backlog; present **knowledge** (gotchas, architectural understanding) goes to the docs above — never cross them. Don't add Features-table rows for un-triaged ideas: **the Features table is canonical** — an idea only gets a row when it graduates (and then leaves the backlog).
  - **New conventions or anti-patterns** agreed → `docs/RULES.md`; new **domain terms** coined or clarified (a concept named, a naming collision resolved) → RULES' Glossary.
  - **User-visible changes** → `README.md`.

  `docs/BACKLOG.md` stub (first use; append new batches at the end, entries as bullets):
  ```
  # Backlog
  Un-triaged ideas in dated batches. The Features table in PLAN.md is canonical: an idea
  that graduates gets a Features row and is DELETED here; one rejected at triage goes to
  PLAN's Rejected Ideas (with the why) and is deleted here. Only undecided ideas live here.

  ## <YYYY-MM-DD> — <context of the dump>
  - <idea>
  ```
- This is the half a plain code-diff misses, and it's the most important for surviving compaction or a fresh start — once the conversation is gone, this knowledge is gone with it.

If along the way you trip over a lint-class issue **outside** the diff's scope — an orphan feature doc, a dead link, a contradiction between docs you didn't touch — don't chase it in this run: note it to the user in one line and point at `/checkpoint lint` for the full sweep.

## 3. Refresh staleness markers
Update the `Last updated:` line on every doc you touched (today's date + the current short commit SHA).

## 4. Write the session report AND the cold-start brief — two artifacts, one content

**A. The full session report → `docs/CHECKPOINTS.md`.** Create the file on first use (stub below), then add this checkpoint's entry **at the top, right under the header** — newest first. This is the **uncapped** home for the rich detail: what shipped and why, verification evidence (tests run, live checks), root causes found, known blind spots, recipes worth keeping. Don't trim it to fit anywhere — giving this content a home is the file's whole purpose. Entry format:

```
## <YYYY-MM-DD> — <short sha> — <one-line title>
<the full report>
```

File stub (first use):
```
# Checkpoint Log
Full session reports from `/checkpoint`, newest first. The cold-start brief lives in
PLAN.md's Current Focus; this file is the uncapped history behind it.
```

**B. The cold-start brief → the Current Focus section in `docs/PLAN.md`** (add the section if missing). A tight distillate — **~15–30 lines** — so a fresh session resumes *without re-reading everything*:
- **Just shipped:** the last milestone that landed.
- **In flight:** anything half-done a new session would need to know — or "nothing — clean stopping point."
- **Next:** the immediate next step.
- **Start here:** the 1–3 docs/files relevant to "Next" — so the next session reads *those*, not all of `docs/`.

Keep the brief a pointer, not a transcript — the report (A) already holds the detail. The **Start here** line is what keeps the next session token-efficient: it reads the named docs instead of crawling the whole `docs/` tree to figure out what's relevant.

**Legacy cleanup (offer, never silent).** If Current Focus is carrying accumulated history — `_(prior checkpoint …)_` blocks, or stacked old session reports — **offer once** to relocate them verbatim into `docs/CHECKPOINTS.md` as dated entries and slim Current Focus to the brief. Likewise, if an ad-hoc backlog section lives inside PLAN.md, offer to relocate it into `docs/BACKLOG.md` as dated batches. Content is relocated verbatim, never dropped — and only with the user's yes.

## 5. Commit — following the project's OWN convention

**Privacy check (before committing).** These docs are derived from the conversation, which can hold things that don't belong in a public repo. First check if the repo is public: `git remote -v` (no remote → local-only, skip this) and, if there's a GitHub remote and `gh` is available, `gh repo view --json visibility -q .visibility`. If it's public — or a remote exists and visibility is unknown — scan the docs you're about to commit for private / cross-project content: **other project names, internal URLs/hostnames, credentials, personal details**. **Scan the commit message you're about to write too** — evidence-rich messages leak project names just as easily as docs (genericize: "a downstream adopter", not the name). If you find any, **STOP and ask** (AskUserQuestion): (A) sanitize/genericize it, (B) keep these docs local-only (gitignore `/CLAUDE.md` + `/docs/`, root-anchored so product code/templates stay tracked), or (C) proceed as-is. Never silently commit private context to a public repo.

- Read CLAUDE.md's **Git Convention** / release section. If the project mandates a release path (e.g. a publish script, or an explicit "never hand-run git commit"), **follow it** — don't bypass it. Otherwise commit directly.
- **If the dev docs are gitignored / local-only** (some public repos keep their own docs untracked), the updates just stay on disk — there's nothing to commit for them; only commit *tracked* changes. Still update the marker in the local `docs/PLAN.md`.
- Message: `docs: checkpoint — sync docs with code + conversation ({one line of what drifted})`.
- Record the checkpoint point: update (or add) the `Last checkpoint:` line in `docs/PLAN.md` — **bare `<sha> (<date>)`, nothing more**. The detail lives in `docs/CHECKPOINTS.md`, not the marker.

## 6. Report
Tell the user:
- What was already in sync vs. what had drifted and got fixed.
- What you captured from the conversation that wasn't written down anywhere (including any backlog batch).
- The report itself: what you report in chat and the entry you just wrote to `docs/CHECKPOINTS.md` (Step 4A) are **one content, written once** — show that same content here, plus the new checkpoint SHA and the Current Focus brief (Step 4B).
- If they checkpointed in order to start fresh: confirm it's safe now — everything important is in the docs, so a new conversation will inherit the full picture.

## Notes
- **It's a tool, not a guarantee** — it only runs when invoked. The per-change workflow still carries the load between checkpoints.
- **Don't paper over a bug.** If reconciling reveals the *code* looks wrong (a doc describes intended behavior the code no longer has, and the code seems broken), surface it to the user — don't silently rewrite the doc to match a bug.
- **"Nothing drifted" is a good result** — say so plainly; a clean checkpoint is a useful signal, not a wasted run.
