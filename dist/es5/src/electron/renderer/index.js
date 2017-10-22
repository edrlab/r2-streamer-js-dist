"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debounce = require("debounce");
var electron_1 = require("electron");
var electron_2 = require("electron");
var ElectronStore = require("electron-store");
var path = require("path");
var ta_json_1 = require("ta-json");
var lcp_1 = require("../../../../es8-es2017/src/parser/epub/lcp");
var init_globals_1 = require("../../../../es8-es2017/src/init-globals");
var publication_1 = require("../../../../es8-es2017/src/models/publication");
var events_1 = require("../common/events");
var sessions_1 = require("../common/sessions");
var querystring_1 = require("./querystring");
var index_1 = require("./riots/linklist/index_");
var index_2 = require("./riots/linklistgroup/index_");
var index_3 = require("./riots/linktree/index_");
var index_4 = require("./riots/menuselect/index_");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP/lcp.node"));
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
var computeReadiumCssJsonMessage = function () {
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
        var jsonMsg = { injectCSS: "yes", setCSS: cssJson };
        return JSON.stringify(jsonMsg, null, 0);
    }
    else {
        var jsonMsg = { injectCSS: "rollback", setCSS: "rollback" };
        return JSON.stringify(jsonMsg, null, 0);
    }
};
var readiumCssOnOff = debounce(function () {
    var str = computeReadiumCssJsonMessage();
    _webviews.forEach(function (wv) {
        wv.send(events_1.R2_EVENT_READIUMCSS, str);
    });
}, 500);
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
    if (!newValue) {
        electronStore.set("styling.night", false);
    }
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
            }, 200);
        }
        else {
            loadLink(href, href.replace(prefix, ""), publicationJsonUrl);
        }
    }
    else {
        electron_1.shell.openExternal(href);
    }
}
exports.handleLink = handleLink;
window.onerror = function (err) {
    console.log("Error", err);
};
var unhideWebView = function (_id, forced) {
    var hidePanel = document.getElementById("reader_chrome_HIDE");
    if (hidePanel && hidePanel.style.display === "none") {
        return;
    }
    if (forced) {
        console.log("unhideWebView FORCED");
    }
    if (hidePanel) {
        hidePanel.style.display = "none";
    }
};
electron_2.ipcRenderer.on(events_1.R2_EVENT_LINK, function (_event, href) {
    console.log("R2_EVENT_LINK");
    console.log(href);
    handleLink(href);
});
electron_2.ipcRenderer.on(events_1.R2_EVENT_TRY_LCP_PASS_RES, function (_event, okay, msg, passSha256Hex) {
    if (!okay) {
        setTimeout(function () {
            showLcpDialog(msg);
        }, 500);
        return;
    }
    var lcpStore = electronStore.get("lcp");
    if (!lcpStore) {
        var lcpObj = {};
        var pubLcpObj = lcpObj[pathDecoded] = {};
        pubLcpObj.sha = passSha256Hex;
        electronStore.set("lcp", lcpObj);
    }
    else {
        var pubLcpStore = lcpStore[pathDecoded];
        if (pubLcpStore) {
            pubLcpStore.sha = passSha256Hex;
        }
        else {
            lcpStore[pathDecoded] = {
                sha: passSha256Hex,
            };
        }
        electronStore.set("lcp", lcpStore);
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
var initFontSelector = function () {
    var options = [{
            id: "DEFAULT",
            label: "Default",
        }, {
            id: "OLD",
            label: "Old Style",
        }, {
            id: "MODERN",
            label: "Modern",
        }, {
            id: "SANS",
            label: "Sans",
        }, {
            id: "HUMAN",
            label: "Humanist",
        }, {
            id: "DYS",
            label: "Readable (dys)",
        }];
    var opts = {
        disabled: !electronStore.get("styling.readiumcss"),
        options: options,
        selected: electronStore.get("styling.font"),
    };
    var tag = index_4.riotMountMenuSelect("#fontSelect", opts)[0];
    tag.on("selectionChanged", function (val) {
        electronStore.set("styling.font", val);
    });
    electronStore.onDidChange("styling.font", function (newValue, oldValue) {
        if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
            return;
        }
        tag.setSelectedItem(newValue);
        readiumCssOnOff();
    });
    electronStore.onDidChange("styling.readiumcss", function (newValue, oldValue) {
        if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
            return;
        }
        tag.setDisabled(!newValue);
    });
};
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
    initFontSelector();
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
    var menuFactory = function (menuEl) {
        var menu = new window.mdc.menu.MDCSimpleMenu(menuEl);
        menuEl.mdcSimpleMenu = menu;
        return menu;
    };
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
        electron_2.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPass, false);
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
        var lcpPassSha256Hex = void 0;
        var lcpStore = electronStore.get("lcp");
        if (lcpStore) {
            var pubLcpStore = lcpStore[pathDecoded];
            if (pubLcpStore && pubLcpStore.sha) {
                lcpPassSha256Hex = pubLcpStore.sha;
            }
        }
        if (lcpPassSha256Hex) {
            electron_2.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPassSha256Hex, true);
        }
        else {
            showLcpDialog();
        }
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
        else if (event.channel === events_1.R2_EVENT_WEBVIEW_READY) {
            var id = event.args[0];
            unhideWebView(id, false);
        }
        else {
            console.log("webview1 ipc-message");
            console.log(event.channel);
        }
    });
    webview1.addEventListener("dom-ready", function () {
        webview1.clearHistory();
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
        var hidePanel = document.getElementById("reader_chrome_HIDE");
        if (hidePanel) {
            hidePanel.style.display = "block";
        }
        setTimeout(function () {
            if (_webviews.length) {
                var href = _webviews[0].getAttribute("src");
                if (href) {
                    unhideWebView(href, true);
                }
            }
        }, 5000);
        var urlWithSearch = hrefFull;
        var urlParts = hrefFull.split("#");
        if (urlParts && (urlParts.length === 1 || urlParts.length === 2)) {
            var str = computeReadiumCssJsonMessage();
            var base64 = window.btoa(str);
            var alreadyHasSearch = urlParts[0].indexOf("?") > 0;
            urlWithSearch = urlParts[0] +
                (alreadyHasSearch ? "&" : "?") +
                "readiumcss=" +
                base64 +
                (urlParts.length === 2 ? ("#" + urlParts[1]) : "");
        }
        _webviews[0].setAttribute("src", urlWithSearch);
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
        var response, e_1, pubJson, e_2, publication, title, keys, h1, buttonNavLeft, buttonNavRight, opts, firstLinear_1, opts, tag_1, opts, tag_2, landmarksData, opts, tag_3;
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
                    pubJson = _a.sent();
                    return [3, 7];
                case 6:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [3, 7];
                case 7:
                    if (!pubJson) {
                        return [2];
                    }
                    publication = ta_json_1.JSON.deserialize(pubJson, publication_1.Publication);
                    if (publication.Metadata && publication.Metadata.Title) {
                        title = void 0;
                        if (typeof publication.Metadata.Title === "string") {
                            title = publication.Metadata.Title;
                        }
                        else {
                            keys = Object.keys(publication.Metadata.Title);
                            if (keys && keys.length) {
                                title = publication.Metadata.Title[keys[0]];
                            }
                        }
                        if (title) {
                            h1 = document.getElementById("pubTitle");
                            if (h1) {
                                h1.textContent = title;
                            }
                        }
                    }
                    buttonNavLeft = document.getElementById("buttonNavLeft");
                    if (buttonNavLeft) {
                        buttonNavLeft.addEventListener("click", function (_event) {
                            navLeftOrRight(false, publicationJsonUrl, publication);
                        });
                    }
                    buttonNavRight = document.getElementById("buttonNavRight");
                    if (buttonNavRight) {
                        buttonNavRight.addEventListener("click", function (_event) {
                            navLeftOrRight(true, publicationJsonUrl, publication);
                        });
                    }
                    if (publication.Spine && publication.Spine.length) {
                        opts = {
                            basic: true,
                            fixBasic: true,
                            links: pubJson.spine,
                            url: publicationJsonUrl,
                        };
                        index_1.riotMountLinkList("#reader_controls_SPINE", opts);
                        firstLinear_1 = publication.Spine[0];
                        if (firstLinear_1) {
                            setTimeout(function () {
                                var firstLinearLinkHref = publicationJsonUrl + "/../" + firstLinear_1.Href;
                                handleLink(firstLinearLinkHref);
                            }, 200);
                        }
                    }
                    if (publication.TOC && publication.TOC.length) {
                        opts = {
                            basic: electronStore.get("basicLinkTitles"),
                            links: pubJson.toc,
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
                    if (publication.PageList && publication.PageList.length) {
                        opts = {
                            basic: electronStore.get("basicLinkTitles"),
                            links: pubJson["page-list"],
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
                    if (publication.Landmarks && publication.Landmarks.length) {
                        landmarksData.push({
                            label: "Main",
                            links: pubJson.landmarks,
                        });
                    }
                    if (publication.LOT && publication.LOT.length) {
                        landmarksData.push({
                            label: "Tables",
                            links: pubJson.lot,
                        });
                    }
                    if (publication.LOI && publication.LOI.length) {
                        landmarksData.push({
                            label: "Illustrations",
                            links: pubJson.loi,
                        });
                    }
                    if (publication.LOV && publication.LOV.length) {
                        landmarksData.push({
                            label: "Video",
                            links: pubJson.lov,
                        });
                    }
                    if (publication.LOA && publication.LOA.length) {
                        landmarksData.push({
                            label: "Audio",
                            links: pubJson.loa,
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
function navLeftOrRight(_right, _publicationJsonUrl, _publication) {
}
//# sourceMappingURL=index.js.map