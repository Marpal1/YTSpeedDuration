/*
 * Gegenprobe der Selektoren am echten Player.
 *
 * Ersetzt den automatisierten Browser-Check, der beim Bau nicht laufen konnte.
 * Anwendung: YouTube-Video oeffnen, DevTools-Konsole (F12), dieses Snippet
 * einfuegen, Enter. Es veraendert nichts.
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

  console.table({
    "Zeitcontainer gefunden": Boolean(container),
    "getroffener Selektor": hit ?? "— keiner —",
    "Position in der Kette": hit ? chain.indexOf(hit) + 1 : "—",
    "Kinder des Containers": container
      ? [...container.children].map((el) => el.className || el.id).join(" | ")
      : "—",
    "SponsorBlock aktiv": Boolean(sb),
    "SponsorBlock-Text": sb ? JSON.stringify(sb.textContent) : "—",
    "video.duration": video?.duration,
    "video.playbackRate": video?.playbackRate,
    "Werbung laeuft": Boolean(
      document.querySelector(".html5-video-player.ad-showing, .html5-video-player.ad-interrupting"),
    ),
  });

  if (hit === chain[0]) {
    console.log("%c OK — der erste Selektor trifft, wie erwartet.", "color:#0a0");
  } else if (hit) {
    console.warn(`Fallback ${chain.indexOf(hit) + 1} greift. Funktioniert, aber melden.`);
  } else {
    console.error("Kein Zeitcontainer gefunden — YouTube hat das Markup umgebaut.");
  }
})();
