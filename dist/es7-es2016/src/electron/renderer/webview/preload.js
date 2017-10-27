"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debounce = require("debounce");
const ResizeSensor = require("resize-sensor/ResizeSensor");
const readium_css_1 = require("./readium-css");
const electron_1 = require("electron");
const events_1 = require("../../common/events");
const animateProperty_1 = require("../common/animateProperty");
const cssselector_1 = require("../common/cssselector");
const easings_1 = require("../common/easings");
const querystring_1 = require("../common/querystring");
const win = global.window;
let queryParams = win.location.search ? querystring_1.getURLQueryParams(win.location.search) : undefined;
let _hashElement;
electron_1.ipcRenderer.on(events_1.R2_EVENT_SCROLLTO, (_event, messageString) => {
    console.log("R2_EVENT_SCROLLTO");
    console.log(messageString);
    const messageJson = JSON.parse(messageString);
    if (!queryParams) {
        queryParams = {};
    }
    if (messageJson.previous) {
        queryParams["readiumprevious"] = "true";
    }
    else {
        if (typeof queryParams["readiumprevious"] !== "undefined") {
            delete queryParams["readiumprevious"];
        }
    }
    if (messageJson.goto) {
        queryParams["readiumgoto"] = "true";
    }
    else {
        if (typeof queryParams["readiumgoto"] !== "undefined") {
            delete queryParams["readiumgoto"];
        }
    }
    if (messageJson.hash) {
        _hashElement = win.document.getElementById(messageJson.hash);
    }
    else {
        _hashElement = null;
    }
    _readyEventSent = false;
    _locationHashOverride = undefined;
    scrollToHashRaw(false);
});
electron_1.ipcRenderer.on(events_1.R2_EVENT_PAGE_TURN, (_event, messageString) => {
    const element = win.document.body;
    if (!element) {
        return;
    }
    const maxHeightShift = element.scrollHeight - win.document.documentElement.clientHeight;
    const messageJson = JSON.parse(messageString);
    const goPREVIOUS = messageJson.go === "PREVIOUS";
    if (!goPREVIOUS) {
        if (element.scrollTop < maxHeightShift) {
            animateProperty_1.animateProperty(win.cancelAnimationFrame, undefined, "scrollTop", 300, element, element.scrollTop + win.document.documentElement.clientHeight, win.requestAnimationFrame, easings_1.easings.easeInOutQuad);
            return;
        }
    }
    else if (goPREVIOUS) {
        if (element.scrollTop > 0) {
            animateProperty_1.animateProperty(win.cancelAnimationFrame, undefined, "scrollTop", 300, element, element.scrollTop - win.document.documentElement.clientHeight, win.requestAnimationFrame, easings_1.easings.easeInOutQuad);
            return;
        }
    }
    electron_1.ipcRenderer.sendToHost(events_1.R2_EVENT_PAGE_TURN_RES, messageString);
});
const checkReadyPass = () => {
    if (_readyPassDone) {
        return;
    }
    _readyPassDone = true;
    if (readium_css_1.DEBUG_VISUALS) {
        if (_hashElement) {
            _hashElement.classList.add("readium2-read-pos");
        }
    }
    win.addEventListener("resize", () => {
        scrollToHash();
    });
    setTimeout(() => {
        scrollToHashRaw(true);
        win.addEventListener("scroll", (_ev) => {
            if (_ignoreScrollEvent) {
                _ignoreScrollEvent = false;
                return;
            }
            processXY(0, 0);
        });
    }, 800);
    const useResizeSensor = true;
    if (useResizeSensor && win.document.body) {
        setTimeout(() => {
            window.requestAnimationFrame((_timestamp) => {
                new ResizeSensor(win.document.body, () => {
                    console.log("ResizeSensor");
                    scrollToHash();
                });
            });
        }, 2000);
    }
    if (win.document.body) {
        win.document.body.addEventListener("click", (ev) => {
            const x = ev.clientX;
            const y = ev.clientY;
            processXY(x, y);
        });
    }
};
const notifyReady = () => {
    if (_readyEventSent) {
        return;
    }
    _readyEventSent = true;
    electron_1.ipcRenderer.sendToHost(events_1.R2_EVENT_WEBVIEW_READY, win.location.href);
};
const scrollToHashRaw = (firstCall) => {
    console.log("scrollToHash: " + firstCall);
    if (_locationHashOverride) {
        console.log("_locationHashOverride");
        if (_locationHashOverride === win.document.body) {
            console.log("body...");
            return;
        }
        notifyReady();
        notifyReadingLocation();
        _ignoreScrollEvent = true;
        _locationHashOverride.scrollIntoView({
            behavior: "instant",
            block: "start",
            inline: "nearest",
        });
        return;
    }
    else if (_hashElement) {
        console.log("_hashElement");
        _locationHashOverride = _hashElement;
        notifyReady();
        notifyReadingLocation();
        if (!firstCall) {
            _ignoreScrollEvent = true;
            _hashElement.scrollIntoView({
                behavior: "instant",
                block: "start",
                inline: "nearest",
            });
        }
        return;
    }
    else {
        if (win.document.body) {
            if (queryParams) {
                const previous = queryParams["readiumprevious"];
                const isPreviousNavDirection = previous === "true";
                if (isPreviousNavDirection) {
                    console.log("readiumprevious");
                    const maxHeightShift = win.document.body.scrollHeight - win.document.documentElement.clientHeight;
                    _ignoreScrollEvent = true;
                    win.document.body.scrollLeft = 0;
                    win.document.body.scrollTop = maxHeightShift;
                    _locationHashOverride = undefined;
                    _locationHashOverrideCSSselector = undefined;
                    processXYRaw(0, win.document.documentElement.clientHeight - 1);
                    console.log("BOTTOM (previous):");
                    console.log(_locationHashOverride);
                    notifyReady();
                    notifyReadingLocation();
                    return;
                }
                let gotoCssSelector = queryParams["readiumgoto"];
                if (gotoCssSelector) {
                    gotoCssSelector = gotoCssSelector.replace(/\+/g, " ");
                    let selected = null;
                    try {
                        selected = document.querySelector(gotoCssSelector);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    if (selected) {
                        console.log("readiumgoto");
                        _locationHashOverride = selected;
                        _locationHashOverrideCSSselector = gotoCssSelector;
                        notifyReady();
                        notifyReadingLocation();
                        _ignoreScrollEvent = true;
                        selected.scrollIntoView({
                            behavior: "instant",
                            block: "start",
                            inline: "nearest",
                        });
                        return;
                    }
                }
            }
            console.log("_locationHashOverride = win.document.body");
            _locationHashOverride = win.document.body;
            _locationHashOverrideCSSselector = undefined;
            _ignoreScrollEvent = true;
            win.document.body.scrollLeft = 0;
            win.document.body.scrollTop = 0;
        }
    }
    notifyReady();
    notifyReadingLocation();
};
const scrollToHash = debounce(() => {
    scrollToHashRaw(false);
}, 500);
let _ignoreScrollEvent = false;
let _locationHashOverride;
let _locationHashOverrideCSSselector;
let _readyPassDone = false;
let _readyEventSent = false;
const resetInitialState = () => {
    _locationHashOverride = undefined;
    _readyPassDone = false;
    _readyEventSent = false;
};
win.addEventListener("load", () => {
    checkReadyPass();
});
win.addEventListener("DOMContentLoaded", () => {
    if (win.location.hash && win.location.hash.length > 1) {
        _hashElement = win.document.getElementById(win.location.hash.substr(1));
    }
    resetInitialState();
    readium_css_1.injectDefaultCSS();
    if (readium_css_1.DEBUG_VISUALS) {
        readium_css_1.injectReadPosCSS();
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
        if (queryParams) {
            const base64 = queryParams["readiumcss"];
            if (base64) {
                const str = window.atob(base64);
                const messageJson = JSON.parse(str);
                readium_css_1.readiumCSS(messageJson);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});
const processXYRaw = (x, y) => {
    console.log("processXY");
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
    if (readium_css_1.DEBUG_VISUALS) {
        const existings = document.querySelectorAll(".readium2-read-pos, .readium2-read-pos2");
        existings.forEach((existing) => {
            existing.classList.remove("readium2-read-pos");
            existing.classList.remove("readium2-read-pos2");
        });
    }
    if (element) {
        _locationHashOverride = element;
        notifyReadingLocation();
        if (readium_css_1.DEBUG_VISUALS) {
            element.classList.add("readium2-read-pos2");
        }
    }
};
const processXY = debounce((x, y) => {
    processXYRaw(x, y);
}, 300);
const notifyReadingLocation = () => {
    if (!_locationHashOverride) {
        return;
    }
    _locationHashOverrideCSSselector = cssselector_1.fullQualifiedSelector(_locationHashOverride, false);
    electron_1.ipcRenderer.sendToHost(events_1.R2_EVENT_READING_LOCATION, _locationHashOverrideCSSselector);
};
//# sourceMappingURL=preload.js.map