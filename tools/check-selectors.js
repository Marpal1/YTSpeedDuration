/*
 * Diagnose am echten Player.
 *
 * Anwendung: YouTube-Video oeffnen, DevTools-Konsole (F12), dieses Snippet
 * einfuegen, Enter. Es veraendert nichts.
 *
 * Beantwortet zwei Fragen getrennt:
 *   1. Ist das Content-Script ueberhaupt angekommen?  (data-ysd am <html>)
 *   2. Findet es den Zeitcontainer?                    (Selektorkette)
 */
(() => {
  const chain = [
    ".ytp-time-display.notranslate .ytp-time-wrapper .ytp-time-contents",
    ".ytp-time-display .ytp-time-contents",
    ".ytp-time-contents",
    ".ytp-time-display",
  ];

  const hit = chain.find((selector) => document.querySelector(selector) !== null);
  const container = hit ? document.querySelector(hit) : null;
  const sb = document.getElementById("sponsorBlockDurationAfterSkips");
  const video = document.querySelector("video");
  const state = document.documentElement.dataset.ysd;

  console.table({
    "1) Content-Script": state ?? "— nie gestartet —",
    "1) Fehlermeldung": document.documentElement.dataset.ysdDetail ?? "—",
    "1) eigener Span": document.getElementById("ysd-duration")?.textContent ?? "— nicht da —",
    "2) Zeitcontainer gefunden": Boolean(container),
    "2) getroffener Selektor": hit ?? "— keiner —",
    "2) Position in der Kette": hit ? chain.indexOf(hit) + 1 : "—",
    "2) Kinder des Containers": container
      ? [...container.children].map((el) => el.className || el.id).join(" | ")
      : "—",
    "SponsorBlock aktiv": Boolean(sb),
    "SponsorBlock-Text": sb ? JSON.stringify(sb.textContent) : "—",
    "video.duration": video?.duration,
    "video.playbackRate": video?.playbackRate,
    "Werbung laeuft": Boolean(
      document.querySelector(".html5-video-player.ad-showing, .html5-video-player.ad-interrupting"),
    ),
    "Live-Stream": Boolean(
      document.querySelector(".html5-video-player.ytp-live, .ytp-live-badge"),
    ),
  });

  if (state === undefined) {
    console.error(
      "Das Content-Script ist nie gestartet. Pruefen: Erweiterung aktiv? Tab nach der "
      + "Installation neu geladen? Fehler auf der Karte in brave://extensions?",
    );
  } else if (state === "error") {
    console.error("Start abgebrochen:", document.documentElement.dataset.ysdDetail);
  } else if (state === "boot") {
    console.error("Start haengt zwischen boot und ready — createStore hat nicht geantwortet.");
  } else if (hit === chain[0]) {
    console.log("%c OK — Script laeuft, erster Selektor trifft.", "color:#0a0");
  } else if (hit) {
    console.warn(`Script laeuft, aber Fallback ${chain.indexOf(hit) + 1} greift. Bitte melden.`);
  } else {
    console.error("Kein Zeitcontainer gefunden — YouTube hat das Markup umgebaut.");
  }
})();
