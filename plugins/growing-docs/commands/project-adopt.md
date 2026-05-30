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
- **Already adopted?** This is the key branch. The repo is **already adopted** if it has a `CLAUDE.md` containing our workflow (look for a "Project Artifacts Index" section or the Step/Workflow structure) AND/OR a `docs/` folder with `PLAN.md` + `RULES.md` in our format.
  - **If already adopted → go to the Upgrade Mode section below.** Skip Phases 2-5.
  - **If not adopted → continue to Phase 2** (fresh adoption).
- **Existing docs** (for fresh adoption): `README.md`, `/docs`, `CONTRIBUTING.md`, wikis, ADRs.
- **Rough size**: file/dir count, to gauge how expensive a deep scan would be.

Report a one-paragraph summary of what you found, and state which case you detected, before continuing.

---

# UPGRADE MODE (repo is already adopted)

Goal: bring the existing docs up to the latest templates **without losing any project-specific content**. The user's filled-in knowledge is sacred; only the *structure/boilerplate* gets refreshed.

## U1: Diff against the latest templates
Read the project's `CLAUDE.md` and the scaffold's `CLAUDE.md`. Identify which current-template sections/rules are missing or outdated in the project's version. Common drift to check for:
- `Project Phase` marker awareness in Step 1 (and the marker itself at the top of `docs/PLAN.md`)
- "EVERY user request" framing + the explicit **decide-checklist** in Step 3 (old versions used weaker "Before/After Any Task" wording)
- **Verify-before-commit** step
- **Conditional push** + **never-commit-secrets** rules
- **"Code is the source of truth"** doc-rot rule
- **PLAN-table-as-index** instruction in Step 1
- Feature template as the `docs/_feature-template.md` file (old versions embedded it inline)

## U2: Upgrade CLAUDE.md (regenerate structure, preserve specifics)
Rebuild `CLAUDE.md` from the scaffold template, then **re-inject the project-specific bits** from the old version:
- The project title (`# {Project Name}`)
- Project-specific git **scopes and commit examples** (e.g. this project's `api`/`download`/`cli` scopes)
- The `Remote:` line value
- Any bespoke sections the user added that aren't in the template — keep them; never drop user-authored content.

## U3: Patch the docs (additive only — never overwrite filled content)
- `docs/PLAN.md`: if the **Project Phase** marker is missing, add it at the top. Set it to `BUILDING` for an active project (only `BRAINSTORMING` if the project is clearly still pre-build). Do NOT touch the Vision/Features/Decisions content.
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
- **`CLAUDE.md`** — if one already exists, **merge**: keep their project-specific instructions, add our workflow/artifact-index sections. Otherwise copy the template.
- **`.gitignore`** — if one exists, append any missing secret patterns (`.env`, `.env.*`, credentials, keys); don't overwrite. If none, create one for the stack.

Fill `{Project Name}` / `{project-name}` / `{One-line description}` placeholders from what you detected. **Set the `Project Phase` marker in PLAN.md to `BUILDING`** — this is an existing, working project, not one being brainstormed from scratch.

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

## Phase 5: Git & Wrap-Up

1. If already a git repo: just stage the new docs and commit `docs: adopt AI documentation system ({depth} scan)`. Never re-init or rewrite history.
2. If not a git repo: ask whether to `git init` (offer it; some existing folders aren't yet under git).
3. Ensure secrets are gitignored before staging.
4. Push only if a remote is configured.

Then tell the user the system is live:

> Documentation system adopted ({depth} scan). `CLAUDE.md` now drives the workflow, and `docs/` holds the project knowledge. From here on, every change I make follows the doc-update checklist — new features get their own doc, conventions land in RULES.md, and PLAN.md tracks status. The docs will grow with the codebase automatically.

## Important Notes

- **Never clobber the user's existing files.** README, CLAUDE.md, .gitignore — merge or preserve, never blind-overwrite.
- **Respect the token budget.** The whole point of the tiers is cost control. Don't escalate to a deeper scan than the user picked.
- **Existing project = `BUILDING` phase**, not brainstorming. Don't run the pitch/brainstorm flow unless the user explicitly wants to plan a new direction.
- **Gotchas first.** When scanning code, the most valuable thing to capture is what's surprising or fragile — that's what saves future-you after compaction.
