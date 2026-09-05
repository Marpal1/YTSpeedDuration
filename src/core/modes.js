/** Die drei Modi, in Klick-Reihenfolge. */
export const MODES = ["total", "remaining", "endsAt"];

/** Nächster Modus im Zyklus; unbekannte Eingaben starten wieder bei "total". */
export function nextMode(mode) {
  const index = MODES.indexOf(mode);
  return MODES[(index + 1) % MODES.length];
}
