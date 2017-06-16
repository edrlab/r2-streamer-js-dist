"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=UrlUtils.js.map