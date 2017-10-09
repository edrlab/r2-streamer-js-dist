"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debounce = require("debounce");
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
    var webview1 = document.createElement("webview");
    webview1.setAttribute("id", "webview1");
    webview1.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, javascript=1, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    webview1.setAttribute("partition", "persist:publicationwebview");
    webview1.setAttribute("httpreferrer", publicationJsonUrl);
    webview1.setAttribute("preload", "./preload.js");
    webview1.setAttribute("disableguestresize", "");
    window.addEventListener("resize", debounce(function () {
        var width = webview1.clientWidth;
        var height = webview1.clientHeight;
        var wc = webview1.getWebContents();
        if (wc && width && height) {
            wc.setSize({
                normal: {
                    height: height,
                    width: width,
                },
            });
        }
    }, 200));
    webview1.addEventListener("ipc-message", function (event) {
        console.log("webview1 ipc-message");
        console.log(event.channel);
        if (event.channel === "readium") {
            console.log(event.args);
        }
    });
    webview1.addEventListener("dom-ready", function () {
        var cssButtonN1 = document.getElementById("cssButtonInject");
        if (!cssButtonN1) {
            return;
        }
        cssButtonN1.removeAttribute("disabled");
        var cssButtonN2 = document.getElementById("cssButtonReset");
        if (!cssButtonN2) {
            return;
        }
        cssButtonN2.removeAttribute("disabled");
    });
    var publicationViewport = document.getElementById("publication_viewport");
    if (publicationViewport) {
        publicationViewport.appendChild(webview1);
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
            webview1.send("readium", JSON.stringify(jsonMsg));
        });
    }
    var cssButton2 = document.getElementById("cssButtonReset");
    if (cssButton2) {
        cssButton2.addEventListener("click", function (_event) {
            var jsonMsg = { injectCSS: "rollback", setCSS: "rollback" };
            webview1.send("readium", JSON.stringify(jsonMsg));
        });
    }
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var response, e_1, publicationJson, e_2, readerControlsSpine_1, readerControlsToc, readerControlsPageList, readerControlsLandmarks;
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
                    if (publicationJson.spine) {
                        readerControlsSpine_1 = document.getElementById("reader_controls_SPINE");
                        publicationJson.spine.forEach(function (spineItem) {
                            var spineItemLink = document.createElement("a");
                            var spineItemLinkHref = publicationJsonUrl + "/../" + spineItem.href;
                            spineItemLink.setAttribute("href", spineItemLinkHref);
                            spineItemLink.addEventListener("click", function (event) {
                                event.preventDefault();
                                webview1.setAttribute("src", spineItemLinkHref);
                            });
                            spineItemLink.appendChild(document.createTextNode(spineItem.href));
                            if (readerControlsSpine_1) {
                                readerControlsSpine_1.appendChild(spineItemLink);
                                readerControlsSpine_1.appendChild(document.createElement("br"));
                            }
                        });
                    }
                    if (publicationJson.toc && publicationJson.toc.length) {
                        readerControlsToc = document.getElementById("reader_controls_TOC");
                        if (readerControlsToc) {
                            appendToc(publicationJson.toc, readerControlsToc, publicationJsonUrl, webview1);
                        }
                    }
                    if (publicationJson["page-list"] && publicationJson["page-list"].length) {
                        readerControlsPageList = document.getElementById("reader_controls_PAGELIST");
                        if (readerControlsPageList) {
                            appendToc(publicationJson["page-list"], readerControlsPageList, publicationJsonUrl, webview1);
                        }
                    }
                    readerControlsLandmarks = document.getElementById("reader_controls_LANDMARKS");
                    if (readerControlsLandmarks) {
                        if (publicationJson.landmarks && publicationJson.landmarks.length) {
                            appendToc(publicationJson.landmarks, readerControlsLandmarks, publicationJsonUrl, webview1);
                        }
                        if (publicationJson.lot && publicationJson.lot.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.lot, readerControlsLandmarks, publicationJsonUrl, webview1);
                        }
                        if (publicationJson.loa && publicationJson.loa.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.loa, readerControlsLandmarks, publicationJsonUrl, webview1);
                        }
                        if (publicationJson.loi && publicationJson.loi.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.loi, readerControlsLandmarks, publicationJsonUrl, webview1);
                        }
                        if (publicationJson.lov && publicationJson.lov.length) {
                            readerControlsLandmarks.appendChild(document.createElement("hr"));
                            appendToc(publicationJson.lov, readerControlsLandmarks, publicationJsonUrl, webview1);
                        }
                    }
                    return [2];
            }
        });
    }); })();
}
exports.startNavigatorExperiment = startNavigatorExperiment;
function appendToc(json, anchor, publicationJsonUrl, webview1) {
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
            tocLink.addEventListener("click", function (event) {
                event.preventDefault();
                webview1.setAttribute("src", tocLinkHref_1);
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
            appendToc(tocLinkJson.children, li, publicationJsonUrl, webview1);
        }
    });
    anchor.appendChild(ul);
}
//# sourceMappingURL=index_navigator.js.map