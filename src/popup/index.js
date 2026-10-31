import { bindPopup } from "./popup.js";
import { createStore } from "../settings.js";
import { createMessages } from "../core/messages.js";

document.documentElement.lang = chrome.i18n.getMessage("@@ui_locale").split("_")[0];

const store = await createStore(chrome.storage.sync);
const messages = createMessages((key) => chrome.i18n.getMessage(key));
bindPopup(document.querySelector("#ysd-popup"), store, messages);
