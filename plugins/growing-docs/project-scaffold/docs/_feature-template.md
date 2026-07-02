# {Feature Name}

_Last updated: {date or short commit SHA} — recency signal, not a correctness guarantee. If the code has moved past this, trust the code._

## Description
What it does and why it exists.

## Decided design
_Optional — filled by `/forge` when the feature was designed through an interview; omit if it wasn't. Each choice carries its rejected alternative inline so the "why" survives. Mark any choice that was forge-defaulted (escape hatch) rather than user-confirmed._
- **{Decision}:** {chosen option}. _(Rejected: {alternative} — {why}.)_

## Build phasing
_Optional — for large features: ordered, independently-verifiable build slices, each landing as a working, testable commit (so the build can pause and resume across sessions). Omit for small features._
- **Phase A — {name}:** {scope; how it's verified}

## Spike findings
_Optional — outcomes of feasibility probes on empirical unknowns (offered by `/forge` when a design hinges on one). The spike code is disposable; the FINDING is durable. Omit if unused._
- {date} — **{question}** → **GREEN/RED**: {what was learned}

## Files
List of routes, components, services, and other files involved.

## Dependencies
Other features or services this relies on.

## API / Interface
Endpoints, props, function signatures — whatever the "surface area" is.

## Gotchas
Edge cases, workarounds, things that will break if you're not careful.
Document what you tried that DIDN'T work and why.

## Changelog
- {date}: Initial implementation
