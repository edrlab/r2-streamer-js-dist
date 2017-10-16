"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debounce = require("debounce");
const electron_1 = require("electron");
const electron_2 = require("electron");
const events_1 = require("../common/events");
const sessions_1 = require("../common/sessions");
const querystring_1 = require("./querystring");
const index_1 = require("./riots/spinelist/index_");
const index_2 = require("./riots/spinelistgroup/index_");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
const queryParams = querystring_1.getURLQueryParams();
const publicationJsonUrl = queryParams["pub"];
console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
const pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
console.log(pathBase64);
const pathDecoded = window.atob(pathBase64);
console.log(pathDecoded);
const pathFileName = pathDecoded.substr(pathDecoded.replace(/\\/g, "/").lastIndexOf("/") + 1, pathDecoded.length - 1);
const lcpHint = queryParams["lcpHint"];
const basicLinkTitles = true;
let snackBar;
let drawer;
function handleLink(href) {
    console.log(href);
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
    console.log("R2_EVENT_LINK");
    console.log(href);
    handleLink(href);
});
electron_1.ipcRenderer.on(events_1.R2_EVENT_TRY_LCP_PASS_RES, (_event, okay, msg) => {
    console.log("R2_EVENT_TRY_LCP_PASS_RES");
    console.log(okay);
    console.log(msg);
    if (!okay) {
        showLcpDialog(msg);
        return;
    }
    const message = "Correct publication passphrase.";
    const data = {
        actionHandler: () => {
            console.log("SnackBar OK");
        },
        actionOnBottom: false,
        actionText: "OK",
        message,
        multiline: false,
        timeout: 2000,
    };
    snackBar.show(data);
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
        }
    }, 1000);
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
    const snackBarElem = document.getElementById("snackbar");
    snackBar = new window.mdc.snackbar.MDCSnackbar(snackBarElem);
    snackBar.dismissesOnAction = true;
    const drawerElement = document.getElementById("drawer");
    drawer = new window.mdc.drawer.MDCTemporaryDrawer(drawerElement);
    const drawerButton = document.getElementById("drawerButton");
    if (drawerButton) {
        drawerButton.addEventListener("click", () => {
            drawer.open = true;
        });
    }
    if (drawerElement) {
        drawerElement.addEventListener("MDCTemporaryDrawer:open", () => {
            console.log("MDCTemporaryDrawer:open");
        });
        drawerElement.addEventListener("MDCTemporaryDrawer:close", () => {
            console.log("MDCTemporaryDrawer:close");
        });
    }
    const selectElement = document.getElementById("nav-select");
    const navSelector = new window.mdc.select.MDCSelect(selectElement);
    navSelector.listen("MDCSelect:change", (ev) => {
        console.log("MDCSelect:change");
        console.log(ev);
        console.log(ev.detail.selectedOptions[0].textContent);
        console.log(ev.detail.selectedIndex);
        console.log(ev.detail.value);
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
    lcpDialog.listen("MDCDialog:accept", () => {
        console.log("MDCDialog:accept");
        const lcpPass = lcpPassInput.value;
        electron_1.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPass);
    });
    lcpDialog.listen("MDCDialog:cancel", () => {
        console.log("MDCDialog:cancel");
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
    const buttonDark = document.getElementById("buttonDark");
    if (buttonDark) {
        buttonDark.addEventListener("click", () => {
            if (document.body.classList.contains("mdc-theme--dark")) {
                document.body.classList.remove("mdc-theme--dark");
            }
            else {
                document.body.classList.add("mdc-theme--dark");
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
        console.log("webview1 ipc-message");
        console.log(event.channel);
        if (event.channel === events_1.R2_EVENT_LINK) {
            handleLink(event.args[0]);
        }
    });
    webview1.addEventListener("dom-ready", () => {
        console.log("WEBVIEW DOM READY: " + _webviews.length);
        webview1.clearHistory();
        const cssButtonN1 = document.getElementById("cssButtonInject");
        if (cssButtonN1) {
            cssButtonN1.removeAttribute("disabled");
        }
        const cssButtonN2 = document.getElementById("cssButtonReset");
        if (cssButtonN2) {
            cssButtonN2.removeAttribute("disabled");
        }
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
    const cssButton1 = document.getElementById("cssButtonInject");
    if (cssButton1) {
        cssButton1.addEventListener("click", (_event) => {
            const jsonMsg = { injectCSS: "yes", setCSS: "ok" };
            _webviews.forEach((wv) => {
                wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg));
            });
        });
    }
    const cssButton2 = document.getElementById("cssButtonReset");
    if (cssButton2) {
        cssButton2.addEventListener("click", (_event) => {
            const jsonMsg = { injectCSS: "rollback", setCSS: "rollback" };
            _webviews.forEach((wv) => {
                wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg));
            });
        });
    }
    (async () => {
        let response;
        try {
            response = await fetch(publicationJsonUrl);
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
        response.headers.forEach((arg0, arg1) => {
            console.log(arg0 + " => " + arg1);
        });
        let publicationJson;
        try {
            publicationJson = await response.json();
        }
        catch (e) {
            console.log(e);
        }
        if (!publicationJson) {
            return;
        }
        console.log(publicationJson);
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
            index_1.riotMountSpineList("#reader_controls_SPINE", { spine: publicationJson.spine, url: publicationJsonUrl, basic: basicLinkTitles });
            const firstLinear = publicationJson.spine.length ? publicationJson.spine[0] : undefined;
            if (firstLinear) {
                setTimeout(() => {
                    const firstLinearLinkHref = publicationJsonUrl + "/../" + firstLinear.href;
                    handleLink(firstLinearLinkHref);
                }, 200);
            }
        }
        if (publicationJson.toc && publicationJson.toc.length) {
            const readerControlsToc = document.getElementById("reader_controls_TOC");
            if (readerControlsToc) {
                appendToc(publicationJson.toc, readerControlsToc);
            }
        }
        if (publicationJson["page-list"] && publicationJson["page-list"].length) {
            index_1.riotMountSpineList("#reader_controls_PAGELIST", { spine: publicationJson["page-list"], url: publicationJsonUrl, basic: basicLinkTitles });
        }
        const landmarksData = [];
        if (publicationJson.landmarks && publicationJson.landmarks.length) {
            landmarksData.push({
                label: "Main",
                spine: publicationJson.landmarks,
                url: publicationJsonUrl,
            });
        }
        if (publicationJson.lot && publicationJson.lot.length) {
            landmarksData.push({
                label: "Tables",
                spine: publicationJson.lot,
                url: publicationJsonUrl,
            });
        }
        if (publicationJson.loi && publicationJson.loi.length) {
            landmarksData.push({
                label: "Illustrations",
                spine: publicationJson.loi,
                url: publicationJsonUrl,
            });
        }
        if (publicationJson.lov && publicationJson.lov.length) {
            landmarksData.push({
                label: "Video",
                spine: publicationJson.lov,
                url: publicationJsonUrl,
            });
        }
        if (publicationJson.loa && publicationJson.loa.length) {
            landmarksData.push({
                label: "Audio",
                spine: publicationJson.loa,
                url: publicationJsonUrl,
            });
        }
        if (landmarksData.length) {
            index_2.riotMountSpineListGroup("#reader_controls_LANDMARKS", { spinegroup: landmarksData, url: publicationJsonUrl, basic: basicLinkTitles });
        }
    })();
}
function appendToc(json, anchor) {
    const ul = document.createElement("ul");
    json.forEach((tocLinkJson) => {
        const li = document.createElement("li");
        if (!tocLinkJson.title) {
            tocLinkJson.title = "xxx";
        }
        if (tocLinkJson.href) {
            const tocLink = document.createElement("a");
            const tocLinkHref = publicationJsonUrl + "/../" + tocLinkJson.href;
            tocLink.setAttribute("href", tocLinkHref);
            tocLink.setAttribute("data-href", tocLinkJson.href);
            tocLink.setAttribute("title", tocLinkJson.href);
            tocLink.addEventListener("click", (event) => {
                event.preventDefault();
                handleLink(tocLinkHref);
            });
            const linkSpan = document.createElement("span");
            linkSpan.setAttribute("class", "mdc-list-item__text");
            linkSpan.appendChild(document.createTextNode(tocLinkJson.title));
            if (!basicLinkTitles) {
                const tocHeading = document.createElement("span");
                tocHeading.setAttribute("class", "mdc-list-item__text__secondary");
                tocHeading.appendChild(document.createTextNode(tocLinkJson.href));
                linkSpan.appendChild(tocHeading);
            }
            tocLink.appendChild(linkSpan);
            li.appendChild(tocLink);
        }
        else {
            const tocHeading = document.createElement("span");
            tocHeading.setAttribute("class", "mdc-list-item__text__secondary");
            tocHeading.appendChild(document.createTextNode(tocLinkJson.title));
            li.appendChild(tocHeading);
        }
        ul.appendChild(li);
        if (tocLinkJson.children && tocLinkJson.children.length) {
            appendToc(tocLinkJson.children, li);
        }
    });
    anchor.appendChild(ul);
}
function navLeftOrRight(_right, _publicationJsonUrl, _publicationJson) {
}
//# sourceMappingURL=index.js.map