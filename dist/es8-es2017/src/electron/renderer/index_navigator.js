"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debounce = require("debounce");
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
    const webview1 = document.createElement("webview");
    webview1.setAttribute("id", "webview1");
    webview1.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, javascript=1, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    webview1.setAttribute("partition", "persist:publicationwebview");
    webview1.setAttribute("httpreferrer", publicationJsonUrl);
    webview1.setAttribute("preload", "./preload.js");
    webview1.setAttribute("disableguestresize", "");
    window.addEventListener("resize", debounce(() => {
        const width = webview1.clientWidth;
        const height = webview1.clientHeight;
        const wc = webview1.getWebContents();
        if (wc && width && height) {
            wc.setSize({
                normal: {
                    height,
                    width,
                },
            });
        }
    }, 200));
    webview1.addEventListener("ipc-message", (event) => {
        console.log("webview1 ipc-message");
        console.log(event.channel);
        if (event.channel === "readium") {
            console.log(event.args);
        }
    });
    webview1.addEventListener("dom-ready", () => {
        const cssButtonN1 = document.getElementById("cssButtonInject");
        if (!cssButtonN1) {
            return;
        }
        cssButtonN1.removeAttribute("disabled");
        const cssButtonN2 = document.getElementById("cssButtonReset");
        if (!cssButtonN2) {
            return;
        }
        cssButtonN2.removeAttribute("disabled");
    });
    const publicationViewport = document.getElementById("publication_viewport");
    if (publicationViewport) {
        publicationViewport.appendChild(webview1);
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
            webview1.send("readium", JSON.stringify(jsonMsg));
        });
    }
    const cssButton2 = document.getElementById("cssButtonReset");
    if (cssButton2) {
        cssButton2.addEventListener("click", (_event) => {
            const jsonMsg = { injectCSS: "rollback", setCSS: "rollback" };
            webview1.send("readium", JSON.stringify(jsonMsg));
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
        if (publicationJson.spine) {
            const readerControlsSpine = document.getElementById("reader_controls_SPINE");
            publicationJson.spine.forEach((spineItem) => {
                const spineItemLink = document.createElement("a");
                const spineItemLinkHref = publicationJsonUrl + "/../" + spineItem.href;
                spineItemLink.setAttribute("href", spineItemLinkHref);
                spineItemLink.addEventListener("click", (event) => {
                    event.preventDefault();
                    webview1.setAttribute("src", spineItemLinkHref);
                });
                spineItemLink.appendChild(document.createTextNode(spineItem.href));
                if (readerControlsSpine) {
                    readerControlsSpine.appendChild(spineItemLink);
                    readerControlsSpine.appendChild(document.createElement("br"));
                }
            });
        }
        if (publicationJson.toc && publicationJson.toc.length) {
            const readerControlsToc = document.getElementById("reader_controls_TOC");
            if (readerControlsToc) {
                appendToc(publicationJson.toc, readerControlsToc, publicationJsonUrl, webview1);
            }
        }
        if (publicationJson["page-list"] && publicationJson["page-list"].length) {
            const readerControlsPageList = document.getElementById("reader_controls_PAGELIST");
            if (readerControlsPageList) {
                appendToc(publicationJson["page-list"], readerControlsPageList, publicationJsonUrl, webview1);
            }
        }
        const readerControlsLandmarks = document.getElementById("reader_controls_LANDMARKS");
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
    })();
}
exports.startNavigatorExperiment = startNavigatorExperiment;
function appendToc(json, anchor, publicationJsonUrl, webview1) {
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
            tocLink.addEventListener("click", (event) => {
                event.preventDefault();
                webview1.setAttribute("src", tocLinkHref);
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
            appendToc(tocLinkJson.children, li, publicationJsonUrl, webview1);
        }
    });
    anchor.appendChild(ul);
}
//# sourceMappingURL=index_navigator.js.map