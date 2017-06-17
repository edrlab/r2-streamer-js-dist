"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const querystring = require("querystring");
function isHTTP(urlOrPath) {
    return urlOrPath.indexOf("http") === 0;
}
exports.isHTTP = isHTTP;
function encodeURIComponent_RFC3986(str) {
    return encodeURIComponent(str)
        .replace(/[!'()*]/g, (c) => {
        return "%" + c.charCodeAt(0).toString(16);
    });
}
exports.encodeURIComponent_RFC3986 = encodeURIComponent_RFC3986;
function encodeURIComponent_RFC5987(str) {
    return encodeURIComponent(str).
        replace(/['()]/g, querystring.escape).
        replace(/\*/g, "%2A").
        replace(/%(?:7C|60|5E)/g, querystring.unescape);
}
exports.encodeURIComponent_RFC5987 = encodeURIComponent_RFC5987;
function ensureAbsolute(rootUrl, linkHref) {
    let url = linkHref;
    if (!isHTTP(url) && url.indexOf("data:") !== 0) {
        if (url.indexOf("//") === 0) {
            if (rootUrl.indexOf("https://") === 0) {
                url = "https:" + url;
            }
            else {
                url = "http:" + url;
            }
            return url;
        }
        if (url[0] === "/") {
            const j = rootUrl.replace(/:\/\//g, ":__").indexOf("/");
            const rootUrlOrigin = rootUrl.substr(0, j);
            url = path.join(rootUrlOrigin, url);
        }
        else {
            const i = rootUrl.indexOf("?");
            let rootUrlWithoutQuery = rootUrl;
            if (i >= 0) {
                rootUrlWithoutQuery = rootUrlWithoutQuery.substr(0, i);
            }
            if (rootUrlWithoutQuery.substr(-1) === "/") {
                url = path.join(rootUrlWithoutQuery, url);
            }
            else {
                url = path.join(path.dirname(rootUrlWithoutQuery), url);
            }
        }
        url = url.replace(/\\/g, "/").replace(/^https:\//g, "https:\/\/").replace(/^http:\//g, "http:\/\/");
    }
    return url;
}
exports.ensureAbsolute = ensureAbsolute;
//# sourceMappingURL=UrlUtils.js.map