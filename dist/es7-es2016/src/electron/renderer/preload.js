"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debounce = require("debounce");
const electron_1 = require("electron");
const ResizeSensor = require("resize-sensor/ResizeSensor");
const events_1 = require("../common/events");
const win = global.window;
const urlRootReadiumCSS = win.location.origin + "/readium-css/iOS/";
const DEBUG_VISUALS = true;
const ensureHead = () => {
    const docElement = win.document.documentElement;
    if (!win.document.head) {
        const headElement = win.document.createElement("head");
        if (win.document.body) {
            docElement.insertBefore(headElement, win.document.body);
        }
        else {
            docElement.appendChild(headElement);
        }
    }
};
electron_1.ipcRenderer.on(events_1.R2_EVENT_READIUMCSS, (_event, messageString) => {
    const messageJson = JSON.parse(messageString);
    readiumCSS(messageJson);
});
const readiumCSS = (messageJson) => {
    const docElement = win.document.documentElement;
    if (typeof messageJson.injectCSS !== "undefined") {
        ensureHead();
        const remove = (typeof messageJson.injectCSS === "string" && messageJson.injectCSS.indexOf("rollback") >= 0)
            || !messageJson.injectCSS;
        if (remove) {
            docElement.removeAttribute("data-readiumcss");
            removeAllCSS();
            removeAllCSSInline();
        }
        else if (!docElement.hasAttribute("data-readiumcss")) {
            docElement.setAttribute("data-readiumcss", "yes");
            let needsDefaultCSS = true;
            if (win.document.head && win.document.head.childElementCount) {
                let elem = win.document.head.firstElementChild;
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
                const styleAttr = win.document.body.querySelector("*[style]");
                if (styleAttr) {
                    needsDefaultCSS = false;
                }
            }
            appendCSS("before");
            if (needsDefaultCSS) {
                appendCSS("default");
            }
            appendCSS("after");
            appendCSSInline("scrollbarsAndSelection", `
::-webkit-scrollbar-button {
height: 0px !important;
width: 0px !important;
}

::-webkit-scrollbar-corner {
background: transparent !important;
}

/*::-webkit-scrollbar-track-piece {
background-color: red;
} */

::-webkit-scrollbar {
width:  14px;
height: 14px;
}

::-webkit-scrollbar-thumb {
background: #727272;
background-clip: padding-box !important;
border: 3px solid transparent !important;
border-radius: 30px;
}

::-webkit-scrollbar-thumb:hover {
background: #4d4d4d;
}

::-webkit-scrollbar-track {
box-shadow: inset 0 0 3px rgba(40, 40, 40, 0.2);
background: #dddddd;
box-sizing: content-box;
}

::-webkit-scrollbar-track:horizontal {
border-top: 1px solid silver;
}
::-webkit-scrollbar-track:vertical {
border-left: 1px solid silver;
}

.mdc-theme--dark ::-webkit-scrollbar-thumb {
background: #a4a4a4;
border: 3px solid #545454;
}

.mdc-theme--dark ::-webkit-scrollbar-thumb:hover {
background: #dedede;
}

.mdc-theme--dark ::-webkit-scrollbar-track {
background: #545454;
}

.mdc-theme--dark ::-webkit-scrollbar-track:horizontal {
border-top: 1px solid black;
}
.mdc-theme--dark ::-webkit-scrollbar-track:vertical {
border-left: 1px solid black;
}

::selection {
background-color: rgb(155, 179, 240) !important;
color: black !important;
}

.mdc-theme--dark ::selection {
background-color: rgb(100, 122, 177) !important;
color: white !important;
}
*:focus {
outline-style: solid !important;
outline-width: 2px !important;
outline-color: blue !important;
outline-offset: 0px !important;
}
*.no-focus-outline:focus {
outline-style: none !important;
}
    `);
        }
    }
    if (typeof messageJson.setCSS !== "undefined") {
        const remove = (typeof messageJson.setCSS === "string" && messageJson.setCSS.indexOf("rollback") >= 0)
            || !messageJson.setCSS;
        if (remove) {
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
            let dark = false;
            let night = false;
            let sepia = false;
            let invert = false;
            let paged = false;
            let font;
            let align;
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
            const needsAdvanced = true;
            docElement.style.setProperty("--USER__advancedSettings", needsAdvanced ? "readium-advanced-on" : "readium-advanced-off");
            docElement.style.setProperty("--USER__darkenFilter", dark ? "readium-darken-on" : "readium-darken-off");
            docElement.style.setProperty("--USER__invertFilter", invert ? "readium-invert-on" : "readium-invert-off");
            docElement.style.setProperty("--USER__appearance", sepia ? "readium-sepia-on" : (night ? "readium-night-on" : "readium-default-on"));
            docElement.style.setProperty("--USER__view", paged ? "readium-paged-on" : "readium-scroll-on");
            if (paged) {
                docElement.style.overflow = "hidden";
            }
            const needsFontOverride = typeof font !== "undefined" && font !== "DEFAULT";
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
const checkReadyPass = () => {
    if (_readyPassDone) {
        return;
    }
    _readyPassDone = true;
    if (DEBUG_VISUALS) {
        if (win.location.hash && win.location.hash.length > 1) {
            const elem = win.document.getElementById(win.location.hash.substr(1));
            if (elem) {
                elem.classList.add("readium2-read-pos");
            }
        }
    }
    win.addEventListener("resize", () => {
        scrollToHash();
    });
    activateResizeSensor();
    if (win.document.body) {
        win.document.body.addEventListener("click", (ev) => {
            const x = ev.clientX;
            const y = ev.clientY;
            processXY(x, y);
        });
    }
};
const notifyReady = debounce(() => {
    if (_readyEventSent) {
        return;
    }
    _readyEventSent = true;
    electron_1.ipcRenderer.sendToHost(events_1.R2_EVENT_WEBVIEW_READY, win.location.href);
}, 500);
const scrollToHash = debounce(() => {
    notifyReady();
    if (_locationHashOverride) {
        _locationHashOverride.scrollIntoView({
            behavior: "instant",
            block: "start",
            inline: "nearest",
        });
    }
    else if (win.location.hash && win.location.hash.length > 1) {
        const elem = win.document.getElementById(win.location.hash.substr(1));
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
const injectReadPosCSS = () => {
    if (!DEBUG_VISUALS) {
        return;
    }
    ensureHead();
    const styleElement = win.document.createElement("style");
    styleElement.setAttribute("id", "Readium2-ReadPos");
    styleElement.setAttribute("type", "text/css");
    const css = `
:root[style*="readium-sepia-on"] .readium2-read-pos,
:root[style*="readium-night-on"] .readium2-read-pos,
.readium2-read-pos {
    color: red !important;
    background-color: silver !important;
}
:root[style*="readium-sepia-on"] .readium2-read-pos2,
:root[style*="readium-night-on"] .readium2-read-pos2,
.readium2-read-pos2 {
    color: blue !important;
    background-color: yellow !important;
}
`;
    styleElement.appendChild(win.document.createTextNode(css));
    win.document.head.appendChild(styleElement);
};
const activateResizeSensor = () => {
    const useResizeSensor = true;
    if (useResizeSensor && win.document.body) {
        new ResizeSensor(win.document.body, () => {
            scrollToHash();
        });
    }
    else {
        scrollToHash();
    }
    win.addEventListener("scroll", debounce((_ev) => {
        processXY(0, 0);
    }, 800));
};
let _locationHashOverride;
let _readyPassDone = false;
let _readyEventSent = false;
const resetInitialState = () => {
    _locationHashOverride = undefined;
    _readyPassDone = false;
    _readyEventSent = false;
};
win.addEventListener("DOMContentLoaded", () => {
    resetInitialState();
    appendCSSInline("selectionAndFocus", `
::selection {
background-color: rgb(155, 179, 240) !important;
color: black !important;
}
*:focus {
outline-style: solid !important;
outline-width: 2px !important;
outline-color: blue !important;
outline-offset: 0px !important;
}
*.no-focus-outline:focus {
outline-style: none !important;
}`);
    if (DEBUG_VISUALS) {
        injectReadPosCSS();
    }
    win.document.addEventListener("click", (e) => {
        const href = e.target.href;
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
            const token = "readiumcss=";
            const i = win.location.search.indexOf(token);
            if (i > 0) {
                const base64 = win.location.search.substr(i + token.length);
                const str = window.atob(base64);
                const messageJson = JSON.parse(str);
                readiumCSS(messageJson);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});
const processXY = (x, y) => {
    let element;
    let textNode;
    let textNodeOffset = 0;
    const range = document.caretRangeFromPoint(x, y);
    if (range) {
        const node = range.startContainer;
        const offset = range.startOffset;
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
        const existings = document.querySelectorAll(".readium2-read-pos, .readium2-read-pos2");
        existings.forEach((existing) => {
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
    const styleElement = win.document.createElement("style");
    styleElement.setAttribute("id", "Readium2-" + id);
    styleElement.setAttribute("type", "text/css");
    styleElement.appendChild(document.createTextNode(css));
    win.document.head.appendChild(styleElement);
}
function removeCSSInline(id) {
    const styleElement = win.document.getElementById("Readium2-" + id);
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
}
function removeAllCSSInline() {
    removeCSSInline("scrollbarsAndSelection");
}
function appendCSS(mod) {
    const linkElement = win.document.createElement("link");
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