# growing-docs

> Project memory for agentic development — documentation that scaffolds itself, grows with your codebase, and outlives any single conversation.

A Claude Code plugin with five slash commands for projects you build *with* an AI agent. It sets up a documentation system the agent maintains automatically — durable, repo-versioned project memory, so no single conversation is ever load-bearing. End a session, compact it, start a fresh one, or hand off to a subagent or a teammate: the knowledge is already written down where the next reader picks it up.

## The problem it solves

Conversations are disposable; the knowledge inside them isn't. When you build with an AI agent, that knowledge keeps dying in predictable ways:

1. **A fresh session starts from zero** — decisions, gotchas, conventions, and where-you-left-off don't carry over.
2. **Context compaction** drops details mid-conversation — and a subagent or teammate never had them to begin with.
3. The agent **re-invents bad approaches** and **re-suggests rejected ideas**, because the reasons they were ruled out lived only in a conversation that's gone.

`growing-docs` fixes this by giving the project a set of documents the agent reads before every task and updates after every change. They live in the repo — versioned, reviewable, shared — so every session, agent, and human cold-starts from the same knowledge. The docs are the project's long-term memory.

### What makes it different

Most "AI memory" setups record **decisions** — but an agent can usually re-derive *what* to do from the code. The expensive thing that vanishes with a conversation is **why a path was abandoned**. That's what makes an agent confidently re-suggest the idea you shot down an hour ago.

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
Run it from inside a repo. It can:
- **Adopt** an un-instrumented project — you choose how deeply to scan (barebones / map existing docs / full scan), so it never burns tokens crawling a huge repo you didn't ask it to.
- **Upgrade** a project already using growing-docs to the latest templates — without touching your filled-in content. (A version stamp in the scaffolded `CLAUDE.md` tells it exactly which template generation you're on, so up-to-date projects are detected instantly.)
- **Consolidate a fat existing CLAUDE.md** — if a project crammed everything (architecture, gotchas, procedures) into one giant CLAUDE.md, adopt offers to move that knowledge into `docs/` and slim CLAUDE.md back to a lean workflow + index. Your choice (it can also just merge), and nothing is lost — content is relocated, then verified, before anything is removed.

### `/rethink` — challenge the project and propose something better
The divergent counterpart to `/forge`. Point it at your project (or a specific area) and it takes a fresh, critical look — reasoning from your *documented intent*, not just the code — and proposes ways to build it better: where an implementation under-serves its stated goal, where the architecture deserves a rethink, even where a previously-rejected idea is worth reopening because a new model changes the calculus. **Read-and-propose, never auto-refactor:** it writes a tiered, impact-ranked proposal doc and discusses it; accepted proposals graduate into the plan and hand off to `/forge`, rejected ones are logged so a future run treats them as settled. Its best moment is right after a sharper model lands — let it see what the last one couldn't.

### `/forge` — interview a fuzzy idea into a decided design
Before building a feature that's still vague — a one-line backlog entry, competing approaches, an open UX choice — run `/forge` (or accept it when offered). It's a relentless, one-question-at-a-time design interview: it reads your existing docs for context (cross-checking the new feature against what already exists and what you've already rejected), recommends an answer to every question, builds a throwaway HTML prototype for UI/UX choices, and drives the design to a decision. The result lands in the feature doc as a **decided design with its rejected alternatives**, committed — so when you build (even in a fresh chat), the *why* is already on disk. Produces a design, never code.

### `/checkpoint` — mid-session save-and-sync
Run it at a save point: a feature landed, you're taking a break, or the conversation has gotten big and you want to start a fresh one. It reconciles the docs against **both the code and the current conversation** — capturing decisions, gotchas, and rejected ideas that were only ever *discussed* — refreshes the staleness markers, and writes a "Current Focus" handoff note. The deliberate, lossless alternative to waiting for auto-compaction: checkpoint, then start a fresh chat that inherits everything through the docs. Commits following the project's own git/release convention. Runs on a cheaper model (Sonnet) — it's a focused, repo-grounded sweep, and it executes inline so it still sees your full conversation, keeping a checkpoint cheap even from a large chat.

## Install

```
/plugin marketplace add raihank43/claude-growing-docs
/plugin install growing-docs
```

Then `/project-init`, `/project-adopt`, `/forge`, `/rethink`, and `/checkpoint` are available in any conversation.

To update later, pull the newest version:
```
/plugin marketplace update claude-growing-docs
```

> You can also run it from a local clone instead of GitHub:
> ```
> /plugin marketplace add /absolute/path/to/claude-growing-docs
> ```

## How it stays consistent

Both scaffolding commands (`/project-init` and `/project-adopt`) copy from one shared template source (`plugins/growing-docs/project-scaffold/`), referenced via `${CLAUDE_PLUGIN_ROOT}` so it resolves correctly on any machine. Editing a template once updates what both produce.

## Experimental: post-compaction re-inject (opt-in)

A `SessionStart` hook (`plugins/growing-docs/hooks/`) that fires **after a context compaction** and re-injects your `PLAN.md` **Rejected Ideas + Decisions** — the "negative space" — back into the model's context, so a compacted-but-still-going session doesn't re-suggest ideas you already ruled out. It's the complement to `/checkpoint`: checkpoint writes knowledge to disk; this reads it back after a compaction.

**Status: experimental, off by default.** It does nothing unless you opt in, and only inside a growing-docs project. Enable it in your `~/.claude/settings.json`:

```json
{ "env": { "GROWING_DOCS_REINJECT": "1" } }
```

Honest caveats: it's most useful if you **stay in one long conversation and compact in place** rather than running `/checkpoint` + starting a fresh session (still the cleaner, more token-efficient path). The payload is capped under ~2KB so it lands inline, and it deliberately does **not** re-inject `CLAUDE.md` (Claude Code reloads that natively). Its value across repeated compactions is still being evaluated.

## License

MIT — see [LICENSE](LICENSE).
