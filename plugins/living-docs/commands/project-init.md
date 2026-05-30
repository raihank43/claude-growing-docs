---
description: Scaffold a NEW project from scratch with AI-optimized documentation that grows with the codebase. Pitch-first — brainstorm the idea, then it creates CLAUDE.md, docs/, README.md and initializes git. For existing codebases, use /project-adopt instead.
---

# Project Init

You are initializing a **new project from scratch** with a documentation system designed to preserve context through long conversations and compaction. Follow these phases carefully.

> Templates live at `${CLAUDE_PLUGIN_ROOT}/project-scaffold/`. Both this command and `/project-adopt` copy from there, so the docs stay consistent. Don't hand-write the docs from memory — copy the files and fill them in.
>
> `${CLAUDE_PLUGIN_ROOT}` is this plugin's install directory. If that literal path isn't already resolved, read the env var first (`$env:CLAUDE_PLUGIN_ROOT` on Windows PowerShell, `$CLAUDE_PLUGIN_ROOT` on macOS/Linux) to get the absolute path before copying.

## Phase 1: Understand the Idea & Name the Project

This command is usually run **pitch-first**: the user describes their idea in the conversation BEFORE invoking `/project-init`, often without a name in mind yet. Work with that flow.

1. **If the user hasn't pitched yet**, ask them to describe the idea in a sentence or two — what they want to build and why. Keep it light; the deep brainstorming happens in Phase 5. Don't interrogate.

2. **Propose the name yourself.** Based on the pitch, suggest 2-3 name options (each with a one-line reason) via AskUserQuestion and let the user pick or override. Don't make the user come up with a name cold — deriving a fitting name from the idea is one of the most valued parts of this command. (If $ARGUMENTS already contains a name, skip this and use it.)

3. **Confirm tech stack direction** in the same question or a quick follow-up: do they have a preference, or should you recommend one during brainstorming?

4. **Confirm where to create it.** Ask for the parent directory if it isn't obvious (e.g. the user's usual projects folder). The project folder will be created as a subdirectory there.

Keep Phase 1 short. Its only goals are a rough idea, an agreed name, and a folder to create. Everything deeper belongs in Phase 5.

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

Do NOT over-fill. Wrong guesses are worse than empty sections — the templates stay mostly empty until brainstorming fills them.

## Phase 3: Initialize Git

1. Run `git init` in the project directory
2. Create a `.gitignore` appropriate for the tech stack (or a sensible default if stack is TBD). Always include secret files — `.env`, `.env.*`, credentials, keys — regardless of stack, since commits here are automated.
3. Stage all files and create the initial commit: `chore: scaffold project with documentation structure`
4. Ask the user if they want to connect a remote repo now (GitHub/Bitbucket/etc.) or use local git for now. Record the answer in CLAUDE.md's `Remote:` line.

## Phase 4: Handle Directory Transition

**This is critical.** Check whether the current working directory (where this conversation is running) is DIFFERENT from the project directory you just created.

### If CWD is outside the project directory (common case — user pitched from home dir):

The project's CLAUDE.md will NOT be reliably read by Claude in this conversation, and definitely won't survive compaction. You MUST handle this gracefully:

1. **Capture everything discussed so far** into the project's doc files:
   - Write the user's pitch/idea into `docs/PLAN.md` (Vision section)
   - Fill in any tech stack decisions into `docs/ARCHITECTURE.md`
   - Fill in any conventions discussed into `docs/RULES.md`
   - Update `README.md` with the project description
   - Leave the `Project Phase` marker in PLAN.md as `BRAINSTORMING`
   - Commit: `docs: capture initial brainstorming from project pitch`

2. **Tell the user they need to move.** Be explicit:

   > **Project initialized at `{full-project-path}`!**
   >
   > I've captured everything we discussed into the project docs. But this conversation is running from `{current-cwd}`, so I can't reliably read the project's CLAUDE.md from here — and the doc workflow won't survive compaction unless I'm inside the project.
   >
   > **To continue, start Claude from the project directory:**
   > ```
   > cd {full-project-path}
   > claude
   > ```
   >
   > When you get there, everything's ready. `docs/PLAN.md` is marked **Project Phase: BRAINSTORMING**, so the fresh session will automatically pick up where we left off and keep fleshing out the plan with you — you won't have to re-explain anything. Once the roadmap feels solid, I'll flip it to BUILDING and we start coding.

3. **Do NOT continue building features in this conversation.** The doc workflow won't work here. If the user insists on continuing, warn them once more that docs won't auto-update, then comply but remind them periodically.

### If CWD is already the project directory:

No transition needed. Proceed directly to Phase 5.

## Phase 5: Brainstorming (only if CWD matches the project directory)

Build on the rough pitch from Phase 1 — don't make the user start over. Say something like:

> Project scaffolded, and we've got a name. Now let's flesh it out properly. Tell me as much or as little as you want about how you picture it working — features, flows, anything. Don't worry about being organized; I'll structure it into the docs as we go.

As the user brainstorms:
- Fill in `PLAN.md` with features, priorities, and decisions made
- Fill in `ARCHITECTURE.md` with tech stack choices and system design
- Fill in `RULES.md` with any conventions discussed
- Update `README.md` with the project description
- Update `CLAUDE.md` with the remote repo info if configured
- Record rejected ideas in the PLAN.md rejected ideas table
- Commit progress periodically: `docs: capture brainstorming — {summary}`

**When the user confirms the roadmap is solid enough to start building, flip `Project Phase` in PLAN.md from `BRAINSTORMING` to `BUILDING` and commit.** From that point the normal build workflow in CLAUDE.md takes over.

## Important Notes

- **Don't over-fill templates.** Leave sections as `{To be filled}` if they haven't been discussed yet. Wrong guesses are worse than empty sections.
- **The user drives the brainstorming.** Don't rapid-fire questions. Let them talk, then organize what they said.
- **Commit the brainstorming output.** When brainstorming reaches a natural pause, commit the filled-in docs.
- **This is the start of an ongoing system.** Every feature built after this should get its own doc. Every convention discovered should go in RULES.md. The docs grow with the project — they're never "done."
