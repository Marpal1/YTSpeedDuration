import { describe, it, expect, beforeEach } from "vitest";
import { fakeStore } from "./content/fixtures.js";
import { bindPopup } from "../src/popup/popup.js";
import { MODES } from "../src/core/modes.js";
import { messages } from "../src/core/messages.js";

beforeEach(() => {
  document.body.innerHTML = `<form id="ysd-popup"></form>`;
});

const form = () => document.querySelector("#ysd-popup");
const radio = (mode) => form().querySelector(`input[name="mode"][value="${mode}"]`);

describe("bindPopup", () => {
  it("bietet jeden Modus mit seinem deutschen Namen an", () => {
    bindPopup(form(), fakeStore());
    for (const mode of MODES) {
      expect(radio(mode)).not.toBe(null);
      expect(form().textContent).toContain(messages.modeLabels[mode]);
    }
  });

  it("zeigt den gespeicherten Zustand", () => {
    bindPopup(form(), fakeStore({ mode: "endsAt", hideAtNormalSpeed: false }));
    expect(radio("endsAt").checked).toBe(true);
    expect(form().querySelector('input[name="hideAtNormalSpeed"]').checked).toBe(false);
  });
});

describe("Aenderungen im Popup", () => {
  const check = (input) => {
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  it("speichert einen gewechselten Modus", () => {
    const store = fakeStore({ mode: "total" });
    bindPopup(form(), store);

    check(radio("endsAt"));

    expect(store.writes).toEqual([{ mode: "endsAt" }]);
  });

  it("speichert die Ausblenden-Option", () => {
    const store = fakeStore({ hideAtNormalSpeed: true });
    bindPopup(form(), store);

    const hide = form().querySelector('input[name="hideAtNormalSpeed"]');
    hide.checked = false;
    hide.dispatchEvent(new Event("change", { bubbles: true }));

    expect(store.writes).toEqual([{ hideAtNormalSpeed: false }]);
  });
});
