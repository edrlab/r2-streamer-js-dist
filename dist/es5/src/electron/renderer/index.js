"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var events_1 = require("../common/events");
var index_navigator_1 = require("./index_navigator");
var querystring_1 = require("./querystring");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
var queryParams = querystring_1.getURLQueryParams();
var publicationJsonUrl = queryParams["pub"];
console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
var lcpHint = queryParams["lcpHint"];
window.onerror = function (err) {
    console.log("Error", err);
};
electron_1.ipcRenderer.on(events_1.R2_EVENT_LINK, function (_event, href) {
    console.log("R2_EVENT_LINK");
    console.log(href);
    index_navigator_1.handleLink(href, publicationJsonUrl);
});
electron_1.ipcRenderer.on(events_1.R2_EVENT_TRY_LCP_PASS_RES, function (_event, okay, message) {
    console.log("R2_EVENT_TRY_LCP_PASS_RES");
    console.log(okay);
    console.log(message);
    var lcpPassInput = document.getElementById("lcpPassInput");
    var lcpPassForm = document.getElementById("lcpPassForm");
    if (!lcpPassInput || !lcpPassForm) {
        return;
    }
    lcpPassInput.value = message;
    if (okay) {
        setTimeout(function () {
            lcpPassForm.style.display = "none";
        }, 1000);
    }
});
window.addEventListener("DOMContentLoaded", function () {
    var pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
    console.log(pathBase64);
    var pathDecoded = window.atob(pathBase64);
    console.log(pathDecoded);
    var pathFileName = pathDecoded.substr(pathDecoded.lastIndexOf("/") + 1, pathDecoded.length - 1);
    window.document.title = "Readium2 [ " + pathFileName + "]";
    var h1 = document.querySelector("html > body > h1 > span");
    if (h1) {
        h1.textContent = pathFileName;
    }
    if (lcpHint) {
        var lcpPassForm = document.getElementById("lcpPassForm");
        var lcpPassInput_1 = document.getElementById("lcpPassInput");
        if (lcpPassInput_1 && lcpPassForm) {
            lcpPassInput_1.value = lcpHint;
            lcpPassForm.style.display = "inline-block";
            lcpPassForm.addEventListener("submit", function (evt) {
                if (evt) {
                    evt.preventDefault();
                }
                var lcpPass = lcpPassInput_1.value;
                electron_1.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPass);
                return false;
            });
        }
    }
    var buttStart = document.getElementById("buttonStart");
    if (buttStart) {
        buttStart.addEventListener("click", function () {
            buttStart.setAttribute("disabled", "");
            buttStart.style.display = "none";
            index_navigator_1.startNavigatorExperiment(publicationJsonUrl);
        });
    }
    var buttonDebug = document.getElementById("buttonDebug");
    if (buttonDebug) {
        buttonDebug.addEventListener("click", function () {
            if (document.documentElement.classList.contains("debug")) {
                document.documentElement.classList.remove("debug");
            }
            else {
                document.documentElement.classList.add("debug");
            }
        });
    }
    var buttonDevTools = document.getElementById("buttonDevTools");
    if (buttonDevTools) {
        buttonDevTools.addEventListener("click", function () {
            electron_1.ipcRenderer.send(events_1.R2_EVENT_DEVTOOLS, "test");
        });
    }
});
//# sourceMappingURL=index.js.map