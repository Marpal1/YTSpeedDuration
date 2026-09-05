import { parseSponsorDuration } from "../core/time.js";

/**
 * Die einzige Stelle, die YouTubes und SponsorBlocks DOM kennt.
 *
 * Koexistenz-Regeln, die hier gelten:
 *   - fremde Knoten werden ausschliesslich gelesen, nie geschrieben
 *   - erzeugt wird nur der eigene Span mit `ysd-`-Praefix
 *   - kein innerHTML am Zeitcontainer
 */

/**
 * Selektorkette fuer den Zeitcontainer, spezifisch zuerst.
 * Die erste Variante stammt aus SponsorBlocks `showTimeWithoutSkips` und ist die,
 * die SponsorBlock heute produktiv trifft. Die weiteren fangen aeltere bzw.
 * kuenftige Markup-Varianten ab — YouTube baut die Zeitanzeige gelegentlich um.
 */
const TIME_CONTENTS_SELECTORS = [
  ".ytp-time-display.notranslate .ytp-time-wrapper .ytp-time-contents",
  ".ytp-time-display .ytp-time-contents",
  ".ytp-time-contents",
  ".ytp-time-display",
];

/** Findet den Zeitcontainer im Player, oder null wenn kein Player da ist. */
export function findTimeContents(doc) {
  for (const selector of TIME_CONTENTS_SELECTORS) {
    const found = doc.querySelector(selector);
    if (found !== null) return found;
  }
  return null;
}

/** SponsorBlocks Span. Wird nur gelesen — SponsorBlock ueberschreibt ihn selbst laufend. */
const SPONSORBLOCK_SPAN_ID = "sponsorBlockDurationAfterSkips";

/**
 * Liest die SB-Dauer.
 * @returns {number|null} Sekunden, oder null wenn SponsorBlock fehlt oder
 *                        fuer dieses Video nichts zu ueberspringen hat.
 */
export function readSponsorSeconds(doc) {
  const span = doc.getElementById(SPONSORBLOCK_SPAN_ID);
  return span === null ? null : parseSponsorDuration(span.textContent);
}

/** Der einzige Knoten, den diese Extension erzeugt. */
export const OWN_SPAN_ID = "ysd-duration";

/**
 * Legt den eigenen Span an bzw. haengt ihn neu an, falls er nicht mehr letztes
 * Kind ist. SponsorBlock macht `appendChild` und ueberholt uns dabei — unsere Zahl
 * korrigiert dessen Zahl und gehoert deshalb rechts davon.
 */
export function ensureSpanLast(container) {
  let span = container.querySelector(`#${OWN_SPAN_ID}`);
  if (span === null) {
    span = container.ownerDocument.createElement("span");
    span.id = OWN_SPAN_ID;
    span.className = OWN_SPAN_ID;
  }
  if (container.lastElementChild !== span) container.appendChild(span);
  return span;
}

/**
 * Laeuft gerade eine Werbeeinblendung? Dann gehoert `video.duration` dem Spot
 * und jede daraus abgeleitete Zahl waere schlicht falsch.
 */
export function isAdShowing(doc) {
  const player = doc.querySelector(".html5-video-player");
  if (player === null) return false;
  return player.classList.contains("ad-showing")
    || player.classList.contains("ad-interrupting");
}

/**
 * Laeuft ein Live-Stream? `video.duration` allein reicht nicht: mit DVR liefert
 * YouTube dort eine endliche, staendig wachsende Zahl.
 */
export function isLiveStream(doc) {
  return doc.querySelector(".html5-video-player.ytp-live") !== null
    || doc.querySelector(".ytp-live-badge") !== null;
}
