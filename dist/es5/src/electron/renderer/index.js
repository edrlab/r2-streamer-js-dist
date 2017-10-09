"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
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
electron_1.ipcRenderer.on("tryLcpPass", function (_event, okay, message) {
    console.log(okay);
    console.log(message);
    var lcpPassInput = document.getElementById("lcpPassInput");
    if (!lcpPassInput) {
        return;
    }
    lcpPassInput.value = message;
    if (okay) {
        setTimeout(function () {
            var lcpPassForm = document.getElementById("lcpPassForm");
            if (!lcpPassForm) {
                return;
            }
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
    var h1 = document.querySelector("html > body > h1 > span");
    if (h1) {
        h1.textContent = pathFileName;
    }
    var lcpPassForm = document.getElementById("lcpPassForm");
    if (!lcpPassForm) {
        return;
    }
    var lcpPassInput = document.getElementById("lcpPassInput");
    if (!lcpPassInput) {
        return;
    }
    if (lcpHint) {
        lcpPassInput.value = lcpHint;
        lcpPassForm.style.display = "inline-block";
        lcpPassForm.addEventListener("submit", function (evt) {
            if (evt) {
                evt.preventDefault();
            }
            var lcpPass = lcpPassInput.value;
            electron_1.ipcRenderer.send("tryLcpPass", pathDecoded, lcpPass);
            return false;
        });
    }
    var buttStart = document.getElementById("buttonStart");
    if (!buttStart) {
        return;
    }
    buttStart.addEventListener("click", function () {
        buttStart.setAttribute("disabled", "");
        buttStart.style.display = "none";
        index_navigator_1.startNavigatorExperiment(publicationJsonUrl);
    });
    var buttonDebug = document.getElementById("buttonDebug");
    if (!buttonDebug) {
        return;
    }
    buttonDebug.addEventListener("click", function () {
        if (document.documentElement.classList.contains("debug")) {
            document.documentElement.classList.remove("debug");
        }
        else {
            document.documentElement.classList.add("debug");
        }
    });
    var buttonDevTools = document.getElementById("buttonDevTools");
    if (!buttonDevTools) {
        return;
    }
    buttonDevTools.addEventListener("click", function () {
        electron_1.ipcRenderer.send("devtools", "test");
    });
});
//# sourceMappingURL=index.js.map