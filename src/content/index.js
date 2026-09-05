/*
 * Einstiegspunkt des Content-Scripts.
 *
 * Wird von `npm run build` nach `dist/content.js` gebuendelt — siehe ADR 0002.
 * Der frueher hier verwendete dynamische Import scheiterte in Chromium 130+ an
 * der CSP der Seite, ohne dass irgendetwas erschien.
 *
 * Das Content-Script laeuft auf ganz youtube.com, nicht nur auf /watch: YouTube
 * navigiert als SPA, ein spaeter Wechsel auf ein Video wuerde sonst nie injiziert.
 * Der Controller wartet selbst darauf, dass ein Player erscheint.
 */
import { createController } from "./controller.js";
import { createStore } from "../settings.js";

/**
 * Zustandsmarker am <html>-Element. Nur zur Fehlersuche von aussen —
 * `tools/check-selectors.js` liest sie. Kostet nichts und beantwortet die
 * wichtigste Frage sofort: ist das Content-Script ueberhaupt angekommen?
 */
function mark(state, detail) {
  const root = document.documentElement;
  root.dataset.ysd = state;
  if (detail !== undefined) root.dataset.ysdDetail = String(detail);
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
