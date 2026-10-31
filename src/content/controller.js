import { computeDisplay } from "../core/compute.js";
import { nextMode } from "../core/modes.js";
import {
  findTimeContents, readSponsorSeconds, ensureSpanLast, isAdShowing, isLiveStream, OWN_SPAN_ID,
} from "./dom.js";

/** Player-Ereignisse, die die Anzeige veralten lassen. */
const VIDEO_EVENTS = ["ratechange", "durationchange", "loadedmetadata", "timeupdate", "seeked"];

/**
 * Verdrahtet Player-Ereignisse mit `computeDisplay` und schreibt das Ergebnis
 * in den eigenen Span.
 *
 * Robust gegen zwei Dinge, die auf YouTube normal sind: der Player existiert beim
 * Start noch nicht, und er wird bei SPA-Navigation neu gebaut.
 *
 * @param doc   Das Dokument des Players.
 * @param store Einstellungen: { read(), write(patch), subscribe(cb) }.
 * @param now   Uhr, injiziert.
 * @param endsAtPrefix Wort vor der Endzeit in der aktiven Sprache.
 */
export function createController({ doc, store, now = Date.now, endsAtPrefix }) {
  /** Aufraeumfunktionen des dauerhaften Teils (Bootstrap, Store-Abo). */
  const teardown = [];
  /** Aufraeumfunktionen der Bindung an den aktuellen Player. */
  const unbind = [];
  let boundContainer = null;

  /** Stammt diese Mutation aus unserem eigenen Schreibvorgang? */
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
      now: now(),
      endsAtPrefix,
    });

    const span = ensureSpanLast(container);
    if (span.textContent !== text) span.textContent = text;
  }

  function onClick(event) {
    if (event.target?.closest?.(`#${OWN_SPAN_ID}`) == null) return;
    // Sonst pausiert YouTube das Video, weil der Klick den Player erreicht.
    event.preventDefault();
    event.stopPropagation();
    store.write({ mode: nextMode(store.read().mode) });
    render();
  }

  function releasePlayer() {
    while (unbind.length > 0) unbind.pop()();
    boundContainer = null;
  }

  /** Bindet an den aktuellen Player. Gibt zurueck, ob einer da war. */
  function bindPlayer() {
    const container = findTimeContents(doc);
    const video = doc.querySelector("video");
    if (container === null || video === null) return false;

    for (const event of VIDEO_EVENTS) {
      video.addEventListener(event, render);
      unbind.push(() => video.removeEventListener(event, render));
    }

    // Klick delegiert am Zeitcontainer, damit der Handler einen Neuaufbau
    // des eigenen Spans ueberlebt.
    container.addEventListener("click", onClick);
    unbind.push(() => container.removeEventListener("click", onClick));

    // SponsorBlock aktualisiert seine Zahl und haengt seinen Span nachtraeglich
    // an — beides sehen wir nur ueber das DOM.
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

  /** Bindet neu, wenn der Player fehlt oder ausgetauscht wurde. */
  function syncPlayer() {
    if (boundContainer !== null && boundContainer.isConnected) return;
    releasePlayer();
    bindPlayer();
  }

  // YouTube mutiert den Seitenbaum im Sekundentakt. Ohne Buendelung liefe die
  // Player-Suche pro Mutationsschub, auf Seiten ganz ohne Player sogar dauerhaft.
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
    },
  };
}
