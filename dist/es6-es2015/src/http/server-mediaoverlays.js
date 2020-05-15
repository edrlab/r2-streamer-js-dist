"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverMediaOverlays = void 0;
const tslib_1 = require("tslib");
const crypto = require("crypto");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const path = require("path");
const serializable_1 = require("r2-lcp-js/dist/es6-es2015/src/serializable");
const epub_1 = require("r2-shared-js/dist/es6-es2015/src/parser/epub");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/JsonUtils");
const request_ext_1 = require("./request-ext");
const debug = debug_("r2:streamer#http/server-mediaoverlays");
function serverMediaOverlays(server, routerPathBase64) {
    const jsonStyle = `
.json-markup {
    line-height: 17px;
    font-size: 13px;
    font-family: monospace;
    white-space: pre;
}
.json-markup-key {
    font-weight: bold;
}
.json-markup-bool {
    color: firebrick;
}
.json-markup-string {
    color: green;
}
.json-markup-null {
    color: gray;
}
.json-markup-number {
    color: blue;
}
`;
    const routerMediaOverlays = express.Router({ strict: false });
    routerMediaOverlays.get(["/", "/" + request_ext_1._show + "/:" + epub_1.mediaOverlayURLParam + "?"], (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const reqparams = req.params;
        if (!reqparams.pathBase64) {
            reqparams.pathBase64 = req.pathBase64;
        }
        if (!reqparams.lcpPass64) {
            reqparams.lcpPass64 = req.lcpPass64;
        }
        const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        const isHead = req.method.toLowerCase() === "head";
        if (isHead) {
            debug("HEAD !!!!!!!!!!!!!!!!!!!");
        }
        const isCanonical = req.query.canonical &&
            req.query.canonical === "true";
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        const pathBase64Str = Buffer.from(reqparams.pathBase64, "base64").toString("utf8");
        let publication;
        try {
            publication = yield server.loadOrGetCachedPublication(pathBase64Str);
        }
        catch (err) {
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host + "/pub/"
            + (reqparams.lcpPass64 ?
                (server.lcpBeginToken + UrlUtils_1.encodeURIComponent_RFC3986(reqparams.lcpPass64) + server.lcpEndToken) :
                "")
            + UrlUtils_1.encodeURIComponent_RFC3986(reqparams.pathBase64);
        function absoluteURL(href) {
            return rootUrl + "/" + href;
        }
        function absolutizeURLs(jsonObject) {
            JsonUtils_1.traverseJsonObjects(jsonObject, (obj) => {
                if (obj.text && typeof obj.text === "string"
                    && !UrlUtils_1.isHTTP(obj.text)) {
                    obj.text = absoluteURL(obj.text);
                }
                if (obj.audio && typeof obj.audio === "string"
                    && !UrlUtils_1.isHTTP(obj.audio)) {
                    obj.audio = absoluteURL(obj.audio);
                }
            });
        }
        let objToSerialize = null;
        const resource = isShow ?
            (req.query.show ?
                req.query.show :
                reqparams[epub_1.mediaOverlayURLParam]) :
            req.query[epub_1.mediaOverlayURLParam];
        if (resource && resource !== "all") {
            try {
                objToSerialize = yield epub_1.getMediaOverlay(publication, resource);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
        else {
            try {
                objToSerialize = yield epub_1.getAllMediaOverlays(publication);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
        if (!objToSerialize) {
            objToSerialize = [];
        }
        const jsonObj = serializable_1.TaJsonSerialize(objToSerialize);
        if (isShow) {
            absolutizeURLs(jsonObj);
            const jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            res.status(200).send("<html><body>" +
                "<h1>" + path.basename(pathBase64Str) + "</h1>" +
                "<p><pre>" + jsonPretty + "</pre></p>" +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", "application/vnd.syncnarr+json; charset=utf-8");
            const jsonStr = isCanonical ?
                global.JSON.stringify(JsonUtils_1.sortObject(jsonObj), null, "") :
                global.JSON.stringify(jsonObj, null, "  ");
            const checkSum = crypto.createHash("sha256");
            checkSum.update(jsonStr);
            const hash = checkSum.digest("hex");
            const match = req.header("If-None-Match");
            if (match === hash) {
                debug("smil cache");
                res.status(304);
                res.end();
                return;
            }
            res.setHeader("ETag", hash);
            res.status(200);
            if (isHead) {
                res.end();
            }
            else {
                res.send(jsonStr);
            }
        }
    }));
    routerPathBase64.use("/:" + request_ext_1._pathBase64 + "/" + epub_1.mediaOverlayURLPath, routerMediaOverlays);
}
exports.serverMediaOverlays = serverMediaOverlays;
//# sourceMappingURL=server-mediaoverlays.js.map