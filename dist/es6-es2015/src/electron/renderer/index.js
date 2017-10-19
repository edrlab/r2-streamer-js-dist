"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debounce = require("debounce");
const electron_1 = require("electron");
const electron_2 = require("electron");
const events_1 = require("../common/events");
const sessions_1 = require("../common/sessions");
const querystring_1 = require("./querystring");
const index_1 = require("./riots/linklist/index_");
const index_2 = require("./riots/linklistgroup/index_");
const index_3 = require("./riots/linktree/index_");
const ElectronStore = require("electron-store");
const queryParams = querystring_1.getURLQueryParams();
const publicationJsonUrl = queryParams["pub"];
const pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
const pathDecoded = window.atob(pathBase64);
const pathFileName = pathDecoded.substr(pathDecoded.replace(/\\/g, "/").lastIndexOf("/") + 1, pathDecoded.length - 1);
const lcpHint = queryParams["lcpHint"];
const defaultsStyling = {
    dark: false,
    font: "DEFAULT",
    invert: false,
    night: false,
    readiumcss: false,
    sepia: false,
};
const defaults = {
    basicLinkTitles: true,
    styling: defaultsStyling,
};
const electronStore = new ElectronStore({
    defaults,
    name: "readium2-navigator",
});
electronStore.onDidChange("styling.night", (newValue, oldValue) => {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    const nightSwitch = document.getElementById("night_switch-input");
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
const readiumCssOnOff = () => {
    const on = electronStore.get("styling.readiumcss");
    if (on) {
        const dark = electronStore.get("styling.dark");
        const font = electronStore.get("styling.font");
        const invert = electronStore.get("styling.invert");
        const night = electronStore.get("styling.night");
        const sepia = electronStore.get("styling.sepia");
        const cssJson = {
            dark,
            font,
            invert,
            night,
            sepia,
        };
        const jsonMsg = { injectCSS: "yes", setCSS: cssJson };
        _webviews.forEach((wv) => {
            wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg));
        });
    }
    else {
        const jsonMsg = { injectCSS: "rollback", setCSS: "rollback" };
        _webviews.forEach((wv) => {
            wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg));
        });
    }
};
electronStore.onDidChange("styling.readiumcss", (newValue, oldValue) => {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    const readiumcssSwitch = document.getElementById("readiumcss_switch-input");
    if (readiumcssSwitch) {
        readiumcssSwitch.checked = newValue;
    }
    readiumCssOnOff();
    const nightSwitch = document.getElementById("night_switch-input");
    if (nightSwitch) {
        nightSwitch.disabled = !newValue;
    }
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.mdcSelect.disabled = !newValue;
    }
    if (!newValue) {
        electronStore.set("styling.night", false);
    }
});
const initFontSelect = () => {
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        const font = electronStore.get("styling.font");
        const i = font === "OLD" ? 1 :
            (font === "MODERN" ? 2 :
                (font === "SANS" ? 3 :
                    (font === "HUMAN" ? 4 :
                        (font === "DYS" ? 5 :
                            0))));
        fontSelect.mdcSelect.selectedIndex = i;
        fontSelect.mdcSelect.disabled = !electronStore.get("styling.readiumcss");
    }
};
electronStore.onDidChange("styling.font", (newValue, oldValue) => {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    initFontSelect();
    readiumCssOnOff();
});
electronStore.onDidChange("basicLinkTitles", (newValue, oldValue) => {
    if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
        return;
    }
    const basicSwitch = document.getElementById("nav_basic_switch-input");
    if (basicSwitch) {
        basicSwitch.checked = !newValue;
    }
});
let snackBar;
let drawer;
function handleLink(href) {
    const prefix = publicationJsonUrl.replace("manifest.json", "");
    if (href.startsWith(prefix)) {
        if (drawer.open) {
            drawer.open = false;
            setTimeout(() => {
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
window.onerror = (err) => {
    console.log("Error", err);
};
electron_1.ipcRenderer.on(events_1.R2_EVENT_LINK, (_event, href) => {
    handleLink(href);
});
electron_1.ipcRenderer.on(events_1.R2_EVENT_TRY_LCP_PASS_RES, (_event, okay, msg) => {
    if (!okay) {
        setTimeout(() => {
            showLcpDialog(msg);
        }, 500);
        return;
    }
    startNavigatorExperiment();
});
let lcpDialog;
function showLcpDialog(message) {
    const lcpPassHint = document.getElementById("lcpPassHint");
    lcpPassHint.textContent = lcpHint;
    if (message) {
        const lcpPassMessage = document.getElementById("lcpPassMessage");
        lcpPassMessage.textContent = message;
    }
    lcpDialog.show();
    setTimeout(() => {
        const lcpPassInput = document.getElementById("lcpPassInput");
        if (lcpPassInput) {
            lcpPassInput.focus();
            setTimeout(() => {
                lcpPassInput.classList.add("no-focus-outline");
            }, 500);
        }
    }, 800);
}
function installKeyboardMouseFocusHandler() {
    let dateLastKeyboardEvent = new Date();
    let dateLastMouseEvent = new Date();
    document.body.addEventListener("focusin", debounce((ev) => {
        const focusWasTriggeredByMouse = dateLastMouseEvent > dateLastKeyboardEvent;
        if (focusWasTriggeredByMouse) {
            if (ev.target && ev.target.classList) {
                ev.target.classList.add("no-focus-outline");
            }
        }
    }, 500));
    document.body.addEventListener("focusout", (ev) => {
        if (ev.target && ev.target.classList) {
            ev.target.classList.remove("no-focus-outline");
        }
    });
    document.body.addEventListener("mousedown", () => {
        dateLastMouseEvent = new Date();
    });
    document.body.addEventListener("keydown", () => {
        dateLastKeyboardEvent = new Date();
    });
}
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        window.mdc.autoInit();
    }, 500);
    window.document.title = "Readium2 [ " + pathFileName + "]";
    const h1 = document.getElementById("pubTitle");
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
    const menuFactory = (menuEl) => {
        const menu = new window.mdc.menu.MDCSimpleMenu(menuEl);
        menuEl.mdcSimpleMenu = menu;
        return menu;
    };
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        const fontSelector = new window.mdc.select.MDCSelect(fontSelect, undefined, menuFactory);
        fontSelect.mdcSelect = fontSelector;
    }
    const snackBarElem = document.getElementById("snackbar");
    snackBar = new window.mdc.snackbar.MDCSnackbar(snackBarElem);
    snackBarElem.mdcSnackbar = snackBar;
    snackBar.dismissesOnAction = true;
    const drawerElement = document.getElementById("drawer");
    drawer = new window.mdc.drawer.MDCTemporaryDrawer(drawerElement);
    drawerElement.mdcTemporaryDrawer = drawer;
    const drawerButton = document.getElementById("drawerButton");
    if (drawerButton) {
        drawerButton.addEventListener("click", () => {
            drawer.open = true;
        });
    }
    if (drawerElement) {
        drawerElement.addEventListener("click", (ev) => {
            const allMenus = drawerElement.querySelectorAll(".mdc-simple-menu");
            const openedMenus = [];
            allMenus.forEach((elem) => {
                if (elem.mdcSimpleMenu && elem.mdcSimpleMenu.open) {
                    openedMenus.push(elem);
                }
            });
            let needsToCloseMenus = true;
            let currElem = ev.target;
            while (currElem) {
                if (openedMenus.indexOf(currElem) >= 0) {
                    needsToCloseMenus = false;
                    break;
                }
                currElem = currElem.parentNode;
            }
            if (needsToCloseMenus) {
                openedMenus.forEach((elem) => {
                    elem.mdcSimpleMenu.open = false;
                    const ss = elem.parentNode.querySelector(".mdc-select__selected-text");
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
    const selectElement = document.getElementById("nav-select");
    const navSelector = new window.mdc.select.MDCSelect(selectElement, undefined, menuFactory);
    selectElement.mdcSelect = navSelector;
    navSelector.listen("MDCSelect:change", (ev) => {
        const activePanel = document.querySelector(".tabPanel.active");
        if (activePanel) {
            activePanel.classList.remove("active");
        }
        const newActivePanel = document.querySelector(".tabPanel:nth-child(" + (ev.detail.selectedIndex + 1) + ")");
        if (newActivePanel) {
            newActivePanel.classList.add("active");
        }
    });
    const diagElem = document.querySelector("#lcpDialog");
    const lcpPassInput = document.getElementById("lcpPassInput");
    lcpDialog = new window.mdc.dialog.MDCDialog(diagElem);
    diagElem.mdcDialog = lcpDialog;
    lcpDialog.listen("MDCDialog:accept", () => {
        const lcpPass = lcpPassInput.value;
        electron_1.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPass);
    });
    lcpDialog.listen("MDCDialog:cancel", () => {
        setTimeout(() => {
            showLcpDialog();
        }, 10);
    });
    if (lcpPassInput) {
        lcpPassInput.addEventListener("keyup", (ev) => {
            if (ev.keyCode === 13) {
                ev.preventDefault();
                const lcpDialogAcceptButton = document.getElementById("lcpDialogAcceptButton");
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
    const buttonClearSettings = document.getElementById("buttonClearSettings");
    if (buttonClearSettings) {
        buttonClearSettings.addEventListener("click", () => {
            electronStore.store = defaults;
            drawer.open = false;
            setTimeout(() => {
                const message = "Settings reset.";
                const data = {
                    actionHandler: () => {
                    },
                    actionOnBottom: false,
                    actionText: "OK",
                    message,
                    multiline: false,
                    timeout: 2000,
                };
                snackBar.show(data);
            }, 500);
        });
    }
    const buttonClearSettingsStyle = document.getElementById("buttonClearSettingsStyle");
    if (buttonClearSettingsStyle) {
        buttonClearSettingsStyle.addEventListener("click", () => {
            electronStore.set("styling", defaultsStyling);
            drawer.open = false;
            setTimeout(() => {
                const message = "Default styles.";
                const data = {
                    actionHandler: () => {
                    },
                    actionOnBottom: false,
                    actionText: "OK",
                    message,
                    multiline: false,
                    timeout: 2000,
                };
                snackBar.show(data);
            }, 500);
        });
    }
    const buttonOpenSettings = document.getElementById("buttonOpenSettings");
    if (buttonOpenSettings) {
        buttonOpenSettings.addEventListener("click", () => {
            electronStore.openInEditor();
        });
    }
    const buttonDebug = document.getElementById("buttonDebug");
    if (buttonDebug) {
        buttonDebug.addEventListener("click", () => {
            if (document.documentElement.classList.contains("debug")) {
                document.documentElement.classList.remove("debug");
            }
            else {
                document.documentElement.classList.add("debug");
            }
        });
    }
});
const _webviews = [];
function createWebView() {
    const webview1 = document.createElement("webview");
    webview1.setAttribute("class", "singleFull");
    webview1.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, javascript=1, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    webview1.setAttribute("partition", sessions_1.R2_SESSION_WEBVIEW);
    webview1.setAttribute("httpreferrer", publicationJsonUrl);
    webview1.setAttribute("preload", "./preload.js");
    webview1.setAttribute("disableguestresize", "");
    webview1.addEventListener("ipc-message", (event) => {
        if (event.channel === events_1.R2_EVENT_LINK) {
            handleLink(event.args[0]);
        }
    });
    webview1.addEventListener("dom-ready", () => {
        webview1.clearHistory();
        readiumCssOnOff();
    });
    return webview1;
}
window.addEventListener("resize", debounce(() => {
    _webviews.forEach((wv) => {
        const width = wv.clientWidth;
        const height = wv.clientHeight;
        const wc = wv.getWebContents();
        if (wc && width && height) {
            wc.setSize({
                normal: {
                    height,
                    width,
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
    const webviewFull = createWebView();
    _webviews.push(webviewFull);
    const publicationViewport = document.getElementById("publication_viewport");
    if (publicationViewport) {
        publicationViewport.appendChild(webviewFull);
    }
    initFontSelect();
    const fontSelect = document.getElementById("fontSelect");
    if (fontSelect) {
        fontSelect.mdcSelect.listen("MDCSelect:change", (ev) => {
            const index = ev.detail.selectedIndex;
            const ff = index === 0 ? "DEFAULT" :
                (index === 1 ? "OLD" :
                    (index === 2 ? "MODERN" :
                        (index === 3 ? "SANS" :
                            (index === 4 ? "HUMAN" :
                                (index === 5 ? "DYS" :
                                    "DEFAULT")))));
            electronStore.set("styling.font", ff);
        });
    }
    const nightSwitch = document.getElementById("night_switch-input");
    if (nightSwitch) {
        nightSwitch.checked = electronStore.get("styling.night");
        nightSwitch.addEventListener("change", (_event) => {
            const checked = nightSwitch.checked;
            electronStore.set("styling.night", checked);
        });
        nightSwitch.disabled = !electronStore.get("styling.readiumcss");
    }
    const readiumcssSwitch = document.getElementById("readiumcss_switch-input");
    if (readiumcssSwitch) {
        readiumcssSwitch.checked = electronStore.get("styling.readiumcss");
        readiumcssSwitch.addEventListener("change", (_event) => {
            const checked = readiumcssSwitch.checked;
            electronStore.set("styling.readiumcss", checked);
        });
    }
    const basicSwitch = document.getElementById("nav_basic_switch-input");
    if (basicSwitch) {
        basicSwitch.checked = !electronStore.get("basicLinkTitles");
        basicSwitch.addEventListener("change", (_event) => {
            const checked = basicSwitch.checked;
            electronStore.set("basicLinkTitles", !checked);
        });
    }
    (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield fetch(publicationJsonUrl);
        }
        catch (e) {
            console.log(e);
        }
        if (!response) {
            return;
        }
        if (!response.ok) {
            console.log("BAD RESPONSE?!");
        }
        let publicationJson;
        try {
            publicationJson = yield response.json();
        }
        catch (e) {
            console.log(e);
        }
        if (!publicationJson) {
            return;
        }
        if (publicationJson.metadata && publicationJson.metadata.title) {
            const h1 = document.getElementById("pubTitle");
            if (h1) {
                h1.textContent = publicationJson.metadata.title;
            }
        }
        const buttonNavLeft = document.getElementById("buttonNavLeft");
        if (buttonNavLeft) {
            buttonNavLeft.addEventListener("click", (_event) => {
                navLeftOrRight(false, publicationJsonUrl, publicationJson);
            });
        }
        const buttonNavRight = document.getElementById("buttonNavRight");
        if (buttonNavRight) {
            buttonNavRight.addEventListener("click", (_event) => {
                navLeftOrRight(true, publicationJsonUrl, publicationJson);
            });
        }
        if (publicationJson.spine) {
            const opts = {
                basic: true,
                fixBasic: true,
                links: publicationJson.spine,
                url: publicationJsonUrl,
            };
            index_1.riotMountLinkList("#reader_controls_SPINE", opts);
            const firstLinear = publicationJson.spine.length ? publicationJson.spine[0] : undefined;
            if (firstLinear) {
                setTimeout(() => {
                    const firstLinearLinkHref = publicationJsonUrl + "/../" + firstLinear.href;
                    handleLink(firstLinearLinkHref);
                }, 200);
            }
        }
        if (publicationJson.toc && publicationJson.toc.length) {
            const opts = {
                basic: electronStore.get("basicLinkTitles"),
                links: publicationJson.toc,
                url: publicationJsonUrl,
            };
            const tag = index_3.riotMountLinkTree("#reader_controls_TOC", opts)[0];
            electronStore.onDidChange("basicLinkTitles", (newValue, oldValue) => {
                if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
                    return;
                }
                tag.setBasic(newValue);
            });
        }
        if (publicationJson["page-list"] && publicationJson["page-list"].length) {
            const opts = {
                basic: electronStore.get("basicLinkTitles"),
                links: publicationJson["page-list"],
                url: publicationJsonUrl,
            };
            const tag = index_1.riotMountLinkList("#reader_controls_PAGELIST", opts)[0];
            electronStore.onDidChange("basicLinkTitles", (newValue, oldValue) => {
                if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
                    return;
                }
                tag.setBasic(newValue);
            });
        }
        const landmarksData = [];
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
            const opts = {
                basic: electronStore.get("basicLinkTitles"),
                linksgroup: landmarksData,
                url: publicationJsonUrl,
            };
            const tag = index_2.riotMountLinkListGroup("#reader_controls_LANDMARKS", opts)[0];
            electronStore.onDidChange("basicLinkTitles", (newValue, oldValue) => {
                if (typeof newValue === "undefined" || typeof oldValue === "undefined") {
                    return;
                }
                tag.setBasic(newValue);
            });
        }
    }))();
}
function navLeftOrRight(_right, _publicationJsonUrl, _publicationJson) {
}
//# sourceMappingURL=index.js.map