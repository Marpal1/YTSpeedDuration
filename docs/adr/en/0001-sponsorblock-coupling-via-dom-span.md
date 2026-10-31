# ADR 0001 — Coupling to SponsorBlock via its display span

Date: 2026-09-05
Status: accepted

## Context

SponsorBlock shows the duration without sponsor segments in the same line of the player.
Anyone using both extensions wants the speed-adjusted number based on *that* value, not on the
raw duration.

There is no official interface between extensions. There were three options:

1. Read SponsorBlock's display span `#sponsorBlockDurationAfterSkips`
2. Parse SponsorBlock's preview bar (`li.previewbar[sponsorblock-category]`, inline `left`/`width`
   in percent) and add up the segments ourselves
3. Query the SponsorBlock API directly

## Decision

Option 1. Exactly one number is read from exactly one node, via `parseSponsorDuration`.

If the node is missing or empty, the calculation falls back to `video.duration`.

## Rationale

- Option 3 would rebuild the core of SponsorBlock: network access, additional host permissions
  and a privacy question of its own, for a feature that only benefits SponsorBlock users.
- Option 2 couples to two SponsorBlock internals instead of one, and percentages in inline styles
  are a poor data source.
- Option 1 has a clearly limited point of failure: if SponsorBlock changes the span ID or the text
  format, the display becomes less accurate, not broken.

## Consequence

In `remaining` mode the SB duration is **not** usable: it gives the total of *all* skips, not the
upcoming ones. The remaining time is therefore deliberately calculated without a skip deduction
and marked as approximate with a `~`. An exact remaining time would require option 2.
