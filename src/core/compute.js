import { formatClock } from "./time.js";
import { messages } from "./messages.js";

/** Speed als Anzeigetext: 1.5 -> "1.5", 2 -> "2". */
function formatRate(rate) {
  return String(Math.round(rate * 100) / 100);
}

/** Uhrzeit als "HH:MM", beide Teile zweistellig. */
function formatWallClock(timestamp) {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Der eine Anzeigetext für den eigenen Span.
 * Rein: kein DOM, keine Uhr, kein chrome.* — alles kommt über `state` herein.
 *
 * @returns {string} Der Text, oder "" wenn nichts angezeigt werden soll.
 */
export function computeDisplay(state) {
  const {
    mode, playbackRate, duration, currentTime, sponsorSeconds, hideAtNormalSpeed, now,
    isLive, isAd,
  } = state;

  if (isAd || isLive) return "";
  if (!Number.isFinite(duration) || duration <= 0) return "";
  if (!(playbackRate > 0)) return "";

  /** Verbleibende reale Sekunden bei aktueller Speed. */
  const remaining = Math.ceil((duration - currentTime) / playbackRate);

  if (mode === "endsAt") {
    const endsAt = Math.round((now + remaining * 1000) / 60000) * 60000;
    return `(${messages.endsAtPrefix} ${formatWallClock(endsAt)})`;
  }

  const suffix = ` @${formatRate(playbackRate)}x`;

  if (mode === "remaining") {
    // SponsorBlocks Zahl nennt alle Skips, nicht die bevorstehenden -> unscharf.
    const blur = sponsorSeconds === null ? "" : "~";
    return `(${blur}${formatClock(remaining)}${suffix})`;
  }

  if (hideAtNormalSpeed && playbackRate === 1) return "";

  const base = sponsorSeconds ?? duration;
  return `(${formatClock(base / playbackRate)}${suffix})`;
}
