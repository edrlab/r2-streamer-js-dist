"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const querystring_1 = require("./querystring");
console.log("INDEX");
console.log(window.location);
console.log(document.baseURI);
console.log(document.URL);
window.onerror = (err) => {
    console.log("Error", err);
};
window.addEventListener("DOMContentLoaded", () => {
    const queryParams = querystring_1.getURLQueryParams();
    const publicationJsonUrl = queryParams["pub"];
    console.log(" (((( publicationJsonUrl )))) " + publicationJsonUrl);
    const webview1 = document.createElement("webview");
    webview1.addEventListener("dom-ready", () => {
        webview1.openDevTools();
    });
    webview1.setAttribute("id", "webview1");
    webview1.setAttribute("style", "width: 100%; height: 400px;" +
        "box-sizing: border-box; border: 2px solid black");
    webview1.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    document.body.appendChild(webview1);
    const webview2 = document.createElement("webview");
    webview2.addEventListener("dom-ready", () => {
        webview2.openDevTools();
        setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            document.body.setAttribute("style", "background-color: silver; margin: 0; padding: 0;");
            const h1 = document.querySelector("html > body > h1");
            if (!h1) {
                return;
            }
            h1.setAttribute("style", "color: green;");
            try {
                yield fetch(publicationJsonUrl.replace("/pub/", "/pub/*-" +
                    "ZWM0ZjJkYmIzYjE0MDA5NTU1MGM5YWZiYmI2OWI1ZDZmZDllODE0YjlkYTgyZmFkMGIzNGU5ZmNiZTU2ZjFjYg" +
                    "==-*"));
                const response = yield fetch(publicationJsonUrl);
                if (!response.ok) {
                    console.log("BAD RESPONSE?!");
                }
                response.headers.forEach((arg0, arg1) => {
                    console.log(arg0 + " => " + arg1);
                });
                const publicationJson = yield response.json();
                console.log(publicationJson);
                publicationJson.spine.forEach((spineItem) => {
                    const spineItemLink = document.createElement("a");
                    const spineItemLinkHref = publicationJsonUrl + "/../" + spineItem.href;
                    spineItemLink.setAttribute("href", spineItemLinkHref);
                    spineItemLink.addEventListener("click", (event) => {
                        webview1.setAttribute("src", spineItemLinkHref);
                        event.preventDefault();
                    });
                    spineItemLink.appendChild(document.createTextNode(spineItem.href));
                    document.body.appendChild(spineItemLink);
                    document.body.appendChild(document.createElement("br"));
                });
            }
            catch (e) {
                console.log(e);
            }
        }), 5000);
    });
    webview2.setAttribute("id", "webview2");
    webview2.setAttribute("style", "display: inline-flex; visibilityx: hidden; width: 100%; height: 50px; " +
        "box-sizing: border-box; border: 2px solid magenta");
    webview2.setAttribute("webpreferences", "nodeIntegration=0, nodeIntegrationInWorker=0, sandbox=0, " +
        "contextIsolation=0, webSecurity=1, allowRunningInsecureContent=0");
    webview2.setAttribute("preload", "./preload.js");
    document.body.appendChild(webview2);
    const swBootUrl = publicationJsonUrl + "/../";
    console.log(swBootUrl);
    webview2.setAttribute("src", swBootUrl);
});
//# sourceMappingURL=index.js.map