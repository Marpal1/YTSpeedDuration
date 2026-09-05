/* Generiert aus src/ von build.js — nicht von Hand aendern. */
(() => {
  // src/core/time.js
  function formatClock(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor(s / 60) % 60;
    const seconds = s % 60;
    const ss = String(seconds).padStart(2, "0");
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${ss}` : `${minutes}:${ss}`;
  }
  function parseSponsorDuration(text) {
    const match = /\((\d+(?::\d+)+)\)/.exec(String(text ?? ""));
    if (match === null) return null;
    return match[1].split(":").reduce((total, part) => total * 60 + Number(part), 0);
  }

  // src/core/messages.js
  var messages = {
    endsAtPrefix: "fertig",
    popupTitle: "Speed Duration",
    modeLabels: {
      total: "Gesamtdauer bei aktueller Geschwindigkeit",
      remaining: "Verbleibende reale Zeit",
      endsAt: "Uhrzeit am Videoende"
    },
    hideAtNormalSpeed: "Bei 1x-Geschwindigkeit ausblenden",
    defaultModeLegend: "Standard-Modus",
    hint: "Klick auf die Zeit im Player wechselt den Modus."
  };

  // src/core/compute.js
  function formatRate(rate) {
    return String(Math.round(rate * 100) / 100);
  }
  function formatWallClock(timestamp) {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  function computeDisplay(state) {
    const {
      mode,
      playbackRate,
      duration,
      currentTime,
      sponsorSeconds,
      hideAtNormalSpeed,
      now,
      isLive,
      isAd
    } = state;
    if (isAd || isLive) return "";
    if (!Number.isFinite(duration) || duration <= 0) return "";
    if (!(playbackRate > 0)) return "";
    const remaining = Math.ceil((duration - currentTime) / playbackRate);
    if (mode === "endsAt") {
      const endsAt = Math.round((now + remaining * 1e3) / 6e4) * 6e4;
      return `(${messages.endsAtPrefix} ${formatWallClock(endsAt)})`;
    }
    const suffix = ` @${formatRate(playbackRate)}x`;
    if (mode === "remaining") {
      const blur = sponsorSeconds === null ? "" : "~";
      return `(${blur}${formatClock(remaining)}${suffix})`;
    }
    if (hideAtNormalSpeed && playbackRate === 1) return "";
    const base = sponsorSeconds ?? duration;
    return `(${formatClock(base / playbackRate)}${suffix})`;
  }

  // src/core/modes.js
  var MODES = ["total", "remaining", "endsAt"];
  function nextMode(mode) {
    const index = MODES.indexOf(mode);
    return MODES[(index + 1) % MODES.length];
  }

  // src/content/dom.js
  var TIME_CONTENTS_SELECTORS = [
    ".ytp-time-display.notranslate .ytp-time-wrapper .ytp-time-contents",
    ".ytp-time-display .ytp-time-contents",
    ".ytp-time-contents",
    ".ytp-time-display"
  ];
  function findTimeContents(doc) {
    for (const selector of TIME_CONTENTS_SELECTORS) {
      const found = doc.querySelector(selector);
      if (found !== null) return found;
    }
    return null;
  }
  var SPONSORBLOCK_SPAN_ID = "sponsorBlockDurationAfterSkips";
  function readSponsorSeconds(doc) {
    const span = doc.getElementById(SPONSORBLOCK_SPAN_ID);
    return span === null ? null : parseSponsorDuration(span.textContent);
  }
  var OWN_SPAN_ID = "ysd-duration";
  function ensureSpanLast(container) {
    let span = container.querySelector(`#${OWN_SPAN_ID}`);
    if (span === null) {
      span = container.ownerDocument.createElement("span");
      span.id = OWN_SPAN_ID;
      span.className = OWN_SPAN_ID;
    }
    if (container.lastElementChild !== span) container.appendChild(span);
    return span;
  }
  function isAdShowing(doc) {
    const player = doc.querySelector(".html5-video-player");
    if (player === null) return false;
    return player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting");
  }
  function isLiveStream(doc) {
    return doc.querySelector(".html5-video-player.ytp-live") !== null || doc.querySelector(".ytp-live-badge") !== null;
  }

  // src/content/controller.js
  var VIDEO_EVENTS = ["ratechange", "durationchange", "loadedmetadata", "timeupdate", "seeked"];
  function createController({ doc, store, now = Date.now }) {
    const teardown = [];
    const unbind = [];
    let boundContainer = null;
    function isOwnMutation(record) {
      const node = record.target;
      const element = node.nodeType === 1 ? node : node.parentElement;
      return element?.closest(`#${OWN_SPAN_ID}`) != null;
    }
    function render() {
      const container = findTimeContents(doc);
      const video = doc.querySelector("video");
      if (container === null || video === null) return;
      const { mode, hideAtNormalSpeed } = store.read();
      const text = computeDisplay({
        mode,
        hideAtNormalSpeed,
        playbackRate: video.playbackRate,
        duration: video.duration,
        currentTime: video.currentTime,
        sponsorSeconds: readSponsorSeconds(doc),
        isLive: isLiveStream(doc) || !Number.isFinite(video.duration),
        isAd: isAdShowing(doc),
        now: now()
      });
      const span = ensureSpanLast(container);
      if (span.textContent !== text) span.textContent = text;
    }
    function onClick(event) {
      if (event.target?.closest?.(`#${OWN_SPAN_ID}`) == null) return;
      event.preventDefault();
      event.stopPropagation();
      store.write({ mode: nextMode(store.read().mode) });
      render();
    }
    function releasePlayer() {
      while (unbind.length > 0) unbind.pop()();
      boundContainer = null;
    }
    function bindPlayer() {
      const container = findTimeContents(doc);
      const video = doc.querySelector("video");
      if (container === null || video === null) return false;
      for (const event of VIDEO_EVENTS) {
        video.addEventListener(event, render);
        unbind.push(() => video.removeEventListener(event, render));
      }
      container.addEventListener("click", onClick);
      unbind.push(() => container.removeEventListener("click", onClick));
      const observer = new MutationObserver((records) => {
        if (records.every(isOwnMutation)) return;
        render();
      });
      observer.observe(container, { childList: true, subtree: true, characterData: true });
      unbind.push(() => observer.disconnect());
      boundContainer = container;
      render();
      return true;
    }
    function syncPlayer() {
      if (boundContainer !== null && boundContainer.isConnected) return;
      releasePlayer();
      bindPlayer();
    }
    let syncQueued = false;
    function queueSync() {
      if (syncQueued) return;
      syncQueued = true;
      queueMicrotask(() => {
        syncQueued = false;
        syncPlayer();
      });
    }
    return {
      attach() {
        const bootstrap = new MutationObserver(queueSync);
        bootstrap.observe(doc.documentElement, { childList: true, subtree: true });
        teardown.push(() => bootstrap.disconnect());
        const unsubscribe = store.subscribe(render);
        if (typeof unsubscribe === "function") teardown.push(unsubscribe);
        syncPlayer();
      },
      detach() {
        releasePlayer();
        while (teardown.length > 0) teardown.pop()();
        doc.querySelector(`#${OWN_SPAN_ID}`)?.remove();
      }
    };
  }

  // src/settings.js
  var DEFAULTS = { mode: "total", hideAtNormalSpeed: true };
  function sanitize(value) {
    return {
      mode: MODES.includes(value.mode) ? value.mode : DEFAULTS.mode,
      hideAtNormalSpeed: Boolean(value.hideAtNormalSpeed)
    };
  }
  async function createStore(area) {
    let cache = sanitize({ ...DEFAULTS, ...await area.get(DEFAULTS) });
    const listeners = /* @__PURE__ */ new Set();
    function apply(patch) {
      cache = sanitize({ ...cache, ...patch });
      for (const listener of listeners) listener(cache);
    }
    area.onChanged.addListener((changes) => {
      const patch = Object.fromEntries(
        Object.entries(changes).filter(([key]) => key in DEFAULTS).map(([key, change]) => [key, change.newValue])
      );
      if (Object.keys(patch).length > 0) apply(patch);
    });
    return {
      read: () => cache,
      /** Wirkt sofort im Cache; die Speicherung laeuft nebenher. */
      write(patch) {
        apply(patch);
        return area.set(patch);
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  }

  // src/content/index.js
  function mark(state, detail) {
    const root = document.documentElement;
    root.dataset.ysd = state;
    if (detail !== void 0) root.dataset.ysdDetail = String(detail);
  }
  mark("boot");
  (async () => {
    try {
      const store = await createStore(chrome.storage.sync);
      createController({ doc: document, store }).attach();
      mark("ready");
    } catch (error) {
      mark("error", error?.message ?? error);
      console.error("[Speed Duration] Start fehlgeschlagen:", error);
    }
  })();
})();
