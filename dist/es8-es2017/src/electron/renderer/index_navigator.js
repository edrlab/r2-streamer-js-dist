"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debounce = require("debounce");
const electron_1 = require("electron");
const events_1 = require("../common/events");
const sessions_1 = require("../common/sessions");
const _webviews = [];
function handleLink(href, publicationJsonUrl) {
    console.log(href);
    const prefix = publicationJsonUrl.replace("manifest.json", "");
    if (href.startsWith(prefix)) {
        loadLink(href, href.replace(prefix, ""), publicationJsonUrl);
    }
    else {
        electron_1.shell.openExternal(href);
    }
}
exports.handleLink = handleLink;
function createWebView(publicationJsonUrl) {
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
            handleLink(event.args[0], publicationJsonUrl);
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
function startNavigatorExperiment(publicationJsonUrl) {
    document.body.style.backgroundColor = "silver";
    const h1 = document.querySelector("html > body > h1");
    if (h1) {
        h1.style.color = "green";
    }
    const readerControls = document.getElementById("reader_controls");
    const showControlsButton = document.getElementById("showControlsButton");
    if (showControlsButton) {
        showControlsButton.style.display = "block";
        showControlsButton.addEventListener("click", (_event) => {
            if (readerControls) {
                readerControls.style.display = "block";
            }
            const hideControlsButt = document.getElementById("hideControlsButton");
            if (hideControlsButt) {
                hideControlsButt.style.display = "block ";
            }
        });
    }
    const webviewFull = createWebView(publicationJsonUrl);
    _webviews.push(webviewFull);
    const publicationViewport = document.getElementById("publication_viewport");
    if (publicationViewport) {
        publicationViewport.appendChild(webviewFull);
    }
    const hideControlsButton = document.getElementById("hideControlsButton");
    if (hideControlsButton) {
        hideControlsButton.addEventListener("click", (_event) => {
            if (readerControls) {
                readerControls.style.display = "none";
            }
            hideControlsButton.style.display = "none";
        });
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
            const readerControlsSpine = document.getElementById("reader_controls_SPINE");
            let firstLinear;
            publicationJson.spine.forEach((spineItem) => {
                if (!firstLinear) {
                    firstLinear = spineItem;
                }
                const spineItemLink = document.createElement("a");
                const spineItemLinkHref = publicationJsonUrl + "/../" + spineItem.href;
                spineItemLink.setAttribute("href", spineItemLinkHref);
                spineItemLink.setAttribute("data-href", spineItem.href);
                spineItemLink.addEventListener("click", (event) => {
                    event.preventDefault();
                    loadLink(spineItemLinkHref, spineItem.href, publicationJsonUrl);
                });
                spineItemLink.appendChild(document.createTextNode(spineItem.href));
                if (readerControlsSpine) {
                    readerControlsSpine.appendChild(spineItemLink);
                    readerControlsSpine.appendChild(document.createElement("br"));
                }
            });
            if (firstLinear) {
                setTimeout(() => {
                    const firstLinearLinkHref = publicationJsonUrl + "/../" + firstLinear.href;
                    loadLink(firstLinearLinkHref, firstLinear.href, publicationJsonUrl);
                }, 200);
            }
        }
        if (publicationJson.toc && publicationJson.toc.length) {
            const readerControlsToc = document.getElementById("reader_controls_TOC");
            if (readerControlsToc) {
                appendToc(publicationJson.toc, readerControlsToc, publicationJsonUrl);
            }
        }
        if (publicationJson["page-list"] && publicationJson["page-list"].length) {
            const readerControlsPageList = document.getElementById("reader_controls_PAGELIST");
            if (readerControlsPageList) {
                appendToc(publicationJson["page-list"], readerControlsPageList, publicationJsonUrl);
            }
        }
        const readerControlsLandmarks = document.getElementById("reader_controls_LANDMARKS");
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
    })();
}
exports.startNavigatorExperiment = startNavigatorExperiment;
function appendToc(json, anchor, publicationJsonUrl) {
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
            tocLink.addEventListener("click", (event) => {
                event.preventDefault();
                loadLink(tocLinkHref, tocLinkJson.href, publicationJsonUrl);
            });
            tocLink.appendChild(document.createTextNode(tocLinkJson.title));
            li.appendChild(tocLink);
            const br = document.createElement("br");
            li.appendChild(br);
            const tocHeading = document.createElement("span");
            tocHeading.appendChild(document.createTextNode(tocLinkJson.href));
            li.appendChild(tocHeading);
        }
        else {
            const tocHeading = document.createElement("span");
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