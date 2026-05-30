# growing-docs

> Documentation that scaffolds itself, grows with your codebase, and survives context compaction.

A Claude Code plugin with two slash commands for projects you build *with* an AI agent over long, single-conversation sessions. It sets up a documentation system the agent maintains automatically — so when the conversation gets compacted and the agent loses context, the knowledge is already written down where it can be re-read.

## The problem it solves

When you build a project in one long conversation with an AI agent, two things happen:

1. **Context compaction** eventually drops details — gotchas, decisions, conventions, half-finished plans.
2. The agent **re-invents bad approaches** and **re-suggests rejected ideas** because the reasons they were dropped vanished with the context.

`growing-docs` fixes this by giving the project a set of documents the agent reads before every task and updates after every change. The docs are the agent's long-term memory.

### What makes it different

Most "AI memory" setups record **decisions** — but an agent can usually re-derive *what* to do from the code. The expensive thing that vanishes in compaction is **why a path was abandoned**. That's what makes an agent confidently re-suggest the idea you shot down an hour ago.

So growing-docs treats the negative space as first-class:

- **Rejected Ideas** (`PLAN.md`) — what you considered and decided *not* to do, and why.
- **Anti-Patterns** (`RULES.md`) — what was tried, broke, and shouldn't be repeated — with the failure reason.
- **Gotchas** (every feature doc) — the edge cases and "looks right but isn't" traps.

Recording the dead ends is the difference between docs that *describe* the project and docs that stop the agent from repeating your mistakes.

## What you get

| File | Purpose |
|------|---------|
| `CLAUDE.md` | The agent's workflow: read docs → work → update docs → verify → commit. Plus a git convention and an index of everything. |
| `docs/PLAN.md` | Roadmap, feature status table, decisions log, and **rejected ideas** — with a `Project Phase` marker (`BRAINSTORMING` / `BUILDING`) that tells a fresh session how to behave. |
| `docs/ARCHITECTURE.md` | Tech stack, folder structure, system overview, data flow. |
| `docs/RULES.md` | Coding conventions, naming, and **anti-patterns** (things that were tried and failed). |
| `docs/_feature-template.md` | Copied per feature; every feature gets its own doc with a **Gotchas** section. |
| `README.md` | The human-facing project overview. |

The core idea: the agent **decides** after every request — large or small — which of these docs need updating, and keeps them in sync with the code. Code is always the source of truth; stale docs get fixed.

## Commands

### `/project-init` — new project from scratch
Pitch-first. Describe your idea (you don't even need a name — it'll suggest one), and it scaffolds the docs, initializes git, then brainstorms the plan *with* you, filling in the docs as you talk. It handles the "I started Claude from my home directory" case by telling you exactly how to relocate without losing anything.

### `/project-adopt` — existing codebase
Run it from inside a repo. It either:
- **Adopts** an un-instrumented project — you choose how deeply to scan (barebones / map existing docs / full scan), so it never burns tokens crawling a huge repo you didn't ask it to.
- **Upgrades** a project already using growing-docs to the latest templates — without touching your filled-in content.

## Install

```
/plugin marketplace add raihank43/claude-growing-docs
/plugin install growing-docs
```

Then `/project-init` and `/project-adopt` are available in any conversation.

To update later, pull the newest version:
```
/plugin marketplace update claude-growing-docs
```

> You can also run it from a local clone instead of GitHub:
> ```
> /plugin marketplace add /absolute/path/to/claude-growing-docs
> ```

## How it stays consistent

Both commands copy from one shared template source (`plugins/growing-docs/project-scaffold/`), referenced via `${CLAUDE_PLUGIN_ROOT}` so it resolves correctly on any machine. Editing a template once updates what both commands produce.

## License

MIT — see [LICENSE](LICENSE).
