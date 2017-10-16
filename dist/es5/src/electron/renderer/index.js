"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debounce = require("debounce");
var electron_1 = require("electron");
var electron_2 = require("electron");
var events_1 = require("../common/events");
var sessions_1 = require("../common/sessions");
var querystring_1 = require("./querystring");
var index_1 = require("./riots/spinelist/index_");
var index_2 = require("./riots/spinelistgroup/index_");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
var queryParams = querystring_1.getURLQueryParams();
var publicationJsonUrl = queryParams["pub"];
console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
var pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
console.log(pathBase64);
var pathDecoded = window.atob(pathBase64);
console.log(pathDecoded);
var pathFileName = pathDecoded.substr(pathDecoded.replace(/\\/g, "/").lastIndexOf("/") + 1, pathDecoded.length - 1);
var lcpHint = queryParams["lcpHint"];
var basicLinkTitles = true;
var snackBar;
var drawer;
function handleLink(href) {
    console.log(href);
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
    console.log("R2_EVENT_LINK");
    console.log(href);
    handleLink(href);
});
electron_1.ipcRenderer.on(events_1.R2_EVENT_TRY_LCP_PASS_RES, function (_event, okay, msg) {
    console.log("R2_EVENT_TRY_LCP_PASS_RES");
    console.log(okay);
    console.log(msg);
    if (!okay) {
        showLcpDialog(msg);
        return;
    }
    var message = "Correct publication passphrase.";
    var data = {
        actionHandler: function () {
            console.log("SnackBar OK");
        },
        actionOnBottom: false,
        actionText: "OK",
        message: message,
        multiline: false,
        timeout: 2000,
    };
    snackBar.show(data);
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
        }
    }, 1000);
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
    var snackBarElem = document.getElementById("snackbar");
    snackBar = new window.mdc.snackbar.MDCSnackbar(snackBarElem);
    snackBar.dismissesOnAction = true;
    var drawerElement = document.getElementById("drawer");
    drawer = new window.mdc.drawer.MDCTemporaryDrawer(drawerElement);
    var drawerButton = document.getElementById("drawerButton");
    if (drawerButton) {
        drawerButton.addEventListener("click", function () {
            drawer.open = true;
        });
    }
    if (drawerElement) {
        drawerElement.addEventListener("MDCTemporaryDrawer:open", function () {
            console.log("MDCTemporaryDrawer:open");
        });
        drawerElement.addEventListener("MDCTemporaryDrawer:close", function () {
            console.log("MDCTemporaryDrawer:close");
        });
    }
    var selectElement = document.getElementById("nav-select");
    var navSelector = new window.mdc.select.MDCSelect(selectElement);
    navSelector.listen("MDCSelect:change", function (ev) {
        console.log("MDCSelect:change");
        console.log(ev);
        console.log(ev.detail.selectedOptions[0].textContent);
        console.log(ev.detail.selectedIndex);
        console.log(ev.detail.value);
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
    lcpDialog.listen("MDCDialog:accept", function () {
        console.log("MDCDialog:accept");
        var lcpPass = lcpPassInput.value;
        electron_1.ipcRenderer.send(events_1.R2_EVENT_TRY_LCP_PASS, pathDecoded, lcpPass);
    });
    lcpDialog.listen("MDCDialog:cancel", function () {
        console.log("MDCDialog:cancel");
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
    var buttonDark = document.getElementById("buttonDark");
    if (buttonDark) {
        buttonDark.addEventListener("click", function () {
            if (document.body.classList.contains("mdc-theme--dark")) {
                document.body.classList.remove("mdc-theme--dark");
            }
            else {
                document.body.classList.add("mdc-theme--dark");
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
        console.log("webview1 ipc-message");
        console.log(event.channel);
        if (event.channel === events_1.R2_EVENT_LINK) {
            handleLink(event.args[0]);
        }
    });
    webview1.addEventListener("dom-ready", function () {
        console.log("WEBVIEW DOM READY: " + _webviews.length);
        webview1.clearHistory();
        var cssButtonN1 = document.getElementById("cssButtonInject");
        if (cssButtonN1) {
            cssButtonN1.removeAttribute("disabled");
        }
        var cssButtonN2 = document.getElementById("cssButtonReset");
        if (cssButtonN2) {
            cssButtonN2.removeAttribute("disabled");
        }
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
    var cssButton1 = document.getElementById("cssButtonInject");
    if (cssButton1) {
        cssButton1.addEventListener("click", function (_event) {
            var jsonMsg = { injectCSS: "yes", setCSS: "ok" };
            _webviews.forEach(function (wv) {
                wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg));
            });
        });
    }
    var cssButton2 = document.getElementById("cssButtonReset");
    if (cssButton2) {
        cssButton2.addEventListener("click", function (_event) {
            var jsonMsg = { injectCSS: "rollback", setCSS: "rollback" };
            _webviews.forEach(function (wv) {
                wv.send(events_1.R2_EVENT_READIUMCSS, JSON.stringify(jsonMsg));
            });
        });
    }
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var response, e_1, publicationJson, e_2, h1, buttonNavLeft, buttonNavRight, firstLinear_1, readerControlsToc, landmarksData;
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
                    response.headers.forEach(function (arg0, arg1) {
                        console.log(arg0 + " => " + arg1);
                    });
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
                    console.log(publicationJson);
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
                        index_1.riotMountSpineList("#reader_controls_SPINE", { spine: publicationJson.spine, url: publicationJsonUrl, basic: basicLinkTitles });
                        firstLinear_1 = publicationJson.spine.length ? publicationJson.spine[0] : undefined;
                        if (firstLinear_1) {
                            setTimeout(function () {
                                var firstLinearLinkHref = publicationJsonUrl + "/../" + firstLinear_1.href;
                                handleLink(firstLinearLinkHref);
                            }, 200);
                        }
                    }
                    if (publicationJson.toc && publicationJson.toc.length) {
                        readerControlsToc = document.getElementById("reader_controls_TOC");
                        if (readerControlsToc) {
                            appendToc(publicationJson.toc, readerControlsToc);
                        }
                    }
                    if (publicationJson["page-list"] && publicationJson["page-list"].length) {
                        index_1.riotMountSpineList("#reader_controls_PAGELIST", { spine: publicationJson["page-list"], url: publicationJsonUrl, basic: basicLinkTitles });
                    }
                    landmarksData = [];
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
                    return [2];
            }
        });
    }); })();
}
function appendToc(json, anchor) {
    var ul = document.createElement("ul");
    json.forEach(function (tocLinkJson) {
        var li = document.createElement("li");
        if (!tocLinkJson.title) {
            tocLinkJson.title = "xxx";
        }
        if (tocLinkJson.href) {
            var tocLink = document.createElement("a");
            var tocLinkHref_1 = publicationJsonUrl + "/../" + tocLinkJson.href;
            tocLink.setAttribute("href", tocLinkHref_1);
            tocLink.setAttribute("data-href", tocLinkJson.href);
            tocLink.setAttribute("title", tocLinkJson.href);
            tocLink.addEventListener("click", function (event) {
                event.preventDefault();
                handleLink(tocLinkHref_1);
            });
            var linkSpan = document.createElement("span");
            linkSpan.setAttribute("class", "mdc-list-item__text");
            linkSpan.appendChild(document.createTextNode(tocLinkJson.title));
            if (!basicLinkTitles) {
                var tocHeading = document.createElement("span");
                tocHeading.setAttribute("class", "mdc-list-item__text__secondary");
                tocHeading.appendChild(document.createTextNode(tocLinkJson.href));
                linkSpan.appendChild(tocHeading);
            }
            tocLink.appendChild(linkSpan);
            li.appendChild(tocLink);
        }
        else {
            var tocHeading = document.createElement("span");
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