import { describe, it, expect } from "vitest";
import { youtubePlayer, withSponsorBlock } from "./fixtures.js";
import { findTimeContents, readSponsorSeconds, ensureSpanLast, isAdShowing, isLiveStream } from "../../src/content/dom.js";

describe("findTimeContents", () => {
  it("findet den Zeitcontainer im aktuellen YouTube-Markup", () => {
    const doc = youtubePlayer();
    expect(findTimeContents(doc)?.className).toBe("ytp-time-contents");
  });
});

describe("findTimeContents bei abweichendem Markup", () => {
  it("faellt auf .ytp-time-display zurueck, wenn der Wrapper fehlt", () => {
    const doc = youtubePlayer({ legacy: true });
    const container = findTimeContents(doc);
    expect(container).not.toBe(null);
    expect(container.querySelector(".ytp-time-duration").textContent).toBe("45:00");
  });

  it("liefert null statt zu werfen, wenn gar kein Player da ist", () => {
    document.body.innerHTML = "";
    expect(findTimeContents(document)).toBe(null);
  });
});

describe("readSponsorSeconds", () => {
  it("liest SponsorBlocks Zahl, wenn dessen Span da ist", () => {
    const doc = youtubePlayer();
    withSponsorBlock(doc, " (43:12)");
    expect(readSponsorSeconds(doc)).toBe(2592);
  });

  it("liefert null, wenn SponsorBlock fehlt oder nichts zu ueberspringen hat", () => {
    const doc = youtubePlayer();
    expect(readSponsorSeconds(doc)).toBe(null);
    withSponsorBlock(doc, "");
    expect(readSponsorSeconds(doc)).toBe(null);
  });
});

describe("ensureSpanLast", () => {
  it("legt den eigenen Span im Zeitcontainer an", () => {
    const doc = youtubePlayer();
    const container = findTimeContents(doc);
    const span = ensureSpanLast(container);
    expect(span.id).toBe("ysd-duration");
    expect(container.lastElementChild).toBe(span);
  });

  it("holt sich die letzte Position zurueck, wenn SponsorBlock nach uns anhaengt", () => {
    const doc = youtubePlayer();
    const container = findTimeContents(doc);
    const span = ensureSpanLast(container);
    withSponsorBlock(doc); // SponsorBlock macht appendChild und ueberholt uns

    expect(ensureSpanLast(container)).toBe(span); // derselbe Knoten, nicht neu erzeugt
    expect(container.lastElementChild).toBe(span);
    expect(container.querySelectorAll("#ysd-duration")).toHaveLength(1);
  });

  it("laesst SponsorBlocks Knoten unangetastet", () => {
    const doc = youtubePlayer();
    const sb = withSponsorBlock(doc, " (43:12)");
    ensureSpanLast(findTimeContents(doc));
    expect(sb.textContent).toBe(" (43:12)");
    expect(sb.isConnected).toBe(true);
  });
});

describe("isAdShowing", () => {
  it("erkennt eine laufende Werbeeinblendung am Player", () => {
    const doc = youtubePlayer();
    expect(isAdShowing(doc)).toBe(false);
    doc.querySelector(".html5-video-player").classList.add("ad-showing");
    expect(isAdShowing(doc)).toBe(true);
  });

  it("erkennt auch die Uebergangsphase ad-interrupting", () => {
    const doc = youtubePlayer();
    doc.querySelector(".html5-video-player").classList.add("ad-interrupting");
    expect(isAdShowing(doc)).toBe(true);
  });

  it("meldet keine Werbung, wenn gar kein Player da ist", () => {
    document.body.innerHTML = "";
    expect(isAdShowing(document)).toBe(false);
  });
});

describe("isLiveStream", () => {
  it("erkennt einen Live-Stream am Player, auch wenn die Dauer endlich ist", () => {
    // Mit DVR liefert video.duration eine endliche, wachsende Zahl —
    // der Infinity-Test allein reicht dort nicht.
    const doc = youtubePlayer();
    expect(isLiveStream(doc)).toBe(false);
    doc.querySelector(".html5-video-player").classList.add("ytp-live");
    expect(isLiveStream(doc)).toBe(true);
  });

  it("erkennt ihn auch am Live-Badge in den Bedienelementen", () => {
    const doc = youtubePlayer();
    const badge = doc.createElement("button");
    badge.className = "ytp-live-badge";
    doc.querySelector(".ytp-chrome-bottom").append(badge);
    expect(isLiveStream(doc)).toBe(true);
  });
});
