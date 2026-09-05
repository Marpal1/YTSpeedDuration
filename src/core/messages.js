/**
 * Alle sichtbaren Texte an einer Stelle. Deutsch, fest verdrahtet.
 * Bewusst kein chrome.i18n — bei Bedarf lässt sich dieses Objekt 1:1 nach
 * `_locales/de/messages.json` heben.
 */
export const messages = {
  endsAtPrefix: "fertig",
  popupTitle: "Speed Duration",
  modeLabels: {
    total: "Gesamtdauer bei aktueller Geschwindigkeit",
    remaining: "Verbleibende reale Zeit",
    endsAt: "Uhrzeit am Videoende",
  },
  hideAtNormalSpeed: "Bei 1x-Geschwindigkeit ausblenden",
  defaultModeLegend: "Standard-Modus",
  hint: "Klick auf die Zeit im Player wechselt den Modus.",
};
