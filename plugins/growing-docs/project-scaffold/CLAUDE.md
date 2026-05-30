# {Project Name}

## Workflow — Follow This For EVERY User Request

This workflow applies to EVERY request the user makes — a major feature, a one-line fix, a small addition, a refactor, a bug fix. There is no request too small to skip this sequence. The size of the change does not matter; what matters is that docs stay in sync with code.

### Step 1: Read Before You Work
1. Read this file fully
2. Open `/docs/PLAN.md` and check the **Project Phase** marker at the top FIRST:
   - If `BRAINSTORMING`, the roadmap isn't settled yet — help the user flesh out the vision and features before writing code. Don't jump straight into building.
   - If `BUILDING`, proceed normally.
3. Use PLAN.md's **Features table as your map**: find the feature you're about to touch and open the doc in its `Doc` column. The table is the index — don't go globbing blindly through `/docs/`.
4. Check `/docs/RULES.md` for conventions to follow

### Step 2: Do The Work
- Follow all conventions in `/docs/RULES.md`
- Follow the architecture patterns in `/docs/ARCHITECTURE.md`
- If you discover a gotcha, edge case, or non-obvious behavior — write it down immediately in the relevant feature doc before you forget
- **Code is the source of truth.** If a doc contradicts what the code actually does, the code wins — fix the doc as part of your change. Stale docs that lie are worse than no docs.

### Step 3: Update Documentation (BEFORE committing)
After the code change is done, go through this checklist and **decide** for each item whether it needs updating. Don't skip the decision — actively consider each one:

- [ ] **Feature doc** in `/docs/` — Create a new one if this is a new feature (even a small one). Update the existing one if you modified a feature. A "feature" is anything a user would notice or a developer would need to know about.
- [ ] **`/docs/PLAN.md`** — Did a feature's status change? Was something new added that should be tracked? Did we make a decision worth logging? Update the features table and/or decisions log.
- [ ] **`README.md`** — Would a human reading this project for the first time need to know about what just changed? If yes, update it. New features, changed behavior, new commands — these all belong in README.
- [ ] **`/docs/ARCHITECTURE.md`** — Did the system structure, data flow, or tech stack change?
- [ ] **`/docs/RULES.md`** — Did you establish a new convention, discover an anti-pattern, or learn something about how code should be written in this project?

Not every item needs updating every time. But you must **consider** every item every time. The decision to NOT update a doc should be conscious, not accidental.

### Step 4: Verify It Works
Before committing, confirm the change actually works — don't commit blind. Run the app or the relevant tests if they exist; if there's nothing runnable yet, at least sanity-check that what you wrote is coherent. Committing often is meant to capture a clean history of *working* states, not a log of broken ones.

### Step 5: Commit and Push
- **Never stage secrets** — `.env`, credentials, API keys, tokens. Confirm they're gitignored before staging.
- Stage all changes including doc updates
- Write a clear commit message (see Git section below)
- **Push only if a remote is configured.** If this is local-only git, commit locally and skip the push — don't error out pushing to a remote that doesn't exist.

### When Adding a New Feature
Copy `docs/_feature-template.md` to `docs/feature-{feature-name}.md`, fill it in, and add a row to the Features table in `docs/PLAN.md` pointing to it.

### When Modifying an Existing Feature
- Read its doc first
- Update the doc with what changed
- Add new gotchas if you discovered any
- Update the changelog

### When You Learn Something Cross-Cutting
If you discover information that applies globally (not specific to one feature), write it to memory so it persists across conversations:
- User preferences and working style
- Cross-cutting patterns or conventions
- External system references
- Feedback on what approaches work or don't work

Create focused, small memory files — one per topic, not one giant file.

## Git Convention

Commit after every meaningful, **verified** change — never let working code accumulate uncommitted. Push too, *if a remote is configured*; otherwise local commits are fine. Never commit secrets (`.env`, credentials, keys) — keep them gitignored.

- **Format**: `type(scope): description`
- **Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
- **Scope**: feature name or area (e.g., `auth`, `api`, `docs`)
- **Examples**:
  - `feat(auth): add JWT token refresh flow`
  - `fix(cart): prevent negative quantity on item update`
  - `docs(search): document elasticsearch gotchas`

Remote: {to be configured}

## Project Artifacts Index

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file — workflow instructions and artifact index |
| `README.md` | Human-readable project overview |
| `docs/PLAN.md` | Roadmap, brainstorming output, feature status, decision log |
| `docs/ARCHITECTURE.md` | Tech stack, folder structure, system design, data flow |
| `docs/RULES.md` | Code conventions, naming rules, anti-patterns |
| `docs/_feature-template.md` | Template to copy when documenting a new feature |
| `docs/feature-*.md` | Per-feature documentation (created as features are built) |

## Complex Decisions

For brainstorming sessions, architecture trade-offs, debugging complex issues, or any decision where you need to weigh multiple competing approaches — reason it through step by step rather than answering off the cuff. If the **sequential thinking MCP** (`sequentialthinking`) is available, use it; otherwise just think carefully and methodically.

Don't over-think routine tasks (following this checklist, writing straightforward code, updating docs). Reserve the deep reasoning for when the *thinking itself* is the hard part.
