/**
 * Zeitformatierung im YouTube-/SponsorBlock-Format.
 * Rein — kein DOM, keine Uhr.
 */

/** Sekunden -> "M:SS" bzw. ab einer Stunde "H:MM:SS", so wie YouTube es schreibt. */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor(s / 60) % 60;
  const seconds = s % 60;
  const ss = String(seconds).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${ss}`
    : `${minutes}:${ss}`;
}

/**
 * Liest die SB-Dauer aus dem Text von `#sponsorBlockDurationAfterSkips`.
 * SponsorBlock schreibt dort exakt `" (43:12)"` — bzw. `""`, wenn es nichts zu
 * überspringen gibt.
 *
 * @returns {number|null} Sekunden, oder null wenn der Text keine Zeit enthält.
 */
export function parseSponsorDuration(text) {
  const match = /\((\d+(?::\d+)+)\)/.exec(String(text ?? ""));
  if (match === null) return null;
  return match[1]
    .split(":")
    .reduce((total, part) => total * 60 + Number(part), 0);
}
