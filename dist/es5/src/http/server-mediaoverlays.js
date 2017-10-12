"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var path = require("path");
var epub_1 = require("../../../es8-es2017/src/parser/epub");
var UrlUtils_1 = require("../../../es8-es2017/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("../../../es8-es2017/src/_utils/JsonUtils");
var css2json = require("css2json");
var debug_ = require("debug");
var express = require("express");
var jsonMarkup = require("json-markup");
var ta_json_1 = require("ta-json");
var debug = debug_("r2:server:mediaoverlays");
function serverMediaOverlays(server, routerPathBase64) {
    var _this = this;
    var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
    var routerMediaOverlays = express.Router({ strict: false });
    routerMediaOverlays.get(["/", "/show/:" + epub_1.mediaOverlayURLParam + "?"], function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        function absoluteURL(href) {
            return rootUrl + "/" + href;
        }
        function absolutizeURLs(jsonObject) {
            JsonUtils_1.traverseJsonObjects(jsonObject, function (obj) {
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
        var isShow, isHead, isCanonical, isSecureHttp, pathBase64Str, publication, err_1, rootUrl, objToSerialize, resource, jsonObj, jsonPretty, jsonStr, checkSum, hash, match;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.params.pathBase64) {
                        req.params.pathBase64 = req.pathBase64;
                    }
                    if (!req.params.lcpPass64) {
                        req.params.lcpPass64 = req.lcpPass64;
                    }
                    isShow = req.url.indexOf("/show") >= 0 || req.query.show;
                    isHead = req.method.toLowerCase() === "head";
                    if (isHead) {
                        debug("HEAD !!!!!!!!!!!!!!!!!!!");
                    }
                    isCanonical = req.query.canonical && req.query.canonical === "true";
                    isSecureHttp = req.secure ||
                        req.protocol === "https" ||
                        req.get("X-Forwarded-Proto") === "https";
                    pathBase64Str = new Buffer(req.params.pathBase64, "base64").toString("utf8");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, server.loadOrGetCachedPublication(pathBase64Str)];
                case 2:
                    publication = _a.sent();
                    return [3, 4];
                case 3:
                    err_1 = _a.sent();
                    debug(err_1);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_1 + "</p></body></html>");
                    return [2];
                case 4:
                    rootUrl = (isSecureHttp ? "https://" : "http://")
                        + req.headers.host + "/pub/"
                        + (req.params.lcpPass64 ?
                            (server.lcpBeginToken + UrlUtils_1.encodeURIComponent_RFC3986(req.params.lcpPass64) + server.lcpEndToken) :
                            "")
                        + UrlUtils_1.encodeURIComponent_RFC3986(req.params.pathBase64);
                    objToSerialize = null;
                    resource = isShow ?
                        (req.query.show ? req.query.show : req.params[epub_1.mediaOverlayURLParam]) :
                        req.query[epub_1.mediaOverlayURLParam];
                    if (resource && resource !== "all") {
                        objToSerialize = publication.FindMediaOverlayByHref(resource);
                    }
                    else {
                        objToSerialize = publication.FindAllMediaOverlay();
                    }
                    if (!objToSerialize) {
                        objToSerialize = [];
                    }
                    jsonObj = ta_json_1.JSON.serialize(objToSerialize);
                    jsonObj = { "media-overlay": jsonObj };
                    if (isShow) {
                        absolutizeURLs(jsonObj);
                        jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
                        res.status(200).send("<html><body>" +
                            "<h1>" + path.basename(pathBase64Str) + "</h1>" +
                            "<p><pre>" + jsonPretty + "</pre></p>" +
                            "</body></html>");
                    }
                    else {
                        server.setResponseCORS(res);
                        res.set("Content-Type", "application/vnd.readium.mo+json; charset=utf-8");
                        jsonStr = isCanonical ?
                            global.JSON.stringify(JsonUtils_1.sortObject(jsonObj), null, "") :
                            global.JSON.stringify(jsonObj, null, "  ");
                        checkSum = crypto.createHash("sha256");
                        checkSum.update(jsonStr);
                        hash = checkSum.digest("hex");
                        match = req.header("If-None-Match");
                        if (match === hash) {
                            debug("smil cache");
                            res.status(304);
                            res.end();
                            return [2];
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
                    return [2];
            }
        });
    }); });
    routerPathBase64.use("/:pathBase64/" + epub_1.mediaOverlayURLPath, routerMediaOverlays);
}
exports.serverMediaOverlays = serverMediaOverlays;
//# sourceMappingURL=server-mediaoverlays.js.map