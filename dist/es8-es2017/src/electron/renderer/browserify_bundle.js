(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const index_navigator_1 = require("./index_navigator");
const querystring_1 = require("./querystring");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
const queryParams = querystring_1.getURLQueryParams();
const publicationJsonUrl = queryParams["pub"];
console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
const lcpHint = queryParams["lcpHint"];
window.onerror = (err) => {
    console.log("Error", err);
};
electron_1.ipcRenderer.on("tryLcpPass", (_event, okay, message) => {
    console.log(okay);
    console.log(message);
    const lcpPassInput = document.getElementById("lcpPassInput");
    if (!lcpPassInput) {
        return;
    }
    lcpPassInput.value = message;
    if (okay) {
        setTimeout(() => {
            const lcpPassForm = document.getElementById("lcpPassForm");
            if (!lcpPassForm) {
                return;
            }
            lcpPassForm.style.display = "none";
        }, 1000);
    }
});
window.addEventListener("DOMContentLoaded", () => {
    const pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
    console.log(pathBase64);
    const pathDecoded = window.atob(pathBase64);
    console.log(pathDecoded);
    const pathFileName = pathDecoded.substr(pathDecoded.lastIndexOf("/") + 1, pathDecoded.length - 1);
    const h1 = document.querySelector("html > body > h1 > span");
    if (h1) {
        h1.textContent = pathFileName;
    }
    const lcpPassForm = document.getElementById("lcpPassForm");
    if (!lcpPassForm) {
        return;
    }
    const lcpPassInput = document.getElementById("lcpPassInput");
    if (!lcpPassInput) {
        return;
    }
    if (lcpHint) {
        lcpPassInput.value = lcpHint;
        lcpPassForm.style.display = "inline-block";
        lcpPassForm.addEventListener("submit", (evt) => {
            if (evt) {
                evt.preventDefault();
            }
            const lcpPass = lcpPassInput.value;
            electron_1.ipcRenderer.send("tryLcpPass", pathDecoded, lcpPass);
            return false;
        });
    }
    const buttStart = document.getElementById("buttonStart");
    if (!buttStart) {
        return;
    }
    buttStart.addEventListener("click", () => {
        buttStart.setAttribute("disabled", "");
        buttStart.style.display = "none";
        index_navigator_1.startNavigatorExperiment(publicationJsonUrl);
    });
    const buttonDebug = document.getElementById("buttonDebug");
    if (!buttonDebug) {
        return;
    }
    buttonDebug.addEventListener("click", () => {
        if (document.documentElement.classList.contains("debug")) {
            document.documentElement.classList.remove("debug");
        }
        else {
            document.documentElement.classList.add("debug");
        }
    });
    const buttonDevTools = document.getElementById("buttonDevTools");
    if (!buttonDevTools) {
        return;
    }
    buttonDevTools.addEventListener("click", () => {
        electron_1.ipcRenderer.send("devtools", "test");
    });
});

},{"./index_navigator":2,"./querystring":3,"electron":undefined}],2:[function(require,module,exports){
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

},{"debounce":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getURLQueryParams = () => {
    const params = {};
    let query = window.location.search;
    if (query && query.length) {
        query = query.substring(1);
        const keyParams = query.split("&");
        keyParams.forEach((keyParam) => {
            const keyVal = keyParam.split("=");
            if (keyVal.length > 1) {
                params[keyVal[0]] = decodeURIComponent(keyVal[1]);
            }
        });
    }
    return params;
};

},{}],4:[function(require,module,exports){
/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

},{}]},{},[1])
//# sourceMappingURL=browserify_bundle.js.map
