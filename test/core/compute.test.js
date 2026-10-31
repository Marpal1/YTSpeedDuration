import { describe, it, expect } from "vitest";
import { computeDisplay } from "../../src/core/compute.js";

/** Vollständiger Zustand; einzelne Felder werden pro Test überschrieben. */
const state = (overrides) => ({
  mode: "total",
  playbackRate: 1,
  duration: 2700, // 45:00
  currentTime: 0,
  sponsorSeconds: null,
  isLive: false,
  isAd: false,
  hideAtNormalSpeed: true,
  endsAtPrefix: "fertig",
  now: Date.parse("2026-09-05T20:00:00"),
  ...overrides,
});

describe("Modus total", () => {
  it("teilt die Rohdauer durch die Speed und hängt den Speed-Marker an", () => {
    expect(computeDisplay(state({ playbackRate: 1.5 }))).toBe("(30:00 @1.5x)");
  });
});

describe("Modus total mit SponsorBlock", () => {
  it("rechnet auf der SB-Dauer statt auf der Rohdauer", () => {
    // 45:00 roh, SponsorBlock meldet 43:12 -> 43:12 / 1.5 = 28:48
    const text = computeDisplay(state({ playbackRate: 1.5, sponsorSeconds: 2592 }));
    expect(text).toBe("(28:48 @1.5x)");
  });
});

describe("Modus total bei normaler Geschwindigkeit", () => {
  it("zeigt nichts, weil die Zahl dann nur YouTubes Dauer wiederholt", () => {
    expect(computeDisplay(state({ playbackRate: 1 }))).toBe("");
  });

  it("zeigt sie trotzdem, wenn die Option abgeschaltet ist", () => {
    expect(computeDisplay(state({ playbackRate: 1, hideAtNormalSpeed: false })))
      .toBe("(45:00 @1x)");
  });
});

describe("Modus remaining", () => {
  it("rechnet die verbleibende reale Sitzzeit ab der aktuellen Position", () => {
    // 45:00 lang, bei 12:34, Rest 32:26 roh -> bei 1.5x noch 21:37
    const text = computeDisplay(state({
      mode: "remaining",
      playbackRate: 1.5,
      currentTime: 754,
    }));
    expect(text).toBe("(21:38 @1.5x)");
  });

  it("zeigt auch bei 1.0x etwas, denn dort ist die Restzeit keine Wiederholung", () => {
    const text = computeDisplay(state({ mode: "remaining", currentTime: 754 }));
    expect(text).toBe("(32:26 @1x)");
  });
});

describe("Unschärfe-Marker im Modus remaining", () => {
  it("markiert die Restzeit mit ~, wenn SponsorBlock aktiv ist", () => {
    // SBs Zahl nennt nur alle Skips zusammen, nicht die noch bevorstehenden.
    // Die Restzeit ist deshalb bewusst ohne Skip-Abzug gerechnet und als unscharf markiert.
    const text = computeDisplay(state({
      mode: "remaining",
      playbackRate: 1.5,
      currentTime: 754,
      sponsorSeconds: 2592,
    }));
    expect(text).toBe("(~21:38 @1.5x)");
  });

  it("markiert im Modus total nicht — dort ist die SB-Dauer exakt", () => {
    const text = computeDisplay(state({ playbackRate: 1.5, sponsorSeconds: 2592 }));
    expect(text).toBe("(28:48 @1.5x)");
  });
});

describe("Modus endsAt", () => {
  it("nennt die Uhrzeit, zu der das Video zu Ende ist, minutengenau", () => {
    // 20:00 Uhr, Rest 21:38 bei 1.5x -> 20:21:38 -> gerundet 20:22
    const text = computeDisplay(state({
      mode: "endsAt",
      playbackRate: 1.5,
      currentTime: 754,
    }));
    expect(text).toBe("(fertig 20:22)");
  });

  it("schreibt die Uhrzeit zweistellig", () => {
    const text = computeDisplay(state({
      mode: "endsAt",
      currentTime: 2400, // Rest 5:00 -> 20:05
      now: Date.parse("2026-09-05T09:00:00"),
    }));
    expect(text).toBe("(fertig 09:05)");
  });

  it("nimmt das Praefix der aktiven Sprache", () => {
    const text = computeDisplay(state({
      mode: "endsAt",
      currentTime: 2400,
      endsAtPrefix: "done",
      now: Date.parse("2026-09-05T09:00:00"),
    }));
    expect(text).toBe("(done 09:05)");
  });
});

describe("Situationen ohne verwertbare Dauer", () => {
  const cases = [
    ["während einer Werbeeinblendung gehört die Dauer dem Spot", { isAd: true }],
    ["Live-Streams haben keine Enddauer", { isLive: true, duration: Infinity }],
    ["vor loadedmetadata ist die Dauer NaN", { duration: NaN }],
    ["eine Dauer von 0 ergibt keine sinnvolle Zahl", { duration: 0 }],
    ["Speed 0 wäre eine Division durch null", { playbackRate: 0 }],
  ];

  for (const [reason, overrides] of cases) {
    it(`zeigt nichts an, denn ${reason}`, () => {
      for (const mode of ["total", "remaining", "endsAt"]) {
        expect(computeDisplay(state({ mode, hideAtNormalSpeed: false, ...overrides })))
          .toBe("");
      }
    });
  }
});
