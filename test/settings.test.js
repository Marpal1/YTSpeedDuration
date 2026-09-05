import { describe, it, expect } from "vitest";
import { createStore, DEFAULTS } from "../src/settings.js";

/** Nachbau von chrome.storage.sync — dieselbe Schnittstelle, im Speicher. */
function fakeArea(initial = {}) {
  let data = { ...initial };
  const listeners = new Set();
  return {
    sets: [],
    async get(defaults) {
      return { ...defaults, ...data };
    },
    async set(patch) {
      this.sets.push(patch);
      const changes = Object.fromEntries(
        Object.entries(patch).map(([key, value]) => [key, { oldValue: data[key], newValue: value }]),
      );
      data = { ...data, ...patch };
      for (const listener of listeners) listener(changes);
    },
    onChanged: {
      addListener: (fn) => listeners.add(fn),
      removeListener: (fn) => listeners.delete(fn),
    },
  };
}

describe("createStore", () => {
  it("liest die Defaults, wenn noch nichts gespeichert ist", async () => {
    const store = await createStore(fakeArea());
    expect(store.read()).toEqual(DEFAULTS);
  });

  it("liest gespeicherte Werte", async () => {
    const store = await createStore(fakeArea({ mode: "endsAt", hideAtNormalSpeed: false }));
    expect(store.read()).toEqual({ mode: "endsAt", hideAtNormalSpeed: false });
  });
});

describe("Schreiben", () => {
  it("wirkt sofort, ohne auf die Speicherung zu warten", async () => {
    const area = fakeArea();
    const store = await createStore(area);

    store.write({ mode: "remaining" });

    expect(store.read().mode).toBe("remaining"); // synchron, nicht erst nach await
    expect(area.sets).toEqual([{ mode: "remaining" }]);
  });

  it("zieht nach, wenn ein anderer Tab die Einstellung aendert", async () => {
    const area = fakeArea();
    const store = await createStore(area);
    const seen = [];
    store.subscribe((value) => seen.push(value.mode));

    await area.set({ mode: "endsAt" }); // anderer Tab bzw. Popup

    expect(store.read().mode).toBe("endsAt");
    expect(seen).toContain("endsAt");
  });

  it("meldet sich beim Aufraeumen wieder ab", async () => {
    const area = fakeArea();
    const store = await createStore(area);
    const seen = [];
    const unsubscribe = store.subscribe((value) => seen.push(value.mode));

    unsubscribe();
    await area.set({ mode: "endsAt" });

    expect(seen).toEqual([]);
  });
});

describe("Unbrauchbare gespeicherte Werte", () => {
  it("faellt auf den Standard-Modus zurueck statt einen unbekannten zu uebernehmen", async () => {
    // Kann nach einem Downgrade oder einem fremden Schreibzugriff passieren.
    const store = await createStore(fakeArea({ mode: "irgendwas" }));
    expect(store.read().mode).toBe(DEFAULTS.mode);
  });

  it("verwirft auch einen unbekannten Modus aus onChanged", async () => {
    const area = fakeArea();
    const store = await createStore(area);
    await area.set({ mode: "irgendwas" });
    expect(store.read().mode).toBe(DEFAULTS.mode);
  });
});
