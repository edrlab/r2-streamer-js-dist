(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var index_navigator_1 = require("./index_navigator");
var querystring_1 = require("./querystring");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
var queryParams = querystring_1.getURLQueryParams();
var publicationJsonUrl = queryParams["pub"];
console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
var lcpHint = queryParams["lcpHint"];
window.onerror = function (err) {
    console.log("Error", err);
};
electron_1.ipcRenderer.on("tryLcpPass", function (_event, okay, message) {
    console.log(okay);
    console.log(message);
    var lcpPassInput = document.getElementById("lcpPassInput");
    if (!lcpPassInput) {
        return;
    }
    lcpPassInput.value = message;
    if (okay) {
        setTimeout(function () {
            var lcpPassForm = document.getElementById("lcpPassForm");
            if (!lcpPassForm) {
                return;
            }
            lcpPassForm.style.display = "none";
        }, 1000);
    }
});
window.addEventListener("DOMContentLoaded", function () {
    var pathBase64 = publicationJsonUrl.replace(/.*\/pub\/(.*)\/manifest.json/, "$1");
    console.log(pathBase64);
    var pathDecoded = window.atob(pathBase64);
    console.log(pathDecoded);
    var pathFileName = pathDecoded.substr(pathDecoded.lastIndexOf("/") + 1, pathDecoded.length - 1);
    var h1 = document.querySelector("html > body > h1 > span");
    if (h1) {
        h1.textContent = pathFileName;
    }
    var lcpPassForm = document.getElementById("lcpPassForm");
    if (!lcpPassForm) {
        return;
    }
    var lcpPassInput = document.getElementById("lcpPassInput");
    if (!lcpPassInput) {
        return;
    }
    if (lcpHint) {
        lcpPassInput.value = lcpHint;
        lcpPassForm.style.display = "inline-block";
        lcpPassForm.addEventListener("submit", function (evt) {
            if (evt) {
                evt.preventDefault();
            }
            var lcpPass = lcpPassInput.value;
            electron_1.ipcRenderer.send("tryLcpPass", pathDecoded, lcpPass);
            return false;
        });
    }
    var buttStart = document.getElementById("buttonStart");
    if (!buttStart) {
        return;
    }
    buttStart.addEventListener("click", function () {
        buttStart.setAttribute("disabled", "");
        buttStart.style.display = "none";
        index_navigator_1.startNavigatorExperiment(publicationJsonUrl);
    });
    var buttonDebug = document.getElementById("buttonDebug");
    if (!buttonDebug) {
        return;
    }
    buttonDebug.addEventListener("click", function () {
        if (document.documentElement.classList.contains("debug")) {
            document.documentElement.classList.remove("debug");
        }
        else {
            document.documentElement.classList.add("debug");
        }
    });
    var buttonDevTools = document.getElementById("buttonDevTools");
    if (!buttonDevTools) {
        return;
    }
    buttonDevTools.addEventListener("click", function () {
        electron_1.ipcRenderer.send("devtools", "test");
    });
});

},{"./index_navigator":2,"./querystring":3,"electron":undefined}],2:[function(require,module,exports){
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

},{"debounce":4,"tslib":5}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getURLQueryParams = function () {
    var params = {};
    var query = window.location.search;
    if (query && query.length) {
        query = query.substring(1);
        var keyParams = query.split("&");
        keyParams.forEach(function (keyParam) {
            var keyVal = keyParam.split("=");
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

},{}],5:[function(require,module,exports){
(function (global){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator];
        return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=browserify_bundle.js.map
