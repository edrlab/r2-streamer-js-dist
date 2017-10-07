"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var querystring_1 = require("./querystring");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
window.onerror = function (err) {
    console.log("Error", err);
};
window.addEventListener("DOMContentLoaded", function () {
    var queryParams = querystring_1.getURLQueryParams();
    var publicationJsonUrl = queryParams["pub"];
    console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
    var webview1 = document.createElement("webview");
    webview1.addEventListener("dom-ready", function () {
        webview1.openDevTools();
    });
    webview1.setAttribute("id", "webview1");
    webview1.setAttribute("style", "width: 100%; height: 400px;" +
        "box-sizing: border-box; border: 2px solid black");
    webview1.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    document.body.appendChild(webview1);
    var webview2 = document.createElement("webview");
    webview2.addEventListener("dom-ready", function () {
        webview2.openDevTools();
        setTimeout(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var h1, response, publicationJson, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        document.body.setAttribute("style", "background-color: silver; margin: 0; padding: 0;");
                        h1 = document.querySelector("html > body > h1");
                        if (!h1) {
                            return [2];
                        }
                        h1.setAttribute("style", "color: green;");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4, fetch(publicationJsonUrl.replace("/pub/", "/pub/*-" +
                                "ZWM0ZjJkYmIzYjE0MDA5NTU1MGM5YWZiYmI2OWI1ZDZmZDllODE0YjlkYTgyZmFkMGIzNGU5ZmNiZTU2ZjFjYg" +
                                "==-*"))];
                    case 2:
                        _a.sent();
                        return [4, fetch(publicationJsonUrl)];
                    case 3:
                        response = _a.sent();
                        if (!response.ok) {
                            console.log("BAD RESPONSE?!");
                        }
                        response.headers.forEach(function (arg0, arg1) {
                            console.log(arg0 + " => " + arg1);
                        });
                        return [4, response.json()];
                    case 4:
                        publicationJson = _a.sent();
                        console.log(publicationJson);
                        publicationJson.spine.forEach(function (spineItem) {
                            var spineItemLink = document.createElement("a");
                            var spineItemLinkHref = publicationJsonUrl + "/../" + spineItem.href;
                            spineItemLink.setAttribute("href", spineItemLinkHref);
                            spineItemLink.addEventListener("click", function (event) {
                                webview1.setAttribute("src", spineItemLinkHref);
                                event.preventDefault();
                            });
                            spineItemLink.appendChild(document.createTextNode(spineItem.href));
                            document.body.appendChild(spineItemLink);
                            document.body.appendChild(document.createElement("br"));
                        });
                        return [3, 6];
                    case 5:
                        e_1 = _a.sent();
                        console.log(e_1);
                        return [3, 6];
                    case 6: return [2];
                }
            });
        }); }, 5000);
    });
    webview2.setAttribute("id", "webview2");
    webview2.setAttribute("style", "display: inline-flex; visibilityx: hidden; width: 100%; height: 50px; " +
        "box-sizing: border-box; border: 2px solid magenta");
    webview2.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    webview2.setAttribute("preload", "./preload.js");
    document.body.appendChild(webview2);
    var swBootUrl = publicationJsonUrl + "/../";
    console.log(swBootUrl);
    webview2.setAttribute("src", swBootUrl);
});
//# sourceMappingURL=index.js.map