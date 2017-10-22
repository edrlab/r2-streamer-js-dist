"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce = require("debounce");
var electron_1 = require("electron");
var ResizeSensor = require("resize-sensor/ResizeSensor");
var events_1 = require("../common/events");
var querystring_1 = require("./querystring");
var win = global.window;
var urlRootReadiumCSS = win.location.origin + "/readium-css/iOS/";
var DEBUG_VISUALS = true;
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
    readiumCSS(messageJson);
});
var readiumCSS = function (messageJson) {
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
            appendCSSInline("scrollbarsAndSelection", "\n::-webkit-scrollbar-button {\nheight: 0px !important;\nwidth: 0px !important;\n}\n\n::-webkit-scrollbar-corner {\nbackground: transparent !important;\n}\n\n/*::-webkit-scrollbar-track-piece {\nbackground-color: red;\n} */\n\n::-webkit-scrollbar {\nwidth:  14px;\nheight: 14px;\n}\n\n::-webkit-scrollbar-thumb {\nbackground: #727272;\nbackground-clip: padding-box !important;\nborder: 3px solid transparent !important;\nborder-radius: 30px;\n}\n\n::-webkit-scrollbar-thumb:hover {\nbackground: #4d4d4d;\n}\n\n::-webkit-scrollbar-track {\nbox-shadow: inset 0 0 3px rgba(40, 40, 40, 0.2);\nbackground: #dddddd;\nbox-sizing: content-box;\n}\n\n::-webkit-scrollbar-track:horizontal {\nborder-top: 1px solid silver;\n}\n::-webkit-scrollbar-track:vertical {\nborder-left: 1px solid silver;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-thumb {\nbackground: #a4a4a4;\nborder: 3px solid #545454;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-thumb:hover {\nbackground: #dedede;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-track {\nbackground: #545454;\n}\n\n.mdc-theme--dark ::-webkit-scrollbar-track:horizontal {\nborder-top: 1px solid black;\n}\n.mdc-theme--dark ::-webkit-scrollbar-track:vertical {\nborder-left: 1px solid black;\n}\n\n::selection {\nbackground-color: rgb(155, 179, 240) !important;\ncolor: black !important;\n}\n\n.mdc-theme--dark ::selection {\nbackground-color: rgb(100, 122, 177) !important;\ncolor: white !important;\n}\n*:focus {\noutline-style: solid !important;\noutline-width: 2px !important;\noutline-color: blue !important;\noutline-offset: 0px !important;\n}\n*.no-focus-outline:focus {\noutline-style: none !important;\n}\n    ");
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
                                (font === "HUMAN" ? "var(--RS__humanistTf)" : "var(--RS__oldStyleTf)"))))));
            docElement.style.setProperty("--USER__textAlign", align === "justify" ? "justify" :
                (align === "right" ? "right" :
                    (align === "left" ? "left" : "left")));
        }
    }
    checkReadyPass();
};
var checkReadyPass = function () {
    if (_readyPassDone) {
        return;
    }
    _readyPassDone = true;
    if (DEBUG_VISUALS) {
        if (win.location.hash && win.location.hash.length > 1) {
            var elem = win.document.getElementById(win.location.hash.substr(1));
            if (elem) {
                elem.classList.add("readium2-read-pos");
            }
        }
    }
    win.addEventListener("resize", function () {
        scrollToHash();
    });
    activateResizeSensor();
    if (win.document.body) {
        win.document.body.addEventListener("click", function (ev) {
            var x = ev.clientX;
            var y = ev.clientY;
            processXY(x, y);
        });
    }
};
var notifyReady = debounce(function () {
    if (_readyEventSent) {
        return;
    }
    _readyEventSent = true;
    electron_1.ipcRenderer.sendToHost(events_1.R2_EVENT_WEBVIEW_READY, win.location.href);
}, 500);
var scrollToHash = debounce(function () {
    notifyReady();
    if (_locationHashOverride) {
        _locationHashOverride.scrollIntoView({
            behavior: "instant",
            block: "start",
            inline: "nearest",
        });
    }
    else if (win.location.hash && win.location.hash.length > 1) {
        var elem = win.document.getElementById(win.location.hash.substr(1));
        if (elem) {
            elem.scrollIntoView({
                behavior: "instant",
                block: "start",
                inline: "nearest",
            });
        }
    }
    else {
        if (win.document.body) {
            win.document.body.scrollLeft = 0;
            win.document.body.scrollTop = 0;
        }
    }
}, 500);
var injectReadPosCSS = function () {
    if (!DEBUG_VISUALS) {
        return;
    }
    ensureHead();
    var styleElement = win.document.createElement("style");
    styleElement.setAttribute("id", "Readium2-ReadPos");
    styleElement.setAttribute("type", "text/css");
    var css = "\n:root[style*=\"readium-sepia-on\"] .readium2-read-pos,\n:root[style*=\"readium-night-on\"] .readium2-read-pos,\n.readium2-read-pos {\n    color: red !important;\n    background-color: silver !important;\n}\n:root[style*=\"readium-sepia-on\"] .readium2-read-pos2,\n:root[style*=\"readium-night-on\"] .readium2-read-pos2,\n.readium2-read-pos2 {\n    color: blue !important;\n    background-color: yellow !important;\n}\n";
    styleElement.appendChild(win.document.createTextNode(css));
    win.document.head.appendChild(styleElement);
};
var activateResizeSensor = function () {
    var useResizeSensor = true;
    if (useResizeSensor && win.document.body) {
        new ResizeSensor(win.document.body, function () {
            scrollToHash();
        });
    }
    else {
        scrollToHash();
    }
    win.addEventListener("scroll", debounce(function (_ev) {
        processXY(0, 0);
    }, 800));
};
var _locationHashOverride;
var _readyPassDone = false;
var _readyEventSent = false;
var resetInitialState = function () {
    _locationHashOverride = undefined;
    _readyPassDone = false;
    _readyEventSent = false;
};
win.addEventListener("DOMContentLoaded", function () {
    resetInitialState();
    appendCSSInline("selectionAndFocus", "\n::selection {\nbackground-color: rgb(155, 179, 240) !important;\ncolor: black !important;\n}\n*:focus {\noutline-style: solid !important;\noutline-width: 2px !important;\noutline-color: blue !important;\noutline-offset: 0px !important;\n}\n*.no-focus-outline:focus {\noutline-style: none !important;\n}");
    if (DEBUG_VISUALS) {
        injectReadPosCSS();
    }
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
    try {
        if (win.location.search) {
            var params = querystring_1.getURLQueryParams(win.location.search);
            var base64 = params["readiumcss"];
            if (!base64) {
                console.log("!readiumcss BASE64 ??!");
                var token = "readiumcss=";
                var i = win.location.search.indexOf(token);
                if (i > 0) {
                    base64 = win.location.search.substr(i + token.length);
                    var j = base64.indexOf("&");
                    if (j > 0) {
                        base64 = base64.substr(0, j);
                    }
                    base64 = decodeURIComponent(base64);
                }
            }
            if (base64) {
                var str = window.atob(base64);
                var messageJson = JSON.parse(str);
                readiumCSS(messageJson);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});
var processXY = function (x, y) {
    var element;
    var textNode;
    var textNodeOffset = 0;
    var range = document.caretRangeFromPoint(x, y);
    if (range) {
        var node = range.startContainer;
        var offset = range.startOffset;
        if (node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                element = node;
            }
            else if (node.nodeType === Node.TEXT_NODE) {
                textNode = node;
                textNodeOffset = offset;
                if (node.parentNode && node.parentNode.nodeType === Node.ELEMENT_NODE) {
                    element = node.parentNode;
                }
            }
        }
    }
    if (DEBUG_VISUALS) {
        var existings = document.querySelectorAll(".readium2-read-pos, .readium2-read-pos2");
        existings.forEach(function (existing) {
            existing.classList.remove("readium2-read-pos");
            existing.classList.remove("readium2-read-pos2");
        });
    }
    if (element) {
        _locationHashOverride = element;
        if (DEBUG_VISUALS) {
            element.classList.add("readium2-read-pos2");
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
//# sourceMappingURL=preload.js.map