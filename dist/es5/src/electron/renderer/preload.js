"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var events_1 = require("../common/events");
var win = global.window;
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
        removeAllCSSInline();
        if (messageJson.injectCSS.indexOf("rollback") < 0) {
            var needsDefaultCSS = true;
            if (win.document.head && win.document.head.childElementCount) {
                var elem = win.document.head.firstElementChild;
                while (elem) {
                    if ((elem.localName && elem.localName.toLowerCase() === "style") ||
                        (elem.getAttribute &&
                            (elem.getAttribute("rel") === "stylesheet" ||
                                elem.getAttribute("type") === "text/css" ||
                                (elem.getAttribute("src") &&
                                    elem.getAttribute("src").endsWith(".css"))))) {
                        needsDefaultCSS = false;
                        break;
                    }
                    elem = elem.nextElementSibling;
                }
            }
            if (needsDefaultCSS && win.document.body) {
                var styleAttr = win.document.body.querySelector("*[style]");
                if (styleAttr) {
                    needsDefaultCSS = false;
                }
            }
            appendCSS("before");
            if (needsDefaultCSS) {
                appendCSS("default");
            }
            appendCSS("after");
            appendCSSInline("scrollbars", "\n::-webkit-scrollbar-button {\nheight: 0px !important;\nwidth: 0px !important;\n}\n\n::-webkit-scrollbar-corner {\nbackground: transparent !important;\n}\n\n/*::-webkit-scrollbar-track-piece {\nbackground-color: red;\n} */\n\n::-webkit-scrollbar {\nwidth:  14px;\nheight: 14px;\n}\n\n::-webkit-scrollbar-thumb {\nbackground: #727272;\nbackground-clip: padding-box !important;\nborder: 3px solid transparent !important;\nborder-radius: 30px;\n}\n\n::-webkit-scrollbar-thumb:hover {\nbackground: #4d4d4d;\n}\n\n::-webkit-scrollbar-track {\nbox-shadow: inset 0 0 3px rgba(40, 40, 40, 0.2);\nbackground: #dddddd;\nbox-sizing: content-box;\n}\n\n::-webkit-scrollbar-track:horizontal {\nborder-top: 1px solid silver;\n}\n::-webkit-scrollbar-track:vertical {\nborder-left: 1px solid silver;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-thumb {\nbackground: #a4a4a4;\nborder: 3px solid #545454;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-thumb:hover {\nbackground: #dedede;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-track {\nbackground: #545454;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-track:horizontal {\nborder-top: 1px solid black;\n}\n.mdc-theme--dark ::-webkit-scrollbar-track:vertical {\nborder-left: 1px solid black;\n}\n::selection {\nbackground-color: rgb(155, 179, 240) !important;\ncolor: black !important;\n}\n\n.mdc-theme--dark ::selection {\nbackground-color: rgb(100, 122, 177) !important;\ncolor: white !important;\n}\n");
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
            var dark = false;
            var night = false;
            var sepia = false;
            var invert = false;
            var paged = false;
            var font = void 0;
            var align = void 0;
            if (typeof messageJson.setCSS === "object") {
                if (messageJson.setCSS.dark) {
                    dark = true;
                }
                if (messageJson.setCSS.night) {
                    night = true;
                }
                if (messageJson.setCSS.sepia) {
                    sepia = true;
                }
                if (messageJson.setCSS.invert) {
                    invert = true;
                }
                if (messageJson.setCSS.paged) {
                    paged = true;
                }
                if (typeof messageJson.setCSS.font === "string") {
                    font = messageJson.setCSS.font;
                }
                if (typeof messageJson.setCSS.align === "string") {
                    align = messageJson.setCSS.align;
                }
            }
            if (night) {
                docElement_1.classList.add("mdc-theme--dark");
            }
            else {
                docElement_1.classList.remove("mdc-theme--dark");
            }
            var needsAdvanced = true;
            docElement_1.style.setProperty("--USER__advancedSettings", needsAdvanced ? "readium-advanced-on" : "readium-advanced-off");
            docElement_1.style.setProperty("--USER__darkenFilter", dark ? "readium-darken-on" : "readium-darken-off");
            docElement_1.style.setProperty("--USER__invertFilter", invert ? "readium-invert-on" : "readium-invert-off");
            docElement_1.style.setProperty("--USER__appearance", sepia ? "readium-sepia-on" : (night ? "readium-night-on" : "readium-default-on"));
            docElement_1.style.setProperty("--USER__view", paged ? "readium-paged-on" : "readium-scroll-on");
            if (paged) {
                docElement_1.style.overflow = "hidden";
            }
            var needsFontOverride = typeof font !== "undefined" && font !== "DEFAULT";
            docElement_1.style.setProperty("--USER__fontOverride", needsFontOverride ? "readium-font-on" : "readium-font-off");
            docElement_1.style.setProperty("--USER__fontFamily", !needsFontOverride ? "" :
                (font === "DYS" ? "AccessibleDfa" :
                    (font === "OLD" ? "var(--RS__oldStyleTf)" :
                        (font === "MODERN" ? "var(--RS__modernTf)" :
                            (font === "SANS" ? "var(--RS__sansTf)" :
                                (font === "HUMAN" ? "var(--RS__humanistTf)" : "var(--RS__oldStyleTf)"))))));
            docElement_1.style.setProperty("--USER__textAlign", align === "justify" ? "justify" :
                (align === "right" ? "right" :
                    (align === "left" ? "left" : "left")));
        }
    }
});
win.addEventListener("DOMContentLoaded", function () {
    win.document.addEventListener("click", function (e) {
        var href = e.target.href;
        if (!href) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        electron_1.ipcRenderer.sendToHost(events_1.R2_EVENT_LINK, href);
        return false;
    }, true);
});
win.addEventListener("resize", function () {
    if (win.document.body) {
        win.document.body.scrollLeft = 0;
        win.document.body.scrollTop = 0;
    }
});
function appendCSSInline(id, css) {
    var styleElement = win.document.createElement("style");
    styleElement.setAttribute("id", "Readium2-" + id);
    styleElement.setAttribute("type", "text/css");
    styleElement.appendChild(document.createTextNode(css));
    win.document.head.appendChild(styleElement);
}
function removeCSSInline(id) {
    var styleElement = win.document.getElementById("Readium2-" + id);
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
}
function removeAllCSSInline() {
    removeCSSInline("scrollbars");
}
function appendCSS(mod) {
    var linkElement = win.document.createElement("link");
    linkElement.setAttribute("id", "ReadiumCSS-" + mod);
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", "text/css");
    linkElement.setAttribute("href", urlRootReadiumCSS + "ReadiumCSS-" + mod + ".css");
    if (mod === "before" && win.document.head.childElementCount) {
        win.document.head.insertBefore(linkElement, win.document.head.firstElementChild);
    }
    else {
        win.document.head.appendChild(linkElement);
    }
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