/**
 * Nachbau der YouTube-Player-Zeitanzeige.
 * Die Selektorkette stammt aus SponsorBlocks `showTimeWithoutSkips`
 * (src/content.ts, master) — dieselbe, die SponsorBlock heute produktiv nutzt.
 */
export function youtubePlayer({ current = "12:34", duration = "45:00", legacy = false } = {}) {
  const times =
    `<span class="ytp-time-current">${current}</span>` +
    `<span class="ytp-time-separator"> / </span>` +
    `<span class="ytp-time-duration">${duration}</span>`;

  const inner = legacy
    ? times
    : `<div class="ytp-time-wrapper"><div class="ytp-time-contents">${times}</div></div>`;

  document.body.innerHTML = `
    <div id="movie_player" class="html5-video-player">
      <video></video>
      <div class="ytp-chrome-bottom">
        <button class="ytp-live-badge" style="display: none">Live</button>
        <div class="ytp-time-display notranslate">${inner}</div>
      </div>
    </div>`;
  return document;
}

/** Hängt SponsorBlocks Span an — exakt so, wie SponsorBlock es tut. */
export function withSponsorBlock(doc, text = " (43:12)") {
  const container =
    doc.querySelector(".ytp-time-contents") ?? doc.querySelector(".ytp-time-display");
  const span = doc.createElement("span");
  span.id = "sponsorBlockDurationAfterSkips";
  span.innerText = text;
  span.textContent = text;
  container.appendChild(span);
  return span;
}

/**
 * Macht das <video> im Fixture steuerbar. jsdom liefert `duration` nur als
 * Getter, deshalb werden die Felder direkt definiert.
 */
export function setVideo(doc, { duration = 2700, currentTime = 0, playbackRate = 1 } = {}) {
  const video = doc.querySelector("video");
  for (const [key, value] of Object.entries({ duration, currentTime, playbackRate })) {
    Object.defineProperty(video, key, { value, writable: true, configurable: true });
  }
  return video;
}

/** Fake-Store mit derselben Schnittstelle wie `settings.js`. */
export function fakeStore(initial = {}) {
  let value = { mode: "total", hideAtNormalSpeed: true, ...initial };
  const listeners = new Set();
  return {
    writes: [],
    read: () => value,
    write(patch) {
      this.writes.push(patch);
      value = { ...value, ...patch };
      for (const listener of listeners) listener(value);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
