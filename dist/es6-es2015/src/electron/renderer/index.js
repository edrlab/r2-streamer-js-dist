"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const events_1 = require("../common/events");
const index_navigator_1 = require("./index_navigator");
const querystring_1 = require("./querystring");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
const queryParams = querystring_1.getURLQueryParams();
const publicationJsonUrl = queryParams["pub"];
console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
const lcpHint = queryParams["lcpHint"];
window.onerror = (err) => {
    console.log("Error", err);
};
electron_1.ipcRenderer.on(events_1.R2_EVENT_LINK, (_event, href) => {
    console.log("R2_EVENT_LINK");
    console.log(href);
    index_navigator_1.handleLink(href, publicationJsonUrl);
});
electron_1.ipcRenderer.on(events_1.R2_EVENT_TRY_LCP_PASS_RES, (_event, okay, message) => {
    console.log("R2_EVENT_TRY_LCP_PASS_RES");
    console.log(okay);
    console.log(message);
    const lcpPassInput = document.getElementById("lcpPassInput");
    const lcpPassForm = document.getElementById("lcpPassForm");
    if (!lcpPassInput || !lcpPassForm) {
        return;
    }
    lcpPassInput.value = message;
    if (okay) {
        setTimeout(() => {
            lcpPassForm.style.display = "none";
        }, 1000);
    }
});
window.addEventListener("DOMContentLoaded", () => {
    const pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
    console.log(pathBase64);
    const pathDecoded = window.atob(pathBase64);
    console.log(pathDecoded);
    const pathFileName = pathDecoded.substr(pathDecoded.lastIndexOf("/") + 1, pathDecoded.length - 1);
    window.document.title = "Readium2 [ " + pathFileName + "]";
    const h1 = document.querySelector("html > body > h1 > span");
    if (h1) {
        h1.textContent = pathFileName;
    }
    if (lcpHint) {
        const lcpPassForm = document.getElementById("lcpPassForm");
        const lcpPassInput = document.getElementById("lcpPassInput");
        if (lcpPassInput && lcpPassForm) {
            lcpPassInput.value = lcpHint;
            lcpPassForm.style.display = "inline-block";
            lcpPassForm.addEventListener("submit", (evt) => {
                if (evt) {
                    evt.preventDefault();
                }
                const lcpPass = lcpPassInput.value;
                electron_1.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPass);
                return false;
            });
        }
    }
    const buttStart = document.getElementById("buttonStart");
    if (buttStart) {
        buttStart.addEventListener("click", () => {
            buttStart.setAttribute("disabled", "");
            buttStart.style.display = "none";
            index_navigator_1.startNavigatorExperiment(publicationJsonUrl);
        });
    }
    const buttonDebug = document.getElementById("buttonDebug");
    if (buttonDebug) {
        buttonDebug.addEventListener("click", () => {
            if (document.documentElement.classList.contains("debug")) {
                document.documentElement.classList.remove("debug");
            }
            else {
                document.documentElement.classList.add("debug");
            }
        });
    }
    const buttonDevTools = document.getElementById("buttonDevTools");
    if (buttonDevTools) {
        buttonDevTools.addEventListener("click", () => {
            electron_1.ipcRenderer.send(events_1.R2_EVENT_DEVTOOLS, "test");
        });
    }
});
//# sourceMappingURL=index.js.map