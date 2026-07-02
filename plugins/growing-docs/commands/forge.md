---
description: Relentless, convergent design interview that turns a fuzzy idea or one-line backlog entry into a *decided design* — captured in a feature doc with its rejected alternatives, then committed. Offer it before building a feature that lacks a concrete plan. For growing-docs projects.
---

# Forge

A focused design interview you invoke by hand (or accept when offered). Where `/project-init`'s brainstorm is gentle and user-led, **forge is the inverse: agent-led, relentless, one question at a time — driving a fuzzy idea to a *decided design* before any code is written.** It mines the docs you already have (Features table, Decisions, Rejected Ideas, gotchas) as the raw material for sharp questions, and writes the result back as durable knowledge: a feature doc's decided design with its rejected alternatives.

Forge **produces a design, never code.** Building is a separate step (the normal workflow) that picks up from the feature doc.

If the repo has no `CLAUDE.md` / `docs/` (not a growing-docs project), tell the user to run `/project-adopt` or `/project-init` first.

## Phase 1 — Establish the target & gather ammunition

1. **Resolve what you're forging:**
   - `/forge <feature-name>` → a feature already in PLAN's Features table.
   - `/forge <backlog-item>` → an entry in `docs/BACKLOG.md`. **Graduate it up front:** add a `planned` row to the Features table and delete the backlog entry (the Features table is canonical — one live copy of every idea).
   - `/forge <free description>` → a brand-new idea. Add a `planned` row to the Features table **up front** so an interrupted forge isn't lost.
   - bare `/forge` → infer the target from the current conversation / PLAN's Current Focus, and **confirm it** before diving in.
2. **Read the docs as ammunition** (don't interview blind): PLAN's Features table, Decisions log, and Rejected Ideas; the feature's own doc if one exists; RULES and ARCHITECTURE for constraints. Explore the code where relevant.
3. **Check the three edge conditions** (see Edge cases) and handle them before the interview proper: an existing feature doc, an overlap with another feature, or a target that revisits a rejected idea.
4. **Scale your ambition to the change.** A one-line tweak earns a couple of questions; a large feature earns the full design tree. Don't 20-question a small change.

## Phase 2 — The interview

Walk the design tree, **resolving dependencies one at a time.** The rules:

- **One question at a time.** Wait for the answer before the next.
- **Recommend an answer to every question** (with a one-line why), so the user can just confirm.
- **Explore instead of asking** whenever the codebase or docs can answer it.
- **Match the format to the question** (the presentation taxonomy):
  - *Discrete either/or fork* → `AskUserQuestion`, recommended option first.
  - *Comparing concrete textual artifacts* (two API shapes, two doc layouts) → `AskUserQuestion` with the `preview` field.
  - *UI/UX visual choice* → build a throwaway, self-contained, project-themed prototype at `scratch/<name>.html` (ensure `scratch/` is gitignored first) demonstrating the options, and let the user pick.
  - *Empirical unknown* (feasibility, performance, does-the-API-actually-behave-that-way — a question neither the user nor the docs can answer) → offer a **spike**: a minimal, throwaway code probe that answers it before the design commits to the answer. The spike code is disposable (gitignored `scratch/` or a temporary probe — the project's call); the **finding** is the durable artifact — record GREEN/RED + what was learned in the feature doc's **Spike findings** section.
  - *Open / exploratory* (what should happen when X? success criteria?) → prose, so the user can think out loud.
- **Cover the dimensions** the docs make answerable: purpose & scope; **overlap-check against the Features table**; **rejected-ideas check**; dependencies / ordering; edge cases & failure modes; data / state / contracts; UX (→ prototype); success criteria.

**Escape hatch.** At any point the user can say *"enough — fill the rest with your recommendations."* Complete the remaining branches with your recommended defaults, and in the write-up **mark which decisions were user-confirmed vs forge-defaulted**, so the negative space stays honest.

**Ending.** When the tree is resolved (no open branch that would block the build), **summarize the decided design and propose writing it up.**

## Phase 3 — Write up the decided design

1. **Create or refine the feature doc.** New → copy `docs/_feature-template.md` to `docs/feature-<name>.md`. Existing → refine in place (see Edge cases).
2. **Fill the "Decided design" section:** each choice with its **rejected alternative inline** and the reason. Mark forge-defaulted choices if the escape hatch was used. Reference any `scratch/<name>.html` prototype, and record any spike's outcome in a **Spike findings** section (GREEN/RED + what was learned).
3. **For a large design, add a "Build phasing" section:** ordered, independently-verifiable slices (Phase A, B, …) — each phase lands as a working, testable commit, so the build can pause and resume (even across sessions) without losing the thread. Skip it for small designs — the same depth-scales-with-complexity rule as the interview.
4. **Promote knowledge:** design-level rejects stay inline in the feature doc; **project / architecture-level** rejects → PLAN's Rejected Ideas; decisions worth logging → PLAN's Decisions log. Update the Features table row / status and refresh `Last updated:` markers.

## Phase 4 — Persist

- **Privacy guard** (same as `/checkpoint` / `/project-adopt`): if the repo is public, scan the chat-sourced docs for private / cross-project content before committing (offer sanitize / keep-local / proceed).
- **Commit the docs-only design** following the project's own git / release convention — like `/project-init` commits brainstorming. **Never commit code** (forge writes none). **If the project's dev docs are gitignored / local-only**, the writes simply stay on disk — commit only tracked changes, and say so plainly rather than treating it as an error. Push per the project's convention (some projects push only on request); otherwise push if a remote is configured.
- **Refresh PLAN's Current Focus** (or offer `/checkpoint` if the session is ending) so the brief points at the freshly decided design as the next build step — don't leave a pre-forge brief in place.
- **Report** what was decided and the feature-doc path, and note that **building is the next step** — the normal workflow picks up from the doc (you can even start a fresh chat; the design now survives).

## Edge cases

- **Existing feature doc** → read it, interview only on what's changing, append a **new dated revision** to the Decided-design section, and move superseded choices into the rejected alternatives. Don't clobber history.
- **Overlap with an existing feature** (caught via the Features table) → surface it and ask: **merge** into that feature / **supersede** it / **keep distinct.**
- **Revisits a rejected idea** → surface the original rejection and its reason, and ask **what changed** that makes it worth reopening (the Chesterton's-fence check — the same move `/rethink` uses). Don't silently rebuild a ruled-out idea.
- **Tiny change** → scale down to the few questions that actually carry ambiguity.
- **Not a growing-docs project** (no `docs/` / PLAN.md) → stop and point the user to `/project-adopt` or `/project-init`.

## Notes

- **Forge is the canonical home of the interview technique.** `/project-init`'s Phase 5 grill-mode and (future) `/rethink`'s proposal handoff reference this command rather than duplicating it.
- **Design, not build.** Forge stops at the decided design. Keeping the two phases separate is what lets you forge now and build later (or in a fresh session) without losing the thread.
- **It's a tool, not a gate.** Offered when there's real design ambiguity; never forced.
