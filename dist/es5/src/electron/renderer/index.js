"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debounce = require("debounce");
var electron_1 = require("electron");
var electron_2 = require("electron");
var events_1 = require("../common/events");
var sessions_1 = require("../common/sessions");
var querystring_1 = require("./querystring");
var index_1 = require("./riots/linklist/index_");
var index_2 = require("./riots/linklistgroup/index_");
var index_3 = require("./riots/linktree/index_");
var ElectronStore = require("electron-store");
var queryParams = querystring_1.getURLQueryParams();
var publicationJsonUrl = queryParams["pub"];
var pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
var pathDecoded = window.atob(pathBase64);
var pathFileName = pathDecoded.substr(pathDecoded.replace(/\\/g, "/").lastIndexOf("/") + 1, pathDecoded.length - 1);
var lcpHint = queryParams["lcpHint"];
var defaultsStyling = {
    dark: false,
    font: "DEFAULT",
    invert: false,
    night: false,
    readiumcss: false,
    sepia: false,
};
var defaults = {
    basicLinkTitles: true,
    styling: defaultsStyling,
};
var electronStore = new ElectronStore({
    defaults: defaults,
    name: "readium2-navigator",
});
electronStore.onDidChange("styling.night", function (newValue, oldValue) {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    var nightSwitch = document.getElementById("night_switch-input");
    if (nightSwitch) {
        nightSwitch.checked = newValue;
    }
    if (newValue) {
        document.body.classList.add("mdc-theme--dark");
    }
    else {
        document.body.classList.remove("mdc-theme--dark");
    }
    readiumCssOnOff();
});
var readiumCssOnOff = function () {
    var on = electronStore.get("styling.readiumcss");
    if (on) {
        var dark = electronStore.get("styling.dark");
        var font = electronStore.get("styling.font");
        var invert = electronStore.get("styling.invert");
        var night = electronStore.get("styling.night");
        var sepia = electronStore.get("styling.sepia");
        var cssJson = {
            dark: dark,
            font: font,
            invert: invert,
            night: night,
            sepia: sepia,
        };
        var jsonMsg_1 = { injectCSS: "yes", setCSS: cssJson };
        _webviews.forEach(function (wv) {
            wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg_1));
        });
    }
    else {
        var jsonMsg_2 = { injectCSS: "rollback", setCSS: "rollback" };
        _webviews.forEach(function (wv) {
            wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg_2));
        });
    }
};
electronStore.onDidChange("styling.readiumcss", function (newValue, oldValue) {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    var readiumcssSwitch = document.getElementById("readiumcss_switch-input");
    if (readiumcssSwitch) {
        readiumcssSwitch.checked = newValue;
    }
    readiumCssOnOff();
    var nightSwitch = document.getElementById("night_switch-input");
    if (nightSwitch) {
        nightSwitch.disabled = !newValue;
    }
    var fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.mdcSelect.disabled = !newValue;
    }
    if (!newValue) {
        electronStore.set("styling.night", false);
    }
});
var initFontSelect = function () {
    var fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        var font = electronStore.get("styling.font");
        var i = font === "OLD" ? 1 :
            (font === "MODERN" ? 2 :
                (font === "SANS" ? 3 :
                    (font === "HUMAN" ? 4 :
                        (font === "DYS" ? 5 :
                            0))));
        fontSelect.mdcSelect.selectedIndex = i;
        fontSelect.mdcSelect.disabled = !electronStore.get("styling.readiumcss");
    }
};
electronStore.onDidChange("styling.font", function (newValue, oldValue) {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    initFontSelect();
    readiumCssOnOff();
});
electronStore.onDidChange("basicLinkTitles", function (newValue, oldValue) {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    var basicSwitch = document.getElementById("nav_basic_switch-input");
    if (basicSwitch) {
        basicSwitch.checked = !newValue;
    }
});
var snackBar;
var drawer;
function handleLink(href) {
    var prefix = publicationJsonUrl.replace("manifest.json", "");
    if (href.startsWith(prefix)) {
        if (drawer.open) {
            drawer.open = false;
            setTimeout(function () {
                loadLink(href, href.replace(prefix, ""), publicationJsonUrl);
            }, 500);
        }
        else {
            loadLink(href, href.replace(prefix, ""), publicationJsonUrl);
        }
    }
    else {
        electron_2.shell.openExternal(href);
    }
}
exports.handleLink = handleLink;
window.onerror = function (err) {
    console.log("Error", err);
};
electron_1.ipcRenderer.on(events_1.R2_EVENT_LINK, function (_event, href) {
    handleLink(href);
});
electron_1.ipcRenderer.on(events_1.R2_EVENT_TRY_LCP_PASS_RES, function (_event, okay, msg) {
    if (!okay) {
        setTimeout(function () {
            showLcpDialog(msg);
        }, 500);
        return;
    }
    startNavigatorExperiment();
});
var lcpDialog;
function showLcpDialog(message) {
    var lcpPassHint = document.getElementById("lcpPassHint");
    lcpPassHint.textContent = lcpHint;
    if (message) {
        var lcpPassMessage = document.getElementById("lcpPassMessage");
        lcpPassMessage.textContent = message;
    }
    lcpDialog.show();
    setTimeout(function () {
        var lcpPassInput = document.getElementById("lcpPassInput");
        if (lcpPassInput) {
            lcpPassInput.focus();
            setTimeout(function () {
                lcpPassInput.classList.add("no-focus-outline");
            }, 500);
        }
    }, 800);
}
function installKeyboardMouseFocusHandler() {
    var dateLastKeyboardEvent = new Date();
    var dateLastMouseEvent = new Date();
    document.body.addEventListener("focusin", debounce(function (ev) {
        var focusWasTriggeredByMouse = dateLastMouseEvent > dateLastKeyboardEvent;
        if (focusWasTriggeredByMouse) {
            if (ev.target && ev.target.classList) {
                ev.target.classList.add("no-focus-outline");
            }
        }
    }, 500));
    document.body.addEventListener("focusout", function (ev) {
        if (ev.target && ev.target.classList) {
            ev.target.classList.remove("no-focus-outline");
        }
    });
    document.body.addEventListener("mousedown", function () {
        dateLastMouseEvent = new Date();
    });
    document.body.addEventListener("keydown", function () {
        dateLastKeyboardEvent = new Date();
    });
}
window.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        window.mdc.autoInit();
    }, 500);
    window.document.title = "Readium2 [ " + pathFileName + "]";
    var h1 = document.getElementById("pubTitle");
    if (h1) {
        h1.textContent = pathFileName;
    }
    installKeyboardMouseFocusHandler();
    if (electronStore.get("styling.night")) {
        document.body.classList.add("mdc-theme--dark");
    }
    else {
        document.body.classList.remove("mdc-theme--dark");
    }
    var menuFactory = function (menuEl) {
        var menu = new window.mdc.menu.MDCSimpleMenu(menuEl);
        menuEl.mdcSimpleMenu = menu;
        return menu;
    };
    var fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        var fontSelector = new window.mdc.select.MDCSelect(fontSelect, undefined, menuFactory);
        fontSelect.mdcSelect = fontSelector;
    }
    var snackBarElem = document.getElementById("snackbar");
    snackBar = new window.mdc.snackbar.MDCSnackbar(snackBarElem);
    snackBarElem.mdcSnackbar = snackBar;
    snackBar.dismissesOnAction = true;
    var drawerElement = document.getElementById("drawer");
    drawer = new window.mdc.drawer.MDCTemporaryDrawer(drawerElement);
    drawerElement.mdcTemporaryDrawer = drawer;
    var drawerButton = document.getElementById("drawerButton");
    if (drawerButton) {
        drawerButton.addEventListener("click", function () {
            drawer.open = true;
        });
    }
    if (drawerElement) {
        drawerElement.addEventListener("click", function (ev) {
            var allMenus = drawerElement.querySelectorAll(".mdc-simple-menu");
            var openedMenus = [];
            allMenus.forEach(function (elem) {
                if (elem.mdcSimpleMenu && elem.mdcSimpleMenu.open) {
                    openedMenus.push(elem);
                }
            });
            var needsToCloseMenus = true;
            var currElem = ev.target;
            while (currElem) {
                if (openedMenus.indexOf(currElem) >= 0) {
                    needsToCloseMenus = false;
                    break;
                }
                currElem = currElem.parentNode;
            }
            if (needsToCloseMenus) {
                openedMenus.forEach(function (elem) {
                    elem.mdcSimpleMenu.open = false;
                    var ss = elem.parentNode.querySelector(".mdc-select__selected-text");
                    if (ss) {
                        ss.style.transform = "initial";
                        ss.style.opacity = "1";
                        ss.focus();
                    }
                });
            }
            else {
            }
        }, true);
    }
    var selectElement = document.getElementById("nav-select");
    var navSelector = new window.mdc.select.MDCSelect(selectElement, undefined, menuFactory);
    selectElement.mdcSelect = navSelector;
    navSelector.listen("MDCSelect:change", function (ev) {
        var activePanel = document.querySelector(".tabPanel.active");
        if (activePanel) {
            activePanel.classList.remove("active");
        }
        var newActivePanel = document.querySelector(".tabPanel:nth-child(" + (ev.detail.selectedIndex + 1) + ")");
        if (newActivePanel) {
            newActivePanel.classList.add("active");
        }
    });
    var diagElem = document.querySelector("#lcpDialog");
    var lcpPassInput = document.getElementById("lcpPassInput");
    lcpDialog = new window.mdc.dialog.MDCDialog(diagElem);
    diagElem.mdcDialog = lcpDialog;
    lcpDialog.listen("MDCDialog:accept", function () {
        var lcpPass = lcpPassInput.value;
        electron_1.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPass);
    });
    lcpDialog.listen("MDCDialog:cancel", function () {
        setTimeout(function () {
            showLcpDialog();
        }, 10);
    });
    if (lcpPassInput) {
        lcpPassInput.addEventListener("keyup", function (ev) {
            if (ev.keyCode === 13) {
                ev.preventDefault();
                var lcpDialogAcceptButton = document.getElementById("lcpDialogAcceptButton");
                if (lcpDialogAcceptButton) {
                    lcpDialogAcceptButton.click();
                }
            }
        });
    }
    if (lcpHint) {
        showLcpDialog();
    }
    else {
        startNavigatorExperiment();
    }
    var buttonClearSettings = document.getElementById("buttonClearSettings");
    if (buttonClearSettings) {
        buttonClearSettings.addEventListener("click", function () {
            electronStore.store = defaults;
            drawer.open = false;
            setTimeout(function () {
                var message = "Settings reset.";
                var data = {
                    actionHandler: function () {
                    },
                    actionOnBottom: false,
                    actionText: "OK",
                    message: message,
                    multiline: false,
                    timeout: 2000,
                };
                snackBar.show(data);
            }, 500);
        });
    }
    var buttonClearSettingsStyle = document.getElementById("buttonClearSettingsStyle");
    if (buttonClearSettingsStyle) {
        buttonClearSettingsStyle.addEventListener("click", function () {
            electronStore.set("styling", defaultsStyling);
            drawer.open = false;
            setTimeout(function () {
                var message = "Default styles.";
                var data = {
                    actionHandler: function () {
                    },
                    actionOnBottom: false,
                    actionText: "OK",
                    message: message,
                    multiline: false,
                    timeout: 2000,
                };
                snackBar.show(data);
            }, 500);
        });
    }
    var buttonOpenSettings = document.getElementById("buttonOpenSettings");
    if (buttonOpenSettings) {
        buttonOpenSettings.addEventListener("click", function () {
            electronStore.openInEditor();
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
});
var _webviews = [];
function createWebView() {
    var webview1 = document.createElement("webview");
    webview1.setAttribute("class", "singleFull");
    webview1.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, javascript=1, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    webview1.setAttribute("partition", sessions_1.R2_SESSION_WEBVIEW);
    webview1.setAttribute("httpreferrer", publicationJsonUrl);
    webview1.setAttribute("preload", "./preload.js");
    webview1.setAttribute("disableguestresize", "");
    webview1.addEventListener("ipc-message", function (event) {
        if (event.channel === events_1.R2_EVENT_LINK) {
            handleLink(event.args[0]);
        }
    });
    webview1.addEventListener("dom-ready", function () {
        webview1.clearHistory();
        readiumCssOnOff();
    });
    return webview1;
}
window.addEventListener("resize", debounce(function () {
    _webviews.forEach(function (wv) {
        var width = wv.clientWidth;
        var height = wv.clientHeight;
        var wc = wv.getWebContents();
        if (wc && width && height) {
            wc.setSize({
                normal: {
                    height: height,
                    width: width,
                },
            });
        }
    });
}, 200));
function loadLink(hrefFull, _hrefPartial, _publicationJsonUrl) {
    if (_webviews.length) {
        _webviews[0].setAttribute("src", hrefFull);
    }
}
function startNavigatorExperiment() {
    var _this = this;
    var webviewFull = createWebView();
    _webviews.push(webviewFull);
    var publicationViewport = document.getElementById("publication_viewport");
    if (publicationViewport) {
        publicationViewport.appendChild(webviewFull);
    }
    initFontSelect();
    var fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.mdcSelect.listen("MDCSelect:change", function (ev) {
            var index = ev.detail.selectedIndex;
            var ff = index === 0 ? "DEFAULT" :
                (index === 1 ? "OLD" :
                    (index === 2 ? "MODERN" :
                        (index === 3 ? "SANS" :
                            (index === 4 ? "HUMAN" :
                                (index === 5 ? "DYS" :
                                    "DEFAULT")))));
            electronStore.set("styling.font", ff);
        });
    }
    var nightSwitch = document.getElementById("night_switch-input");
    if (nightSwitch) {
        nightSwitch.checked = electronStore.get("styling.night");
        nightSwitch.addEventListener("change", function (_event) {
            var checked = nightSwitch.checked;
            electronStore.set("styling.night", checked);
        });
        nightSwitch.disabled = !electronStore.get("styling.readiumcss");
    }
    var readiumcssSwitch = document.getElementById("readiumcss_switch-input");
    if (readiumcssSwitch) {
        readiumcssSwitch.checked = electronStore.get("styling.readiumcss");
        readiumcssSwitch.addEventListener("change", function (_event) {
            var checked = readiumcssSwitch.checked;
            electronStore.set("styling.readiumcss", checked);
        });
    }
    var basicSwitch = document.getElementById("nav_basic_switch-input");
    if (basicSwitch) {
        basicSwitch.checked = !electronStore.get("basicLinkTitles");
        basicSwitch.addEventListener("change", function (_event) {
            var checked = basicSwitch.checked;
            electronStore.set("basicLinkTitles", !checked);
        });
    }
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var response, e_1, publicationJson, e_2, h1, buttonNavLeft, buttonNavRight, opts, firstLinear_1, opts, tag_1, opts, tag_2, landmarksData, opts, tag_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, fetch(publicationJsonUrl)];
                case 1:
                    response = _a.sent();
                    return [3, 3];
                case 2:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3, 3];
                case 3:
                    if (!response) {
                        return [2];
                    }
                    if (!response.ok) {
                        console.log("BAD RESPONSE?!");
                    }
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4, response.json()];
                case 5:
                    publicationJson = _a.sent();
                    return [3, 7];
                case 6:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [3, 7];
                case 7:
                    if (!publicationJson) {
                        return [2];
                    }
                    if (publicationJson.metadata && publicationJson.metadata.title) {
                        h1 = document.getElementById("pubTitle");
                        if (h1) {
                            h1.textContent = publicationJson.metadata.title;
                        }
                    }
                    buttonNavLeft = document.getElementById("buttonNavLeft");
                    if (buttonNavLeft) {
                        buttonNavLeft.addEventListener("click", function (_event) {
                            navLeftOrRight(false, publicationJsonUrl, publicationJson);
                        });
                    }
                    buttonNavRight = document.getElementById("buttonNavRight");
                    if (buttonNavRight) {
                        buttonNavRight.addEventListener("click", function (_event) {
                            navLeftOrRight(true, publicationJsonUrl, publicationJson);
                        });
                    }
                    if (publicationJson.spine) {
                        opts = {
                            basic: true,
                            fixBasic: true,
                            links: publicationJson.spine,
                            url: publicationJsonUrl,
                        };
                        index_1.riotMountLinkList("#reader_controls_SPINE", opts);
                        firstLinear_1 = publicationJson.spine.length ? publicationJson.spine[0] : undefined;
                        if (firstLinear_1) {
                            setTimeout(function () {
                                var firstLinearLinkHref = publicationJsonUrl + "/../" + firstLinear_1.href;
                                handleLink(firstLinearLinkHref);
                            }, 200);
                        }
                    }
                    if (publicationJson.toc && publicationJson.toc.length) {
                        opts = {
                            basic: electronStore.get("basicLinkTitles"),
                            links: publicationJson.toc,
                            url: publicationJsonUrl,
                        };
                        tag_1 = index_3.riotMountLinkTree("#reader_controls_TOC", opts)[0];
                        electronStore.onDidChange("basicLinkTitles", function (newValue, oldValue) {
                            if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
                                return;
                            }
                            tag_1.setBasic(newValue);
                        });
                    }
                    if (publicationJson["page-list"] && publicationJson["page-list"].length) {
                        opts = {
                            basic: electronStore.get("basicLinkTitles"),
                            links: publicationJson["page-list"],
                            url: publicationJsonUrl,
                        };
                        tag_2 = index_1.riotMountLinkList("#reader_controls_PAGELIST", opts)[0];
                        electronStore.onDidChange("basicLinkTitles", function (newValue, oldValue) {
                            if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
                                return;
                            }
                            tag_2.setBasic(newValue);
                        });
                    }
                    landmarksData = [];
                    if (publicationJson.landmarks && publicationJson.landmarks.length) {
                        landmarksData.push({
                            label: "Main",
                            links: publicationJson.landmarks,
                        });
                    }
                    if (publicationJson.lot && publicationJson.lot.length) {
                        landmarksData.push({
                            label: "Tables",
                            links: publicationJson.lot,
                        });
                    }
                    if (publicationJson.loi && publicationJson.loi.length) {
                        landmarksData.push({
                            label: "Illustrations",
                            links: publicationJson.loi,
                        });
                    }
                    if (publicationJson.lov && publicationJson.lov.length) {
                        landmarksData.push({
                            label: "Video",
                            links: publicationJson.lov,
                        });
                    }
                    if (publicationJson.loa && publicationJson.loa.length) {
                        landmarksData.push({
                            label: "Audio",
                            links: publicationJson.loa,
                        });
                    }
                    if (landmarksData.length) {
                        opts = {
                            basic: electronStore.get("basicLinkTitles"),
                            linksgroup: landmarksData,
                            url: publicationJsonUrl,
                        };
                        tag_3 = index_2.riotMountLinkListGroup("#reader_controls_LANDMARKS", opts)[0];
                        electronStore.onDidChange("basicLinkTitles", function (newValue, oldValue) {
                            if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
                                return;
                            }
                            tag_3.setBasic(newValue);
                        });
                    }
                    return [2];
            }
        });
    }); })();
}
function navLeftOrRight(_right, _publicationJsonUrl, _publicationJson) {
}
//# sourceMappingURL=index.js.map