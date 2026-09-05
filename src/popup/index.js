import { bindPopup } from "./popup.js";
import { createStore } from "../settings.js";

const store = await createStore(chrome.storage.sync);
bindPopup(document.querySelector("#ysd-popup"), store);
