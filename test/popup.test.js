import { describe, it, expect, beforeEach } from "vitest";
import { fakeStore } from "./content/fixtures.js";
import { bindPopup } from "../src/popup/popup.js";
import { MODES } from "../src/core/modes.js";

const messages = {
  endsAtPrefix: "done",
  modeLabels: { total: "Total duration", remaining: "Time remaining", endsAt: "End time" },
  hideAtNormalSpeed: "Hide at 1x",
  defaultModeLegend: "Default mode",
  hint: "Click to switch.",
};

beforeEach(() => {
  document.body.innerHTML = `<form id="ysd-popup"></form>`;
});

const form = () => document.querySelector("#ysd-popup");
const radio = (mode) => form().querySelector(`input[name="mode"][value="${mode}"]`);

describe("bindPopup", () => {
  it("bietet jeden Modus mit dem uebergebenen Namen an", () => {
    bindPopup(form(), fakeStore(), messages);
    for (const mode of MODES) {
      expect(radio(mode)).not.toBe(null);
      expect(form().textContent).toContain(messages.modeLabels[mode]);
    }
  });

  it("zeigt Option, Legende und Hinweis in den uebergebenen Texten", () => {
    bindPopup(form(), fakeStore(), messages);
    expect(form().textContent).toContain("Hide at 1x");
    expect(form().textContent).toContain("Default mode");
    expect(form().textContent).toContain("Click to switch.");
  });

  it("zeigt den gespeicherten Zustand", () => {
    bindPopup(form(), fakeStore({ mode: "endsAt", hideAtNormalSpeed: false }), messages);
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
    bindPopup(form(), store, messages);

    check(radio("endsAt"));

    expect(store.writes).toEqual([{ mode: "endsAt" }]);
  });

  it("speichert die Ausblenden-Option", () => {
    const store = fakeStore({ hideAtNormalSpeed: true });
    bindPopup(form(), store, messages);

    const hide = form().querySelector('input[name="hideAtNormalSpeed"]');
    hide.checked = false;
    hide.dispatchEvent(new Event("change", { bubbles: true }));

    expect(store.writes).toEqual([{ hideAtNormalSpeed: false }]);
  });
});
