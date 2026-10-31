# Speed Duration for YouTube

[Deutsch](README.md) · **English**

Browser extension that shows, in the YouTube player, how long a video really takes at the current
playback speed. If [SponsorBlock](https://sponsor.ajay.app/) is installed, its duration without
sponsor segments is used as the basis.

```
1.5x, SponsorBlock active:  12:34 / 45:00 (43:12) (28:48 @1.5x)
1.5x, without SponsorBlock: 12:34 / 45:00 (30:00 @1.5x)
1.0x, SponsorBlock active:  12:34 / 45:00 (43:12)
```

`(43:12)` comes from SponsorBlock, `(28:48 @1.5x)` from this extension.

## Features

- Total duration, time remaining or end time; click the number to switch
- Works with any speed, including speeds set by other extensions
- SponsorBlock is optional; without it, the full video duration is used
- No network requests, no tracking

## Installation

For Brave, Chrome, Edge and other Chromium browsers. The extension is not available in any store,
so it is loaded in developer mode.

1. Download the ZIP from [Releases](https://github.com/Marpal1/YTSpeedDuration/releases) and unzip
   it, or clone the repository:
   ```bash
   git clone https://github.com/Marpal1/YTSpeedDuration.git
   ```
2. Open the extensions page: `chrome://extensions`, `brave://extensions` or `edge://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and select the project folder
5. Reload the YouTube tab

Node.js is not required; the built content script `dist/content.js` is in the repository.
Do not move or delete the folder afterwards, because the browser loads the extension from there.

**Updating:** get the new version (`git pull` or unzip it again), click **Reload** on the extensions
page, then reload the YouTube tab.

## Usage

- **Click the number** to switch modes:
  total duration → time remaining → end time
- The **toolbar icon** opens the default mode and the option to hide the display at 1x speed
  (on by default, applies to the total duration)

The interface is currently German only. These are the three modes:

| Mode | Display | Meaning |
|---|---|---|
| Total duration | `(28:48 @1.5x)` | How long the video takes at this speed, without sponsor segments |
| Time remaining | `(~21:38 @1.5x)` | How long it still runs from the current position |
| End time | `(fertig 21:47)` | The time of day when it ends (`fertig` means "done") |

Sponsor segments are only subtracted from the **total duration**. SponsorBlock's number covers
*all* segments, not just the upcoming ones. Time remaining and end time are therefore calculated
without the deduction; the `~` marks the time remaining as approximate in that case. See
[ADR 0001](docs/adr/0001-sponsorblock-kopplung-ueber-dom-span.md) (German).

## Privacy

The extension sends no data and makes no network requests. It reads the time display and the
`<video>` element on `www.youtube.com` and stores only its two settings in `chrome.storage.sync`.
If browser sync is on, the browser syncs them across your devices.

| Permission | Used for |
|---|---|
| `storage` | Saving settings |
| `https://www.youtube.com/*` | The display in the YouTube player |

## Working with other extensions

- Creates and writes exactly one node: `#ysd-duration`.
- Other nodes are only **read**, never changed. YouTube's own display is left alone.
- Speed changes are picked up through `ratechange` on `<video>`, whoever triggers them
  (YouTube, Enhancer for YouTube, keyboard shortcuts).

## If nothing appears

- At 1x, the default setting hides the total duration. Change the speed or turn the option off in
  the popup.
- The extension deliberately shows nothing during ads and live streams.
- Otherwise, paste the contents of `tools/check-selectors.js` into the DevTools console of the
  YouTube tab. It reports separately whether the content script started and whether it finds the
  time container.

YouTube changes its interface from time to time, so the display may stop working until an update.
When reporting a problem, please include your browser, the extension version and the script output.

## Known limitations

- Time remaining and end time do not subtract sponsor segments.
- No total time remaining for playlists.
- Desktop YouTube on `www.youtube.com` only: no Shorts, YouTube Music, `m.youtube.com` or embeds
  via `youtube-nocookie.com`.
- German interface only.
- The link to SponsorBlock relies on its display (`#sponsorBlockDurationAfterSkips`), as there is no
  official interface. If that changes, the time is calculated without the deduction; the display
  does not break. If SponsorBlock's option for showing the time without skips is off, there is
  nothing to read.

## Development

Requires Node.js.

```bash
npm install
npm run build      # rebuild dist/content.js
npm test           # build and run all tests
npm run test:watch
```

`dist/content.js` is checked in and must be rebuilt after every change in `src/`; otherwise a test
fails (see [ADR 0002](docs/adr/0002-kein-build-schritt.md), German).

| Path | Contents |
|---|---|
| `src/core/` | Pure logic: no DOM, no clock, no `chrome.*` |
| `src/content/` | The only place that knows YouTube's and SponsorBlock's DOM |
| `src/popup/` | Toolbar popup |
| `src/settings.js` | `chrome.storage.sync` behind a synchronous interface |
| `build.js` | esbuild bundle to `dist/content.js` |
| `tools/` | Console snippets for troubleshooting on the real player |
| `docs/adr/` | Architecture decisions (German) |
| `CONTEXT.md` | Project terminology (German) |

## License and disclaimer

[MIT](LICENSE).

Independent project, not affiliated with YouTube, Google or SponsorBlock.
