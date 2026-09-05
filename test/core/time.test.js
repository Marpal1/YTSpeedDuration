import { describe, it, expect } from "vitest";
import { formatClock, parseSponsorDuration } from "../../src/core/time.js";

describe("formatClock", () => {
  it("formatiert Sekunden wie YouTube: M:SS, ohne führende Null bei den Minuten", () => {
    expect(formatClock(7)).toBe("0:07");
    expect(formatClock(123)).toBe("2:03");
    expect(formatClock(600)).toBe("10:00");
  });
});

describe("formatClock ab einer Stunde", () => {
  it("schaltet auf H:MM:SS um und füllt die Minuten auf zwei Stellen", () => {
    expect(formatClock(3600)).toBe("1:00:00");
    expect(formatClock(3723)).toBe("1:02:03");
    expect(formatClock(36000)).toBe("10:00:00");
  });
});

describe("parseSponsorDuration", () => {
  it("liest die SB-Dauer aus SponsorBlocks Spantext", () => {
    // SponsorBlock schreibt exakt " (" + zeit + ")", mit führendem Leerzeichen.
    expect(parseSponsorDuration(" (43:12)")).toBe(43 * 60 + 12);
    expect(parseSponsorDuration(" (1:02:03)")).toBe(3723);
  });
});

describe("parseSponsorDuration ohne verwertbaren Text", () => {
  it("liefert null, statt eine Zahl zu erfinden", () => {
    expect(parseSponsorDuration("")).toBe(null);      // SB da, aber nichts zu skippen
    expect(parseSponsorDuration(null)).toBe(null);    // SB gar nicht installiert
    expect(parseSponsorDuration(" (Sponsor)")).toBe(null);
    expect(parseSponsorDuration("43:12")).toBe(null); // ohne Klammern nicht SBs Format
  });
});
