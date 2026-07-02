---
description: Retrofit OR upgrade the AI-optimized documentation system on an EXISTING codebase. For un-adopted repos, adds CLAUDE.md + docs/ and scans the code at a depth you choose. For already-adopted repos, upgrades the docs to the latest templates without losing your content. For brand-new projects, use /project-init instead.
---

# Project Adopt

You are bringing the documentation system to an **existing codebase**. This command handles two cases:

- **Adopt** — the repo has no doc system yet. You **extract** understanding from existing code and scaffold the docs.
- **Upgrade** — the repo was already adopted (via `/project-init` or `/project-adopt`) but its docs predate the current templates. You **refresh** the structure to the latest templates without destroying filled-in content.

Phase 1 detects which case you're in. Run this **from inside the repo root** — the CWD matches the project, so CLAUDE.md loads normally and there's no directory-transition problem.

> Templates (the source of truth for "latest") live at `${CLAUDE_PLUGIN_ROOT}/project-scaffold/`. Copy/diff from there. Don't hand-write docs from memory.
>
> `${CLAUDE_PLUGIN_ROOT}` is this plugin's install directory. If that literal path isn't already resolved, read the env var first (`$env:CLAUDE_PLUGIN_ROOT` on Windows PowerShell, `$CLAUDE_PLUGIN_ROOT` on macOS/Linux) to get the absolute path before copying/diffing.

## Phase 1: Survey the Repo (cheap, always do this)

Quickly detect, without reading everything:
- **Stack**: look for `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `composer.json`, etc.
- **Git**: is this already a git repo? (`git status`) Never re-init or clobber existing history.
- **Already adopted?** This is the key branch. The surest sign is the `<!-- growing-docs template vX.Y.Z -->` stamp comment at the top of `CLAUDE.md` — but projects adopted before v1.8.0 predate the stamp, so its *absence* proves nothing. Without a stamp, the repo is **already adopted** if it has a `CLAUDE.md` containing our workflow (look for a "Project Artifacts Index" section or the Step/Workflow structure) AND/OR a `docs/` folder with `PLAN.md` + `RULES.md` in our format.
  - **If already adopted → go to the Upgrade Mode section below.** Skip Phases 2-5.
  - **If not adopted → continue to Phase 2** (fresh adoption).
- **Existing docs** (for fresh adoption): `README.md`, `/docs`, `CONTRIBUTING.md`, wikis, ADRs.
- **Rough size**: file/dir count, to gauge how expensive a deep scan would be.

Report a one-paragraph summary of what you found, and state which case you detected, before continuing.

---

# UPGRADE MODE (repo is already adopted)

Goal: bring the existing docs up to the latest templates **without losing any project-specific content**. The user's filled-in knowledge is sacred; only the *structure/boilerplate* gets refreshed.

## U1: Diff against the latest templates

**Check the version stamp first.** Read the `<!-- growing-docs template vX.Y.Z -->` comment at the top of the project's `CLAUDE.md` and compare it to the current plugin version (the `version` field of `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`). If they **match**, the docs are already on the latest templates — report that and stop; there is nothing to upgrade. If the stamp is **older or missing** (pre-v1.8.0 adoptions have none), continue below.

**Then compute the drift LIVE — never from memory.** The shipped scaffold at `${CLAUDE_PLUGIN_ROOT}/project-scaffold/` **is** the definition of "latest." Do not work from a remembered list of template features — any such list (including one written into this command) goes stale as the templates evolve. Walk the scaffold against the project, section by section:
- **`project-scaffold/CLAUDE.md` vs the project's `CLAUDE.md`:** for every template-owned section and rule (the workflow steps and their wording, the read-only carve-out, When Adding a New Feature / offer-to-forge, Checkpoints, Complex Decisions, the git rules, the artifacts-index rows — whatever the *current* scaffold actually contains), check it's present and hasn't fallen behind the current wording. **Bespoke, user-authored sections are NOT drift** — leave them untouched.
- **`project-scaffold/docs/*` vs the project's `docs/`:** missing files (e.g. `_feature-template.md`) and missing template scaffolding *inside* existing docs (PLAN's Phase marker, the Current Focus brief shape, the Features-table canonicity line, table intro conventions).

Classic examples of drift this catches (illustrative — the scaffold walk above is the real checklist): a pre-v1.8 CLAUDE.md with no version stamp; a feature template still embedded inline instead of `docs/_feature-template.md`; a Current Focus without Start-here pointers.

## U2: Upgrade CLAUDE.md (regenerate structure, preserve specifics)
Rebuild `CLAUDE.md` from the scaffold template, then **re-inject the project-specific bits** from the old version:
- Fill `{growing-docs-version}` in the stamp comment with the current plugin version (from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`) — the refreshed stamp is what marks the upgrade as done.
- The project title (`# {Project Name}`)
- Project-specific git **scopes and commit examples** (e.g. this project's `api`/`download`/`cli` scopes)
- The `Remote:` line value
- Any bespoke sections the user added that aren't in the template — keep them; never drop user-authored content.

If the project's CLAUDE.md has itself grown **fat** (deep knowledge inline that now duplicates `docs/`), offer the same consolidation choice described in **Phase 4.5** — (A) merge / (B) consolidate, B recommended — using the same move → verify → remove safety.

## U3: Patch the docs (additive only — never overwrite filled content)
- `docs/PLAN.md`: if the **Project Phase** marker is missing, add it at the top. Set it to `BUILDING` for an active project (only `BRAINSTORMING` if the project is clearly still pre-build). Do NOT touch the Vision/Features/Decisions content.
- **Current Focus / backlog hygiene (offer, never silent):** two legacy patterns the older templates allowed to accumulate inside PLAN.md — if you find either, **ask** before touching it (content is relocated verbatim, never dropped; skip on "no"):
  - Accumulated checkpoint history in Current Focus (`_(prior checkpoint …)_` blocks or stacked session reports) → offer to relocate into `docs/CHECKPOINTS.md` (newest first, dated `## <date> — <sha> — <title>` entries; create with its stub — see `/checkpoint`) and slim Current Focus to the brief format (Just shipped / In flight / Next / Start here).
  - An ad-hoc backlog section living inside PLAN.md → offer to relocate into `docs/BACKLOG.md` (dated batches; the Features table stays canonical).
- `docs/_feature-template.md`: add it if missing (copy from scaffold).
- `docs/RULES.md`, `docs/ARCHITECTURE.md`, `README.md`, existing `feature-*.md`: leave content alone. Only add a missing *section heading* if a template section is entirely absent and clearly useful — and leave it as `{To be filled}`.
- `.gitignore`: append any missing secret patterns; never overwrite.

## U4: Commit & report
- Stage the changes and commit: `docs: refresh AI doc system to latest templates`.
- Push only if a remote is configured.
- Report a concise diff summary: what was upgraded, what was preserved. Example: "Upgraded CLAUDE.md (added verify step, conditional push, code-is-truth rule, phase-marker awareness); added docs/_feature-template.md and the BUILDING phase marker to PLAN.md; preserved all feature docs, README, and your git scopes untouched."

**Then stop.** Upgrade Mode does not re-scan the codebase or re-run brainstorming.

---

# FRESH ADOPTION (repo is not yet adopted)

## Phase 2: Ask How Deep to Scan

Cost scales with repo size, so let the user choose. Use AskUserQuestion with these three options (recommend based on the size you just measured — Barebones for large repos, Full scan for small/medium):

| Mode | What it does | Cost |
|------|-------------|------|
| **Barebones** | Scaffold the docs, auto-fill ARCHITECTURE (stack + real folder tree) and the README's tech section. Document only *from here forward*. | Cheap |
| **Map existing docs** | Everything in Barebones, plus ingest the repo's existing README/docs/wiki and restructure that content into our format. Reads docs, not all code. | Low |
| **Full scan** | Everything above, plus walk the codebase, infer architecture, and backfill a feature doc per major area, with the PLAN features table pre-populated as `done`. | High (token-heavy) |

Default to **Barebones** if unsure. Never silently crawl a large repo.

## Phase 3: Scaffold From the Shared Templates (without clobbering existing files)

Copy from `${CLAUDE_PLUGIN_ROOT}/project-scaffold/`, but **preserve what already exists**:

- **`docs/PLAN.md`, `docs/RULES.md`, `docs/_feature-template.md`** — copy in (these rarely pre-exist).
- **`docs/ARCHITECTURE.md`** — copy in; you'll fill it in Phase 4.
- **`README.md`** — if one already exists, **do NOT overwrite it.** Keep theirs. In "Map existing docs" / "Full scan" modes you'll fold its content into our structure and refine it; in Barebones, leave it alone except for a Tech Stack section if missing. Only drop in the template README if there is no README at all.
- **`CLAUDE.md`** — if one already exists, **don't overwrite it yet.** A *lean* existing CLAUDE.md (basically just a short workflow) can be merged with our workflow/artifact-index now. But if it's a **fat, knowledge-heavy CLAUDE.md** (architecture, gotchas, data shapes, procedures inline), leave it untouched for now — **Phase 4.5** decides how to handle it *after* the scan has extracted that knowledge into `docs/`. If there's no CLAUDE.md at all, copy the template.
- **`.gitignore`** — if one exists, append any missing secret patterns (`.env`, `.env.*`, credentials, keys); don't overwrite. If none, create one for the stack.

Fill `{Project Name}` / `{project-name}` / `{One-line description}` placeholders from what you detected, and `{growing-docs-version}` from the `version` field of `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`. If you merged the workflow into an *existing* CLAUDE.md instead of copying the template, still add the stamp comment line at the top — it's how a future `/project-adopt` detects adoption and upgrades precisely. **Set the `Project Phase` marker in PLAN.md to `BUILDING`** — this is an existing, working project, not one being brainstormed from scratch.

## Phase 4: Backfill Docs According to Chosen Depth

### Barebones
- `ARCHITECTURE.md`: fill the Tech Stack table and the real Folder Structure tree (from the actual repo). Leave System Overview / Data Flow / Key Patterns as `{To be filled}` — they'll grow as you touch areas.
- `PLAN.md`: leave the Features table mostly empty; add features only as they're built or modified from here on.
- Do not scan code beyond what's needed to detect the stack and tree.

### Map existing docs
- Everything in Barebones.
- Read the existing README/docs/wiki/ADRs. Restructure their content into our format: vision/overview → PLAN Vision + README About; any documented conventions → RULES; any documented architecture → ARCHITECTURE; any documented decisions → PLAN Decisions Log.
- Where existing docs list features, seed the PLAN Features table (status `done` for shipped ones).

### Full scan
- Everything above.
- **Use subagents to stay cheap.** Dispatch `Explore`/`general-purpose` subagents to map distinct areas of the codebase **in parallel**, each returning only a concise summary (purpose, key files, data flow, gotchas) — do NOT read the whole codebase into the main context.
- Synthesize those summaries into:
  - `ARCHITECTURE.md`: System Overview, Data Flow, Key Patterns.
  - One `docs/feature-{name}.md` per major area (copy `_feature-template.md`), capturing what you learned — especially **Gotchas**.
  - `PLAN.md` Features table: a row per documented feature, status `done`, linked to its doc.
- Prioritize **gotchas and non-obvious behavior** — that's the highest-value thing to capture from existing code, since it's what's most painful to rediscover later.

In all modes, when something is uncertain, mark it `{To be confirmed}` rather than guessing. **Code is the source of truth** — if you later find a doc contradicts the code, fix the doc.

## Phase 4.5: Consolidate an Existing Fat CLAUDE.md

Runs only in **Map existing docs** / **Full scan** modes, and only when the repo already had a substantial CLAUDE.md — roughly >80 lines, or one carrying sections that now overlap what you just extracted into `docs/` (architecture, gotchas, data shapes, per-feature detail, a procedural workflow).

**The trap:** the additive-merge instinct ("never clobber") leaves that knowledge **inline in CLAUDE.md AND duplicated in `docs/`**, plus two competing workflow sections — the exact bloated all-in-one CLAUDE.md this system exists to cure. CLAUDE.md should be the lean **system prompt**: a short summary + ONE workflow + the artifact index/map, short enough to re-read fully after compaction. Deep knowledge belongs in `docs/`.

So **pause and ask the user** (AskUserQuestion). Present both options every time — the user keeps the choice — but mark B **(Recommended)** when the file is fat:

- **(A) Conservative merge** — keep all of CLAUDE.md's content, just add the growing-docs workflow + artifact index. Zero risk of loss, but knowledge stays duplicated between CLAUDE.md and `docs/`.
- **(B) Consolidate (Recommended for a fat CLAUDE.md)** — slim CLAUDE.md to **the scaffold template's shape**: every template-owned section (workflow, When-Adding-a-Feature, Checkpoints, Complex Decisions, git convention, artifact index — whatever `project-scaffold/CLAUDE.md` currently contains) carrying the project's own specifics, plus the user's bespoke sections. The deep knowledge moves out to `docs/`, where the scan already put it. Content is *relocated, not lost*.

If the existing CLAUDE.md is already lean, skip the question and just merge.

### If the user picks (B), consolidate safely:

1. **Move → verify → remove.** For each deep section you intend to cut (architecture, gotchas, data shapes, per-feature implementation, debugging), first confirm that content actually exists in the matching `docs/` file. If something in CLAUDE.md is **not** yet in `docs/`, move it there *first*, then remove it from CLAUDE.md. Never delete knowledge that has no home.
2. **Unify the workflows.** If CLAUDE.md had its own procedural workflow, merge it INTO the single growing-docs workflow — never leave two. Crucially, **absorb the project-specific procedure** (build/release commands, versioning rules, commit-message style, environment gotchas, pre-compaction sweeps). Those are gold and the generic template lacks them; they stay in CLAUDE.md (they're how-to-work, part of the system prompt) — just not duplicated.
3. **Verify against the shipped template, section by section.** The lean target is defined by `${CLAUDE_PLUGIN_ROOT}/project-scaffold/CLAUDE.md` — **not by a remembered summary of it**. Before finishing, walk the scaffold's sections and confirm each one survived the consolidation (with the project's specifics re-injected). A consolidation that drops a template-owned section isn't lean, it's lossy — this has happened (Complex Decisions and Checkpoints were silently dropped in a real adoption and had to be restored by hand). Result: the scaffold's sections + the project's bespoke ones; everything deep lives in `docs/`.
4. **Commit the consolidation as its own step** so it's trivially reversible, and report what moved where.

## Phase 5: Git & Wrap-Up

**Privacy check (before committing).** The docs you just generated are derived from the conversation + a code scan, which can surface things that don't belong in a public repo. Check if the repo is public: `git remote -v` (no remote → local-only, skip) and, if there's a GitHub remote and `gh` is available, `gh repo view --json visibility -q .visibility`. If it's public — or a remote exists and visibility is unknown — scan the docs about to be committed for private / cross-project content: **other project names, internal URLs/hostnames, credentials, personal details**. If you find any, **STOP and ask** (AskUserQuestion): (A) sanitize/genericize, (B) keep these docs local-only (gitignore `/CLAUDE.md` + `/docs/`, root-anchored so product/templates stay tracked), or (C) proceed as-is. Never silently commit private context to a public repo.

1. If already a git repo: just stage the new docs and commit `docs: adopt AI documentation system ({depth} scan)`. Never re-init or rewrite history.
2. If not a git repo: ask whether to `git init` (offer it; some existing folders aren't yet under git).
3. Ensure secrets are gitignored before staging.
4. Push only if a remote is configured.

Then tell the user the system is live:

> Documentation system adopted ({depth} scan). `CLAUDE.md` now drives the workflow, and `docs/` holds the project knowledge. From here on, every change I make follows the doc-update checklist — new features get their own doc, conventions land in RULES.md, and PLAN.md tracks status. The docs will grow with the codebase automatically.

## Important Notes

- **Never clobber the user's existing files.** README, CLAUDE.md, .gitignore — merge or preserve, never blind-overwrite. The one *sanctioned* exception is a consolidation the user explicitly chose in Phase 4.5 — and even then, only move → verify → remove (relocate knowledge into `docs/`, never delete it).
- **Respect the token budget.** The whole point of the tiers is cost control. Don't escalate to a deeper scan than the user picked.
- **Existing project = `BUILDING` phase**, not brainstorming. Don't run the pitch/brainstorm flow unless the user explicitly wants to plan a new direction.
- **Gotchas first.** When scanning code, the most valuable thing to capture is what's surprising or fragile — that's what saves future-you after compaction.
