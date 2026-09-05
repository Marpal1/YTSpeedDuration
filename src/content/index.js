/*
 * Einstiegspunkt des Content-Scripts.
 *
 * MV3-Content-Scripts kennen kein `"type": "module"`, deshalb ist diese Datei ein
 * klassisches Script, das die eigentlichen ES-Module nachlaedt. Sie stehen in
 * `web_accessible_resources`. Dadurch laeuft im Browser exakt derselbe Code, den
 * auch Vitest importiert — es gibt keinen Build-Schritt, der dazwischen etwas
 * anderes erzeugen koennte.
 *
 * Das Content-Script laeuft auf ganz youtube.com, nicht nur auf /watch: YouTube
 * navigiert als SPA, ein spaeter Wechsel auf ein Video wuerde sonst nie injiziert.
 * Der Controller wartet selbst darauf, dass ein Player erscheint.
 */
(async () => {
  try {
    const load = (path) => import(chrome.runtime.getURL(path));
    const [{ createController }, { createStore }] = await Promise.all([
      load("src/content/controller.js"),
      load("src/settings.js"),
    ]);

    const store = await createStore(chrome.storage.sync);
    createController({ doc: document, store }).attach();
  } catch (error) {
    console.error("[Speed Duration] Start fehlgeschlagen:", error);
  }
})();
