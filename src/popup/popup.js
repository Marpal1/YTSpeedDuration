import { MODES } from "../core/modes.js";
import { messages } from "../core/messages.js";

/**
 * Baut die Popup-Oberflaeche in `form` und verbindet sie mit dem Store.
 * Kennt weder chrome.* noch das Dokument des Players — nur das Formular.
 */
export function bindPopup(form, store) {
  const doc = form.ownerDocument;
  const { mode, hideAtNormalSpeed } = store.read();

  const fieldset = doc.createElement("fieldset");
  const legend = doc.createElement("legend");
  legend.textContent = messages.defaultModeLegend;
  fieldset.append(legend);

  for (const value of MODES) {
    const label = doc.createElement("label");
    const input = doc.createElement("input");
    input.type = "radio";
    input.name = "mode";
    input.value = value;
    input.checked = value === mode;
    label.append(input, doc.createTextNode(` ${messages.modeLabels[value]}`));
    fieldset.append(label);
  }
  form.append(fieldset);

  const hideLabel = doc.createElement("label");
  const hide = doc.createElement("input");
  hide.type = "checkbox";
  hide.name = "hideAtNormalSpeed";
  hide.checked = hideAtNormalSpeed;
  hideLabel.append(hide, doc.createTextNode(` ${messages.hideAtNormalSpeed}`));
  form.append(hideLabel);

  form.addEventListener("change", (event) => {
    const input = event.target;
    if (input.name === "mode") store.write({ mode: input.value });
    if (input.name === "hideAtNormalSpeed") store.write({ hideAtNormalSpeed: input.checked });
  });

  const hint = doc.createElement("p");
  hint.className = "ysd-hint";
  hint.textContent = messages.hint;
  form.append(hint);
}
