import { describe, it, expect, afterEach } from "vitest";
import { youtubePlayer, withSponsorBlock, setVideo, fakeStore } from "./fixtures.js";
import { createController } from "../../src/content/controller.js";

let controller = null;
const start = (doc, store, now = () => Date.parse("2026-09-05T20:00:00")) => {
  controller = createController({ doc, store, now });
  controller.attach();
  return controller;
};
const shownText = (doc) => doc.querySelector("#ysd-duration")?.textContent;

afterEach(() => {
  controller?.detach();
  controller = null;
});

describe("attach", () => {
  it("haengt die berechnete Zeit in den Player", () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    start(doc, fakeStore());
    expect(shownText(doc)).toBe("(30:00 @1.5x)");
  });
});

describe("Reaktion auf den Player", () => {
  it("rechnet neu, wenn die Geschwindigkeit sich aendert", () => {
    const doc = youtubePlayer();
    const video = setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    start(doc, fakeStore());

    video.playbackRate = 2;
    video.dispatchEvent(new Event("ratechange"));

    expect(shownText(doc)).toBe("(22:30 @2x)");
  });

  it("rechnet neu, wenn die Dauer erst nach loadedmetadata bekannt wird", () => {
    const doc = youtubePlayer();
    const video = setVideo(doc, { duration: NaN, playbackRate: 1.5 });
    start(doc, fakeStore());
    expect(shownText(doc)).toBe("");

    video.duration = 2700;
    video.dispatchEvent(new Event("durationchange"));

    expect(shownText(doc)).toBe("(30:00 @1.5x)");
  });
});

describe("Koexistenz mit SponsorBlock", () => {
  it("uebernimmt SBs Zahl, sobald SponsorBlock sie nachtraegt, und bleibt rechts davon", async () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    start(doc, fakeStore());
    expect(shownText(doc)).toBe("(30:00 @1.5x)");

    // SponsorBlock startet spaeter und macht appendChild — es ueberholt uns.
    withSponsorBlock(doc, " (43:12)");
    await new Promise((resolve) => setTimeout(resolve, 0)); // MutationObserver ist async

    const container = doc.querySelector(".ytp-time-contents");
    expect(shownText(doc)).toBe("(28:48 @1.5x)");
    expect(container.lastElementChild.id).toBe("ysd-duration");
  });

  it("veraendert SponsorBlocks Knoten nicht", async () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    const sb = withSponsorBlock(doc, " (43:12)");
    start(doc, fakeStore());
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sb.textContent).toBe(" (43:12)");
    expect(sb.isConnected).toBe(true);
  });
});

describe("Modus per Klick", () => {
  it("schaltet bei jedem Klick auf die Zahl einen Modus weiter", () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, currentTime: 754, playbackRate: 1.5 });
    const store = fakeStore({ mode: "total" });
    start(doc, store);

    const span = doc.querySelector("#ysd-duration");
    expect(span.textContent).toBe("(30:00 @1.5x)");

    span.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(span.textContent).toBe("(21:38 @1.5x)");

    span.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(span.textContent).toBe("(fertig 20:22)");

    span.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(span.textContent).toBe("(30:00 @1.5x)");
  });

  it("merkt sich den Modus ueber den Store", () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    const store = fakeStore({ mode: "total" });
    start(doc, store);

    doc.querySelector("#ysd-duration")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(store.writes).toEqual([{ mode: "remaining" }]);
  });

  it("laesst den Klick nicht zum Player durch — der wuerde sonst pausieren", () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    start(doc, fakeStore());

    let reachedPlayer = false;
    doc.querySelector("#movie_player").addEventListener("click", () => { reachedPlayer = true; });
    doc.querySelector("#ysd-duration")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(reachedPlayer).toBe(false);
  });
});

describe("detach", () => {
  it("entfernt den eigenen Span und reagiert danach nicht mehr", () => {
    const doc = youtubePlayer();
    const video = setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    const sb = withSponsorBlock(doc, " (43:12)");
    start(doc, fakeStore());
    expect(doc.querySelector("#ysd-duration")).not.toBe(null);

    controller.detach();

    expect(doc.querySelector("#ysd-duration")).toBe(null);
    expect(sb.isConnected).toBe(true); // SponsorBlock bleibt unberuehrt

    video.playbackRate = 2;
    video.dispatchEvent(new Event("ratechange"));
    expect(doc.querySelector("#ysd-duration")).toBe(null);
  });
});

describe("Start vor dem Player", () => {
  it("wartet auf den Player und haengt sich an, sobald er da ist", async () => {
    document.body.innerHTML = ""; // Content-Script laeuft, Player fehlt noch
    start(document, fakeStore());
    expect(shownText(document)).toBe(undefined);

    youtubePlayer();
    setVideo(document, { duration: 2700, playbackRate: 1.5 });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(shownText(document)).toBe("(30:00 @1.5x)");
  });
});

describe("SPA-Navigation", () => {
  it("bindet sich an den neu gebauten Player des naechsten Videos", async () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, playbackRate: 1.5 });
    start(doc, fakeStore());
    expect(shownText(doc)).toBe("(30:00 @1.5x)");

    youtubePlayer({ duration: "10:00" }); // YouTube baut den Player neu auf
    setVideo(doc, { duration: 600, playbackRate: 1.5 });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(shownText(doc)).toBe("(6:40 @1.5x)");
  });
});

describe("Aenderung aus dem Popup", () => {
  it("uebernimmt einen im Popup gewechselten Standard-Modus sofort", () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, currentTime: 754, playbackRate: 1.5 });
    const store = fakeStore({ mode: "total" });
    start(doc, store);
    expect(shownText(doc)).toBe("(30:00 @1.5x)");

    store.write({ mode: "remaining" }); // so meldet sich das Popup

    expect(shownText(doc)).toBe("(21:38 @1.5x)");
  });

  it("uebernimmt das Abschalten von 'bei 1x ausblenden'", () => {
    const doc = youtubePlayer();
    setVideo(doc, { duration: 2700, playbackRate: 1 });
    const store = fakeStore({ hideAtNormalSpeed: true });
    start(doc, store);
    expect(shownText(doc)).toBe("");

    store.write({ hideAtNormalSpeed: false });

    expect(shownText(doc)).toBe("(45:00 @1x)");
  });
});
