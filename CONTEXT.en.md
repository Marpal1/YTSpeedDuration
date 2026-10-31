# CONTEXT — Speed Duration for YouTube

A browser extension that shows a second time next to YouTube's time display in the player,
adjusted for the playback speed.

## Glossary

**Speed** — `video.playbackRate`. Other extensions (Enhancer for YouTube) can set it to values
outside YouTube's own 0.25–2 range.

**Raw duration** (*Rohdauer*) — `video.duration`. The duration at 1x, with no correction.

**SB duration** (*SB-Dauer*) — the duration calculated by SponsorBlock *without* sponsor segments.
It is read from the text of the span `#sponsorBlockDurationAfterSkips`. `null` if SponsorBlock is
not installed or there is nothing to skip in this video.

**Base duration** (*Basisdauer*) — SB duration if available, otherwise raw duration. The number
that is divided by speed.

**Mode** (*Modus*) — which of the three times is shown. Exactly three values:
- `total` — base duration at the current speed. *How long does the video take?*
- `remaining` — real time remaining. *How much longer do I have to sit here?*
- `endsAt` — time of day when the video ends, to the minute.

**Speed marker** (*Speed-Marker*) — the `@1.5x` suffix in the extension's own display. It makes
clear which bracket comes from this extension and which from SponsorBlock.

**Blur marker** (*Unschärfe-Marker*) — the leading `~` in `remaining` mode when an SB duration is
present. SponsorBlock's span only gives the total of *all* skips, not the upcoming ones, so the
remaining time is deliberately calculated without a skip deduction and marked as approximate.

**Time container** (*Zeitcontainer*) — `.ytp-time-contents` in the YouTube player. The DOM node
that both SponsorBlock and this extension append their span to.

**Own span** (*Eigener Span*) — `#ysd-duration`. The only node this extension creates or writes.
It is always the last child of the time container.

## Not in the vocabulary

No "sponsor segment", "skip" or "category" — this extension does not know SponsorBlock's domain,
it reads exactly one number from its display.
