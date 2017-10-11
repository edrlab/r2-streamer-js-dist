"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debounce = require("debounce");
var electron_1 = require("electron");
var events_1 = require("../common/events");
var sessions_1 = require("../common/sessions");
var _webviews = [];
function handleLink(href, publicationJsonUrl) {
    console.log(href);
    var prefix = publicationJsonUrl.replace("manifest.json", "");
    if (href.startsWith(prefix)) {
        loadLink(href, href.replace(prefix, ""), publicationJsonUrl);
    }
    else {
        electron_1.shell.openExternal(href);
    }
}
exports.handleLink = handleLink;
function createWebView(publicationJsonUrl) {
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
            handleLink(event.args[0], publicationJsonUrl);
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
function startNavigatorExperiment(publicationJsonUrl) {
    var _this = this;
    document.body.style.backgroundColor = "silver";
    var h1 = document.querySelector("html > body > h1");
    if (h1) {
        h1.style.color = "green";
    }
    var readerControls = document.getElementById("reader_controls");
    var showControlsButton = document.getElementById("showControlsButton");
    if (showControlsButton) {
        showControlsButton.style.display = "block";
        showControlsButton.addEventListener("click", function (_event) {
            if (readerControls) {
                readerControls.style.display = "block";
            }
            var hideControlsButt = document.getElementById("hideControlsButton");
            if (hideControlsButt) {
                hideControlsButt.style.display = "block ";
            }
        });
    }
    var webviewFull = createWebView(publicationJsonUrl);
    _webviews.push(webviewFull);
    var publicationViewport = document.getElementById("publication_viewport");
    if (publicationViewport) {
        publicationViewport.appendChild(webviewFull);
    }
    var hideControlsButton = document.getElementById("hideControlsButton");
    if (hideControlsButton) {
        hideControlsButton.addEventListener("click", function (_event) {
            if (readerControls) {
                readerControls.style.display = "none";
            }
            hideControlsButton.style.display = "none";
        });
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
        var response, e_1, publicationJson, e_2, buttonNavLeft, buttonNavRight, readerControlsSpine_1, firstLinear_1, readerControlsToc, readerControlsPageList, readerControlsLandmarks;
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
                        readerControlsSpine_1 = document.getElementById("reader_controls_SPINE");
                        publicationJson.spine.forEach(function (spineItem) {
                            if (!firstLinear_1) {
                                firstLinear_1 = spineItem;
                            }
                            var spineItemLink = document.createElement("a");
                            var spineItemLinkHref = publicationJsonUrl + "/../" + spineItem.href;
                            spineItemLink.setAttribute("href", spineItemLinkHref);
                            spineItemLink.setAttribute("data-href", spineItem.href);
                            spineItemLink.addEventListener("click", function (event) {
                                event.preventDefault();
                                loadLink(spineItemLinkHref, spineItem.href, publicationJsonUrl);
                            });
                            spineItemLink.appendChild(document.createTextNode(spineItem.href));
                            if (readerControlsSpine_1) {
                                readerControlsSpine_1.appendChild(spineItemLink);
                                readerControlsSpine_1.appendChild(document.createElement("br"));
                            }
                        });
                        if (firstLinear_1) {
                            setTimeout(function () {
                                var firstLinearLinkHref = publicationJsonUrl + "/../" + firstLinear_1.href;
                                loadLink(firstLinearLinkHref, firstLinear_1.href, publicationJsonUrl);
                            }, 200);
                        }
                    }
                    if (publicationJson.toc && publicationJson.toc.length) {
                        readerControlsToc = document.getElementById("reader_controls_TOC");
                        if (readerControlsToc) {
                            appendToc(publicationJson.toc, readerControlsToc, publicationJsonUrl);
                        }
                    }
                    if (publicationJson["page-list"] && publicationJson["page-list"].length) {
                        readerControlsPageList = document.getElementById("reader_controls_PAGELIST");
                        if (readerControlsPageList) {
                            appendToc(publicationJson["page-list"], readerControlsPageList, publicationJsonUrl);
                        }
                    }
                    readerControlsLandmarks = document.getElementById("reader_controls_LANDMARKS");
                    if (readerControlsLandmarks) {
                        if (publicationJson.landmarks && publicationJson.landmarks.length) {
                            appendToc(publicationJson.landmarks, readerControlsLandmarks, publicationJsonUrl);
                        }
                        if (publicationJson.lot && publicationJson.lot.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.lot, readerControlsLandmarks, publicationJsonUrl);
                        }
                        if (publicationJson.loa && publicationJson.loa.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.loa, readerControlsLandmarks, publicationJsonUrl);
                        }
                        if (publicationJson.loi && publicationJson.loi.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.loi, readerControlsLandmarks, publicationJsonUrl);
                        }
                        if (publicationJson.lov && publicationJson.lov.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.lov, readerControlsLandmarks, publicationJsonUrl);
                        }
                    }
                    return [2];
            }
        });
    }); })();
}
exports.startNavigatorExperiment = startNavigatorExperiment;
function appendToc(json, anchor, publicationJsonUrl) {
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
            tocLink.addEventListener("click", function (event) {
                event.preventDefault();
                loadLink(tocLinkHref_1, tocLinkJson.href, publicationJsonUrl);
            });
            tocLink.appendChild(document.createTextNode(tocLinkJson.title));
            li.appendChild(tocLink);
            var br = document.createElement("br");
            li.appendChild(br);
            var tocHeading = document.createElement("span");
            tocHeading.appendChild(document.createTextNode(tocLinkJson.href));
            li.appendChild(tocHeading);
        }
        else {
            var tocHeading = document.createElement("span");
            tocHeading.appendChild(document.createTextNode(tocLinkJson.title));
            li.appendChild(tocHeading);
        }
        ul.appendChild(li);
        if (tocLinkJson.children && tocLinkJson.children.length) {
            appendToc(tocLinkJson.children, li, publicationJsonUrl);
        }
    });
    anchor.appendChild(ul);
}
function navLeftOrRight(_right, _publicationJsonUrl, _publicationJson) {
}
//# sourceMappingURL=index_navigator.js.map