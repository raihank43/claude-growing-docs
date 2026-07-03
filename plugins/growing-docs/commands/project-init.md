---
description: Scaffold a NEW project from scratch with AI-optimized documentation that grows with the codebase. Pitch-first — it names the project, scaffolds CLAUDE.md + docs/, inits git, then brainstorms the plan WITH you (research, trade-offs, a roadmap you shape) before building starts. For existing codebases, use /project-adopt instead.
---

# Project Init

You are initializing a **new project from scratch** with a documentation system designed to preserve context through long conversations and compaction. Follow these phases carefully.

> Templates live at `${CLAUDE_PLUGIN_ROOT}/project-scaffold/`. Both this command and `/project-adopt` copy from there, so the docs stay consistent. Don't hand-write the docs from memory — copy the files and fill them in.
>
> `${CLAUDE_PLUGIN_ROOT}` is this plugin's install directory. If that literal path isn't already resolved, read the env var first (`$env:CLAUDE_PLUGIN_ROOT` on Windows PowerShell, `$CLAUDE_PLUGIN_ROOT` on macOS/Linux) to get the absolute path before copying.

> **The one rule that shapes this whole command:** the current working directory only matters for **building** (that's where the project's CLAUDE.md auto-loads and the doc workflow survives compaction). Brainstorming is conversation whose output is doc writes — and you can write to the project's docs **by absolute path from anywhere**. So the brainstorm happens HERE, in this session, regardless of CWD; only building waits for the right directory.

## Phase 1: Understand the Idea, React, and Name It

This command is usually run **pitch-first**: the user describes their idea in the conversation BEFORE invoking `/project-init`, often without a name in mind yet. Work with that flow.

1. **If the user hasn't pitched yet**, ask them to describe the idea in a sentence or two — what they want to build and why. Keep it light. Don't interrogate.

2. **React to the pitch — briefly and substantively.** Two to four sentences: what's interesting about it, what's load-bearing-but-unverified (the assumptions the idea stands on), what open questions you'd want to explore. This is a reaction, NOT a plan — do **not** propose a roadmap, feature list, or architecture here. The brainstorm (Phase 4) is where the idea gets shaped, *with* the user.

3. **Propose the name yourself.** Based on the pitch, suggest 2-3 name options (each with a one-line reason) via AskUserQuestion and let the user pick or override. Don't make the user come up with a name cold — deriving a fitting name from the idea is one of the most valued parts of this command. (If $ARGUMENTS already contains a name, skip this and use it.)

4. **Ask for hard constraints — not choices.** In the same AskUserQuestion (or a quick follow-up), ask whether any hard constraints or standing preferences apply: "must be TypeScript", "has to run on my Raspberry Pi", "company standard is Postgres". Constraints are legitimate day-one input — they kill whole exploration branches early. But do **NOT** ask the user to choose a tech stack here: the stack is a *decision*, and it's made during the Phase 4 brainstorm, after feasibility exploration, when there's actually information to decide with.

5. **Confirm where to create it.** Ask for the parent directory if it isn't obvious (e.g. the user's usual projects folder). The project folder will be created as a subdirectory there.

Keep Phase 1 short. Its goals: a rough idea, a genuine reaction, an agreed name, known constraints, and a folder to create. Everything deeper belongs in Phase 4.

## Phase 2: Scaffold From the Shared Templates

1. Create the project directory at `{parent-dir}/{project-name}`.
2. **Copy the entire scaffold tree** from `${CLAUDE_PLUGIN_ROOT}/project-scaffold/` into the new project directory. This gives you:
   ```
   {project-name}/
   ├── CLAUDE.md
   ├── README.md
   └── docs/
       ├── PLAN.md
       ├── ARCHITECTURE.md
       ├── RULES.md
       └── _feature-template.md
   ```
3. **Fill the known placeholders** in the copied files (leave every `{To be filled ...}` placeholder untouched — those get filled during brainstorming):
   - `{Project Name}` → the actual project name (in CLAUDE.md, README.md)
   - `{project-name}` → the folder name (in ARCHITECTURE.md folder tree)
   - `{One-line description}` → the one-line description (in README.md)
   - `{growing-docs-version}` → the installed plugin version, read from the `version` field of `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` (in CLAUDE.md's stamp comment — it lets a future `/project-adopt` see which template generation the project has; never guess or hardcode it)

Do NOT over-fill. Wrong guesses are worse than empty sections — the templates stay mostly empty until brainstorming fills them. Scaffolding now, before the brainstorm, is deliberate: it gives the conversation a **capture target from minute one**.

## Phase 3: Initialize Git

1. Run `git init` in the project directory
2. Create a sensible default `.gitignore` (the stack isn't decided yet — update it in Phase 4 when it is). Always include secret files — `.env`, `.env.*`, credentials, keys — regardless of stack, since commits here are automated.
3. Stage all files and create the initial commit: `chore: scaffold project with documentation structure`

(The remote-repo question is deliberately NOT asked here — it comes at the transition, Phase 5, when the user knows whether the project is worth publishing. Local commits work fine until then.)

## Phase 4: Brainstorm — Here, In This Session, Regardless of CWD

This is the heart of the command. The user pitched one prompt's worth of idea; the roadmap that comes out of this phase must be one **they shaped**, not one you decided for them.

**Ground rules for the whole phase:**
- **Propose and confirm — never decide alone.** Recommend an answer to every open question (with your reasoning), then let the user rule. Every significant decision lands in PLAN's Decisions log with its rationale; every discarded option lands in Rejected Ideas with its why.
- **Write as you go, by absolute path.** Fill `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`, `README.md` in the project directory as things get decided — don't batch it all to the end.
- **Commit at natural pauses:** `docs: capture brainstorming — {summary}`. Also keep PLAN's **Current Focus** updated as you go (what's decided, what's still open, what's next) — that way the session boundary can fall *anywhere* without losing the thread.
- **Don't over-fill.** Sections not yet discussed keep their `{To be filled}` placeholders.

**Walk these five stages.** They're guidance, not lockstep — skip or compress a stage the user's pitch already covers, and let the user pull the conversation wherever they want:

1. **React.** (If Phase 1's reaction covered this, skip.) Surface the open questions and load-bearing unknowns out loud, so the user sees what needs exploring before anything is decided.

2. **Research the unknowns — against primary sources.** For each assumption the design would lean on (an API's actual capabilities, a service's pricing/limits, a library's real behavior, prior art), verify it against the **primary source** — official docs, specs, source code — never a secondary write-up. Cite each claim. Findings land in the docs, not just the chat:
   - A `### Feasibility notes (verified {date})` subsection under PLAN.md's Vision — the claims that shape the roadmap, each with its source.
   - Bulky artifacts (an OpenAPI spec, API response samples) → `docs/specs/`.
   - For a big read you can delegate to a background agent and keep talking with the user; the durable part is the findings landing in the docs.
   Scale to the project: a toy gets one quick check or none; an API-dependent product gets real verification. Research findings routinely change the design — that's the point of doing it *before* deciding.

3. **Propose directions.** Present 2-3 candidate shapes for the project — architecture + stack, each with honest trade-offs — and recommend one, informed by the research and the user's constraints. **The stack is decided here**, with the user, and logged in PLAN's Decisions (update ARCHITECTURE.md and the `.gitignore` to match). Losing candidates go to Rejected Ideas.

4. **Refine — user-led.** Now let them talk: features, flows, edge cases, anything, as organized or as messy as they like. Structure what they say into the docs as you go. When a specific fork gets stuck (competing approaches, an open UX choice, unresolved dependencies), **offer to escalate to a focused one-question-at-a-time design interview — the `/forge` technique** (recommend an answer each; explore instead of asking; UI forks via a throwaway gitignored `scratch/*.html` prototype). Offer it; don't impose it.

5. **Converge.** Draft the roadmap — the Features table with priorities — and present it **for the user to reshape**: it's a proposal, not a decision. Iterate until they say it's solid. Only then move to Phase 5.

## Phase 5: Transition — Roadmap Agreed

Three structured asks, then the handoff. Use AskUserQuestion for the first two — these must not be skipped:

1. **Up-front forging offer** (AskUserQuestion, three options):
   - **Forge as you go** (default) — design each feature via `/forge` when you're about to build it. Best when early features will teach you things later designs should know.
   - **Forge the foundational features now** — run `/forge` up front on the load-bearing features whose design constrains everything else; leaf features wait. Usually the sweet spot for projects with a clear core.
   - **Forge everything up front** — a decided-design doc for every planned feature before any building; building then flows without design interruptions. Honest trade-off: designs for late features can go stale as early features teach you things — their `Last updated:` lines are the staleness signal.

   Record the choice in PLAN's Current Focus (e.g. "Next: forge {features} before building"). The forge interviews themselves run in the build session — immediately if CWD already matches, otherwise after the user relocates.

2. **Remote repo** (AskUserQuestion): local-only for now (recommended default — a remote can be added any time) vs. create/connect a remote now (GitHub/Bitbucket/etc.). Record the answer in CLAUDE.md's `Remote:` line; if a remote was chosen, set it up and push.

3. **Flip the phase.** Set PLAN.md's `Project Phase` from `BRAINSTORMING` to `BUILDING` and commit: `docs: roadmap agreed — flip to BUILDING`.

4. **Hand off — the CWD check happens only now:**
   - **If CWD is the project directory:** no transition needed. Start building per the project's CLAUDE.md workflow (or start the chosen forge plan).
   - **If CWD is outside the project directory:** building must NOT happen from here — the project's CLAUDE.md won't load and the doc workflow won't survive compaction. Tell the user, honestly:

     > **{project-name} is ready at `{full-project-path}`.**
     >
     > Everything we decided is in the project's docs — the roadmap you shaped, the decisions with their whys, the rejected ideas, the feasibility notes. Building needs to run from inside the project (that's where its CLAUDE.md loads and the doc workflow survives compaction), so:
     >
     > ```
     > cd {full-project-path}
     > claude
     > ```
     >
     > The fresh session cold-starts from `docs/PLAN.md`'s Current Focus — it'll know exactly what's next{, including the forge plan you chose}.

     **Do NOT build features from this conversation.** If the user insists on continuing here, warn them once more that the doc workflow won't function from this directory, then comply but remind them periodically.

**Pausing early is fine.** If the user wants to stop mid-brainstorm (before the roadmap is agreed), commit what's captured, make sure Current Focus says exactly where the brainstorm left off and what's still open, and give the same relocate message — with `Project Phase` still `BRAINSTORMING`, the next session resumes the brainstorm from Current Focus instead of starting to build.

## Important Notes

- **Brainstorming is CWD-independent; building is not.** Never cut the brainstorm short because the conversation is in the wrong directory — write to the project by absolute path. Never build from the wrong directory.
- **The user drives; you propose.** Recommend everything, decide nothing unilaterally. The roadmap that leaves this command must be one the user shaped.
- **Don't over-fill templates.** Leave sections as `{To be filled}` if they haven't been discussed. Wrong guesses are worse than empty sections.
- **Commit the brainstorming output** at natural pauses, and keep Current Focus current — the session boundary can then fall anywhere.
- **This is the start of an ongoing system.** Every feature built after this should get its own doc. Every convention discovered should go in RULES.md. The docs grow with the project — they're never "done."
