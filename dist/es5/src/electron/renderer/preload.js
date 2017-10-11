"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var events_1 = require("../common/events");
console.log("PRELOAD");
var win = global.window;
console.log(win.location.pathname);
console.log(win.location.origin);
var urlRootReadiumCSS = win.location.origin + "/readium-css/iOS/";
electron_1.ipcRenderer.on(events_1.R2_EVENT_READIUMCSS, function (_event, messageString) {
    var messageJson = JSON.parse(messageString);
    if (messageJson.injectCSS) {
        if (!win.document.head) {
            var headElement = win.document.createElement("head");
            if (win.document.body) {
                win.document.documentElement.insertBefore(headElement, win.document.body);
            }
            else {
                win.document.documentElement.appendChild(headElement);
            }
        }
        removeAllCSS();
        if (messageJson.injectCSS.indexOf("rollback") < 0) {
            appendCSS("before");
            appendCSS("default");
            appendCSS("after");
        }
    }
    if (messageJson.setCSS) {
        var docElement_1 = win.document.documentElement;
        if (typeof messageJson.setCSS === "string" && messageJson.setCSS.indexOf("rollback") >= 0) {
            docElement_1.style.overflow = "auto";
            var toRemove = [];
            for (var i = 0; i < docElement_1.style.length; i++) {
                var item = docElement_1.style.item(i);
                if (item.indexOf("--USER__") === 0) {
                    toRemove.push(item);
                }
            }
            toRemove.forEach(function (item) {
                docElement_1.style.removeProperty(item);
            });
        }
        else {
            docElement_1.style.overflow = "hidden";
            docElement_1.style.setProperty("--USER__darkenFilter", "readium-darken-off");
            docElement_1.style.setProperty("--USER__invertFilter", "readium-invert-off");
            docElement_1.style.setProperty("--USER__advancedSettings", "readium-advanced-on");
            docElement_1.style.setProperty("--USER__fontOverride", "readium-font-on");
            docElement_1.style.setProperty("--USER__view", "readium-paged-on");
            docElement_1.style.setProperty("--USER__appearance", "readium-sepia-on");
            docElement_1.style.setProperty("--USER__textAlign", "justify");
            docElement_1.style.setProperty("--USER__bodyHyphens", "auto");
            docElement_1.style.setProperty("--USER__fontFamily", "AccessibleDfa");
            docElement_1.style.setProperty("--USER__colCount", "2");
            docElement_1.style.setProperty("--USER__fontSize", "112.5%");
            docElement_1.style.setProperty("--USER__typeScale", "1.2");
            docElement_1.style.setProperty("--USER__lineHeight", "2");
            docElement_1.style.setProperty("--USER__paraSpacing", "1rem");
            docElement_1.style.setProperty("--USER__paraIndent", "1rem");
            docElement_1.style.setProperty("--USER__wordSpacing", "0.5rem");
            docElement_1.style.setProperty("--USER__letterSpacing", "0.1875rem");
            docElement_1.style.setProperty("--USER__pageMargins", "1.25");
            docElement_1.style.setProperty("--USER__backgroundColor", "#FFFFFF");
            docElement_1.style.setProperty("--USER__textColor", "#000000");
        }
    }
});
win.addEventListener("DOMContentLoaded", function () {
    console.log("PRELOAD DOM READY");
    win.document.addEventListener("click", function (e) {
        var href = e.target.href;
        if (!href) {
            return;
        }
        console.log("HREF CLICK: " + href);
        e.preventDefault();
        e.stopPropagation();
        electron_1.ipcRenderer.sendToHost(events_1.R2_EVENT_LINK, href);
        return false;
    }, true);
});
win.addEventListener("resize", function () {
    console.log("webview resize");
    win.document.body.scrollLeft = 0;
    win.document.body.scrollTop = 0;
});
function appendCSS(mod) {
    var linkElement = win.document.createElement("link");
    linkElement.setAttribute("id", "ReadiumCSS-" + mod);
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", "text/css");
    linkElement.setAttribute("href", urlRootReadiumCSS + "ReadiumCSS-" + mod + ".css");
    win.document.head.appendChild(linkElement);
}
function removeCSS(mod) {
    var linkElement = win.document.getElementById("ReadiumCSS-" + mod);
    if (linkElement && linkElement.parentNode) {
        linkElement.parentNode.removeChild(linkElement);
    }
}
function removeAllCSS() {
    removeCSS("before");
    removeCSS("after");
    removeCSS("base");
    removeCSS("html5patch");
    removeCSS("safeguards");
    removeCSS("default");
    removeCSS("highlights");
    removeCSS("scroll");
    removeCSS("pagination");
    removeCSS("night_mode");
    removeCSS("pagination");
    removeCSS("os_a11y");
    removeCSS("user_settings");
    removeCSS("fs_normalize");
}
//# sourceMappingURL=preload.js.map