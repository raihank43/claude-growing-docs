#!/usr/bin/env node
/**
 * growing-docs — SessionStart(compact) re-inject hook   [EXPERIMENT]
 *
 * Fires AFTER Claude Code compacts a session (auto or manual). Re-injects the
 * project's NEGATIVE SPACE — docs/PLAN.md's Rejected Ideas + Decisions — as
 * `additionalContext`, so the post-compaction agent doesn't re-suggest ideas
 * already ruled out or re-litigate settled decisions.
 *
 * Why ONLY the negative space, and why so small (learned from a live test, 2026-06-02):
 *   - CLAUDE.md is RELOADED NATIVELY post-compaction (it shows up as a memory
 *     file in /context), so re-injecting it is redundant — dropped.
 *   - Claude Code offloads any hook output over ~2KB to disk, leaving only a
 *     ~2KB inline preview. The v1.6.0 payload was ~16KB, so its valuable part
 *     (Rejected Ideas) got paged OUT of context. So we keep the payload UNDER
 *     ~2KB to stay inline, and inject only the one thing CLAUDE.md and the
 *     native compaction summary don't reliably carry: the rejected/decided
 *     "negative space", front-loaded so a trim keeps the most valuable rows.
 *   - When a section is too big for the budget, drop its OLDEST rows (v1.8.0):
 *     entries are appended chronologically, so the newest rows — the ones the
 *     just-compacted conversation was most likely circling — sit at the BOTTOM.
 *
 * It only re-serves what is already on disk; it captures nothing. /checkpoint
 * is still what writes current knowledge there.
 *
 * Constraints (see docs/RULES.md "Zero-dependency product"):
 *   - OPT-IN: no-ops unless env GROWING_DOCS_REINJECT is truthy.
 *   - SELF-GUARDING: no-ops unless cwd has CLAUDE.md (a growing-docs project).
 *   - FAIL-SAFE: any error → emit nothing, exit 0. Never disrupt a session.
 *   - ZERO npm deps: Node stdlib only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Stay under Claude Code's ~2KB inline-preview threshold so the payload lands
// IN context instead of being offloaded to disk.
const INLINE_CHAR_BUDGET = 1900;
const TRIM_NOTE = '\n…[trimmed to stay inline — read docs/PLAN.md for the rest]';
const ROW_TRIM_NOTE = '_(older rows trimmed to fit — full table in docs/PLAN.md)_';

function isTruthy(v) {
  return v != null && !['', '0', 'false', 'off', 'no'].includes(String(v).trim().toLowerCase());
}

function readIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

/** Emit the optional context as a SessionStart hook result, then exit cleanly. */
function emit(additionalContext) {
  if (additionalContext) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext,
        },
      })
    );
  }
  process.exit(0);
}

/** Bodies of the `## ` sections whose title matches each pattern, in pattern order. */
function extractSections(planText, patterns) {
  const sections = [];
  let cur = null;
  for (const line of planText.split(/\r?\n/)) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      cur = { title: m[1], lines: [line] };
      sections.push(cur);
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  const out = [];
  for (const pat of patterns) {
    const sec = sections.find((s) => pat.test(s.title));
    if (sec) out.push(sec.lines.join('\n').trim());
  }
  return out;
}

/**
 * Strip a section's explanatory prose: keep the heading, then jump to the first
 * table or list line onward. Spends the ~2KB budget on real rejected/decided
 * entries instead of template boilerplate ("Record ideas we considered…"). If a
 * section has no table/list, it's kept whole (the prose IS the content).
 */
function trimSection(sectionText) {
  const lines = sectionText.split('\n');
  const isContent = (l) => /^\s*\|/.test(l) || /^\s*[-*]\s/.test(l) || /^\s*\d+\.\s/.test(l);
  const idx = lines.findIndex((l, i) => i > 0 && isContent(l));
  if (idx === -1) return sectionText;
  return [lines[0], ...lines.slice(idx)].join('\n').trim();
}

/**
 * Fit a section into `budget` chars by dropping its OLDEST rows. Entries are
 * appended chronologically, so the newest rows — the ones the just-compacted
 * conversation was most likely circling, i.e. the most at risk of being
 * re-suggested — sit at the BOTTOM; a head-slice would keep the stale early
 * rows and drop the live ones. Keeps the heading (plus a table's header and
 * separator rows), then as many trailing rows as fit, preserving their order.
 * Returns null if not even one row fits.
 */
function fitSection(sectionText, budget) {
  if (sectionText.length <= budget) return sectionText;
  const lines = sectionText.split('\n');
  // Head = the `## ` heading, plus the header + separator rows when the
  // content is a markdown table.
  let headEnd = 1;
  if (lines.length > 2 && /^\s*\|/.test(lines[1]) && /^\s*\|[\s:|-]+\|?\s*$/.test(lines[2])) {
    headEnd = 3;
  }
  const head = lines.slice(0, headEnd).join('\n');
  const rows = lines.slice(headEnd).filter((l) => l.trim() !== '');

  let used = head.length + 1 + ROW_TRIM_NOTE.length + 1;
  const kept = [];
  for (let i = rows.length - 1; i >= 0; i--) {
    if (used + rows[i].length + 1 > budget) break;
    used += rows[i].length + 1;
    kept.unshift(rows[i]);
  }
  if (!kept.length) return null;
  const note = kept.length < rows.length ? [ROW_TRIM_NOTE] : [];
  return [head, ...kept, ...note].join('\n');
}

try {
  // 1. Opt-in gate.
  if (!isTruthy(process.env.GROWING_DOCS_REINJECT)) emit(null);

  // 2. Resolve the project dir from the hook payload (fallback: process.cwd()).
  let cwd = process.cwd();
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
    if (input && typeof input.cwd === 'string' && input.cwd) cwd = input.cwd;
  } catch {
    /* no stdin / not JSON — fall back to process.cwd() */
  }

  // 3. Self-guard: only act in a growing-docs project. (CLAUDE.md is the marker;
  //    we do NOT inject it — Claude Code reloads it natively as a memory file.)
  if (!readIfExists(path.join(cwd, 'CLAUDE.md'))) emit(null);

  const plan = readIfExists(path.join(cwd, 'docs', 'PLAN.md'));
  if (!plan) emit(null);

  // 4. Rejected Ideas first (the crown jewel), then Decisions; drop boilerplate.
  const sections = extractSections(plan, [/reject/i, /decision/i]).map(trimSection);
  if (!sections.length) emit(null);

  const preamble =
    '# Re-injected after compaction (growing-docs)\n' +
    "Durable negative space your CLAUDE.md doesn't carry (CLAUDE.md is reloaded " +
    'natively). Do NOT re-propose anything listed as Rejected, or re-litigate a ' +
    'settled Decision, without checking docs/PLAN.md first.';

  // 5. Assemble within the inline budget. Priority order: Rejected Ideas gets
  //    the budget first, Decisions takes what's left — and when a section is
  //    too big, fitSection keeps its NEWEST rows, not its oldest.
  const parts = [preamble];
  let remaining = INLINE_CHAR_BUDGET - preamble.length;
  for (const sec of sections) {
    const fitted = fitSection(sec, remaining - 2); // 2 = the '\n\n' joiner
    if (!fitted) continue;
    parts.push(fitted);
    remaining -= fitted.length + 2;
  }
  if (parts.length === 1) emit(null);

  let out = parts.join('\n\n');
  // Last resort — fitSection should keep us under, but never risk the offload.
  if (out.length > INLINE_CHAR_BUDGET) {
    out = out.slice(0, INLINE_CHAR_BUDGET - TRIM_NOTE.length).trimEnd() + TRIM_NOTE;
  }

  emit(out);
} catch {
  // Never break a session because re-inject failed.
  process.exit(0);
}
