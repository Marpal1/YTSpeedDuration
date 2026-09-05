/**
 * Einstellungen auf `chrome.storage.sync`, hinter einer synchronen Schnittstelle.
 *
 * Der Controller rendert bei jedem `timeupdate` — er kann nicht auf ein Promise
 * warten. Deshalb haelt der Store einen Cache, der beim Erzeugen einmal gefuellt
 * und danach ueber `onChanged` aktuell gehalten wird.
 */

import { MODES } from "./core/modes.js";

export const DEFAULTS = { mode: "total", hideAtNormalSpeed: true };

/** Haelt Werte im vertraglichen Rahmen — Storage ist von aussen beschreibbar. */
function sanitize(value) {
  return {
    mode: MODES.includes(value.mode) ? value.mode : DEFAULTS.mode,
    hideAtNormalSpeed: Boolean(value.hideAtNormalSpeed),
  };
}

/**
 * @param area Ein `chrome.storage`-Bereich (`get`, `set`, `onChanged`).
 * @returns {Promise<{read, write, subscribe}>}
 */
export async function createStore(area) {
  let cache = sanitize({ ...DEFAULTS, ...(await area.get(DEFAULTS)) });
  const listeners = new Set();

  function apply(patch) {
    cache = sanitize({ ...cache, ...patch });
    for (const listener of listeners) listener(cache);
  }

  area.onChanged.addListener((changes) => {
    const patch = Object.fromEntries(
      Object.entries(changes)
        .filter(([key]) => key in DEFAULTS)
        .map(([key, change]) => [key, change.newValue]),
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
    },
  };
}
