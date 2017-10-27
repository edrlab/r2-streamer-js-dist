"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var events_1 = require("../../common/events");
var win = global.window;
var urlRootReadiumCSS = win.location.origin + "/readium-css/iOS/";
exports.DEBUG_VISUALS = false;
exports.injectSelectionAndFocusCSS = function () {
    appendCSSInline("selectionAndFocus", "\n    ::selection {\n    background-color: rgb(155, 179, 240) !important;\n    color: black !important;\n    }\n    *:focus {\n    outline-style: solid !important;\n    outline-width: 2px !important;\n    outline-color: blue !important;\n    outline-offset: 0px !important;\n    }\n    *.no-focus-outline:focus {\n    outline-style: none !important;\n    }");
};
exports.injectReadPosCSS = function () {
    if (!exports.DEBUG_VISUALS) {
        return;
    }
    ensureHead();
    var styleElement = win.document.createElement("style");
    styleElement.setAttribute("id", "Readium2-ReadPos");
    styleElement.setAttribute("type", "text/css");
    var css = "\n    :root[style*=\"readium-sepia-on\"] .readium2-read-pos,\n    :root[style*=\"readium-night-on\"] .readium2-read-pos,\n    .readium2-read-pos {\n        color: red !important;\n        background-color: silver !important;\n    }\n    :root[style*=\"readium-sepia-on\"] .readium2-read-pos2,\n    :root[style*=\"readium-night-on\"] .readium2-read-pos2,\n    .readium2-read-pos2 {\n        color: blue !important;\n        background-color: yellow !important;\n    }\n    ";
    styleElement.appendChild(win.document.createTextNode(css));
    win.document.head.appendChild(styleElement);
};
var ensureHead = function () {
    var docElement = win.document.documentElement;
    if (!win.document.head) {
        var headElement = win.document.createElement("head");
        if (win.document.body) {
            docElement.insertBefore(headElement, win.document.body);
        }
        else {
            docElement.appendChild(headElement);
        }
    }
};
electron_1.ipcRenderer.on(events_1.R2_EVENT_READIUMCSS, function (_event, messageString) {
    var messageJson = JSON.parse(messageString);
    exports.readiumCSS(messageJson);
});
exports.readiumCSS = function (messageJson) {
    var docElement = win.document.documentElement;
    if (typeof messageJson.injectCSS !== "undefined") {
        ensureHead();
        var remove = (typeof messageJson.injectCSS === "string" && messageJson.injectCSS.indexOf("rollback") >= 0)
            || !messageJson.injectCSS;
        if (remove) {
            docElement.removeAttribute("data-readiumcss");
            removeAllCSS();
            removeAllCSSInline();
        }
        else if (!docElement.hasAttribute("data-readiumcss")) {
            docElement.setAttribute("data-readiumcss", "yes");
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
            appendCSSInline("scrollbarsAndSelection", "\n    ::-webkit-scrollbar-button {\n    height: 0px !important;\n    width: 0px !important;\n    }\n\n    ::-webkit-scrollbar-corner {\n    background: transparent !important;\n    }\n\n    /*::-webkit-scrollbar-track-piece {\n    background-color: red;\n    } */\n\n    ::-webkit-scrollbar {\n    width:  14px;\n    height: 14px;\n    }\n\n    ::-webkit-scrollbar-thumb {\n    background: #727272;\n    background-clip: padding-box !important;\n    border: 3px solid transparent !important;\n    border-radius: 30px;\n    }\n\n    ::-webkit-scrollbar-thumb:hover {\n    background: #4d4d4d;\n    }\n\n    ::-webkit-scrollbar-track {\n    box-shadow: inset 0 0 3px rgba(40, 40, 40, 0.2);\n    background: #dddddd;\n    box-sizing: content-box;\n    }\n\n    ::-webkit-scrollbar-track:horizontal {\n    border-top: 1px solid silver;\n    }\n    ::-webkit-scrollbar-track:vertical {\n    border-left: 1px solid silver;\n    }\n\n    .mdc-theme--dark ::-webkit-scrollbar-thumb {\n    background: #a4a4a4;\n    border: 3px solid #545454;\n    }\n\n    .mdc-theme--dark ::-webkit-scrollbar-thumb:hover {\n    background: #dedede;\n    }\n\n    .mdc-theme--dark ::-webkit-scrollbar-track {\n    background: #545454;\n    }\n\n    .mdc-theme--dark ::-webkit-scrollbar-track:horizontal {\n    border-top: 1px solid black;\n    }\n    .mdc-theme--dark ::-webkit-scrollbar-track:vertical {\n    border-left: 1px solid black;\n    }\n\n    ::selection {\n    background-color: rgb(155, 179, 240) !important;\n    color: black !important;\n    }\n\n    .mdc-theme--dark ::selection {\n    background-color: rgb(100, 122, 177) !important;\n    color: white !important;\n    }\n    *:focus {\n    outline-style: solid !important;\n    outline-width: 2px !important;\n    outline-color: blue !important;\n    outline-offset: 0px !important;\n    }\n    *.no-focus-outline:focus {\n    outline-style: none !important;\n    }\n        ");
        }
    }
    if (typeof messageJson.setCSS !== "undefined") {
        var remove = (typeof messageJson.setCSS === "string" && messageJson.setCSS.indexOf("rollback") >= 0)
            || !messageJson.setCSS;
        if (remove) {
            docElement.style.overflow = "auto";
            var toRemove = [];
            for (var i = 0; i < docElement.style.length; i++) {
                var item = docElement.style.item(i);
                if (item.indexOf("--USER__") === 0) {
                    toRemove.push(item);
                }
            }
            toRemove.forEach(function (item) {
                docElement.style.removeProperty(item);
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
                docElement.classList.add("mdc-theme--dark");
            }
            else {
                docElement.classList.remove("mdc-theme--dark");
            }
            var needsAdvanced = true;
            docElement.style.setProperty("--USER__advancedSettings", needsAdvanced ? "readium-advanced-on" : "readium-advanced-off");
            docElement.style.setProperty("--USER__darkenFilter", dark ? "readium-darken-on" : "readium-darken-off");
            docElement.style.setProperty("--USER__invertFilter", invert ? "readium-invert-on" : "readium-invert-off");
            docElement.style.setProperty("--USER__appearance", sepia ? "readium-sepia-on" : (night ? "readium-night-on" : "readium-default-on"));
            docElement.style.setProperty("--USER__view", paged ? "readium-paged-on" : "readium-scroll-on");
            if (paged) {
                docElement.style.overflow = "hidden";
            }
            var needsFontOverride = typeof font !== "undefined" && font !== "DEFAULT";
            docElement.style.setProperty("--USER__fontOverride", needsFontOverride ? "readium-font-on" : "readium-font-off");
            docElement.style.setProperty("--USER__fontFamily", !needsFontOverride ? "" :
                (font === "DYS" ? "AccessibleDfa" :
                    (font === "OLD" ? "var(--RS__oldStyleTf)" :
                        (font === "MODERN" ? "var(--RS__modernTf)" :
                            (font === "SANS" ? "var(--RS__sansTf)" :
                                (font === "HUMAN" ? "var(--RS__humanistTf)" :
                                    (font === "MONO" ? "var(--RS__monospaceTf)" :
                                        (font ? font : "var(--RS__oldStyleTf)"))))))));
            docElement.style.setProperty("--USER__textAlign", align === "justify" ? "justify" :
                (align === "right" ? "right" :
                    (align === "left" ? "left" : "left")));
        }
    }
};
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
    removeCSSInline("scrollbarsAndSelection");
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
//# sourceMappingURL=readium-css.js.map