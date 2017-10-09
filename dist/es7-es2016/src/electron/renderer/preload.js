"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log("PRELOAD");
const win = global.window;
console.log(win.location.pathname);
console.log(win.location.origin);
const urlRootReadiumCSS = win.location.origin + "/readium-css/iOS/";
electron_1.ipcRenderer.on("readium", (_event, messageString) => {
    const messageJson = JSON.parse(messageString);
    if (messageJson.injectCSS) {
        if (!win.document.head) {
            const headElement = win.document.createElement("head");
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
        const docElement = win.document.documentElement;
        if (typeof messageJson.setCSS === "string" && messageJson.setCSS.indexOf("rollback") >= 0) {
            docElement.style.overflow = "auto";
            const toRemove = [];
            for (let i = 0; i < docElement.style.length; i++) {
                const item = docElement.style.item(i);
                if (item.indexOf("--USER__") === 0) {
                    toRemove.push(item);
                }
            }
            toRemove.forEach((item) => {
                docElement.style.removeProperty(item);
            });
        }
        else {
            docElement.style.overflow = "hidden";
            docElement.style.setProperty("--USER__darkenFilter", "readium-darken-off");
            docElement.style.setProperty("--USER__invertFilter", "readium-invert-off");
            docElement.style.setProperty("--USER__advancedSettings", "readium-advanced-on");
            docElement.style.setProperty("--USER__fontOverride", "readium-font-on");
            docElement.style.setProperty("--USER__view", "readium-paged-on");
            docElement.style.setProperty("--USER__appearance", "readium-sepia-on");
            docElement.style.setProperty("--USER__textAlign", "justify");
            docElement.style.setProperty("--USER__bodyHyphens", "auto");
            docElement.style.setProperty("--USER__fontFamily", "AccessibleDfa");
            docElement.style.setProperty("--USER__colCount", "2");
            docElement.style.setProperty("--USER__fontSize", "112.5%");
            docElement.style.setProperty("--USER__typeScale", "1.2");
            docElement.style.setProperty("--USER__lineHeight", "2");
            docElement.style.setProperty("--USER__paraSpacing", "1rem");
            docElement.style.setProperty("--USER__paraIndent", "1rem");
            docElement.style.setProperty("--USER__wordSpacing", "0.5rem");
            docElement.style.setProperty("--USER__letterSpacing", "0.1875rem");
            docElement.style.setProperty("--USER__pageMargins", "1.25");
            docElement.style.setProperty("--USER__backgroundColor", "#FFFFFF");
            docElement.style.setProperty("--USER__textColor", "#000000");
        }
    }
});
win.addEventListener("DOMContentLoaded", () => {
    console.log("PRELOAD DOM READY");
});
win.addEventListener("resize", () => {
    console.log("webview resize");
    win.document.body.scrollLeft = 0;
});
function appendCSS(mod) {
    const linkElement = win.document.createElement("link");
    linkElement.setAttribute("id", "ReadiumCSS-" + mod);
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", "text/css");
    linkElement.setAttribute("href", urlRootReadiumCSS + "ReadiumCSS-" + mod + ".css");
    win.document.head.appendChild(linkElement);
}
function removeCSS(mod) {
    const linkElement = win.document.getElementById("ReadiumCSS-" + mod);
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