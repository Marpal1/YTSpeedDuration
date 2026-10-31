# ADR 0002 — Bundled, checked-in content script

Date: 2026-09-05
Status: accepted (replaces the original version, "No build step")

## Context

MV3 content scripts do not support `"type": "module"`.

The first version of this ADR solved this without a bundler: `src/content/index.js` was a classic
script that loaded the ES modules via `import(chrome.runtime.getURL(...))`. That is the approach
shown in the Chrome documentation, but it no longer works in Chromium 130+: the page's CSP rejects
the dynamic import ("Refused to load"), see crxjs/chrome-extension-tools#918. As a result, nothing
appeared on YouTube at all, with no visible error outside the console.

## Decision

`src/content/index.js` is a normal ES module with static imports and is bundled by `build.js`
(esbuild, IIFE) to `dist/content.js`. The manifest loads this bundle. `web_accessible_resources`
is dropped entirely.

**The bundle is checked in.** "Load unpacked" therefore still works without running a single
command first, which is the property the first version was chosen for.

`test/build.test.js` builds fresh and compares with `dist/content.js`. Anyone who changes `src/`
without running `npm run build` gets a failing test instead of a silent difference between tested
and shipped code. `npm test` builds first anyway.

## Rationale

- The dynamic import has been shown to be unusable on the target pages.
- Checked-in build output is normally a smell; here it buys back the simple installation, and the
  staleness test defuses the usual risk.
- The popup stays unchanged: extension pages load ES modules natively, so the problem does not
  exist there.

## Consequence

After every change under `src/content/`, `src/core/` or to `src/settings.js`: run `npm run build`
and commit `dist/content.js` as well.
