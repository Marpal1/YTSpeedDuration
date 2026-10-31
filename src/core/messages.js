/**
 * Alle sichtbaren Texte der aktiven Sprache. Die Uebersetzungen liegen in
 * `_locales/`; `getMessage` ist in der Erweiterung `chrome.i18n.getMessage`.
 */
export function createMessages(getMessage) {
  return {
    endsAtPrefix: getMessage("endsAtPrefix"),
    modeLabels: {
      total: getMessage("modeTotal"),
      remaining: getMessage("modeRemaining"),
      endsAt: getMessage("modeEndsAt"),
    },
    hideAtNormalSpeed: getMessage("hideAtNormalSpeed"),
    defaultModeLegend: getMessage("defaultModeLegend"),
    hint: getMessage("hint"),
  };
}
