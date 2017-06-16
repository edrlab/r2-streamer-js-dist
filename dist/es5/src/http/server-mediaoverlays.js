"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var path = require("path");
var cbz_1 = require("../parser/cbz");
var epub_1 = require("../parser/epub");
var UrlUtils_1 = require("../_utils/http/UrlUtils");
var JsonUtils_1 = require("../_utils/JsonUtils");
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
    routerMediaOverlays.get(["/", "/show/:" + epub_1.mediaOverlayURLParam + "?"], function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        function absoluteURL(href) {
            return rootUrl + "/" + href;
        }
        function absolutizeURLs(jsonObj) {
            traverseJsonObjects(jsonObj, function (obj) {
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
        var isShow, isHead, isCanonical, isSecureHttp, pathBase64Str, publication, fileName, ext, _a, err_1, rootUrl, objToSerialize, resource, jsonObj, jsonPretty, jsonStr, checkSum, hash, match;
        return __generator(this, function (_b) {
            switch (_b.label) {
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
                        console.log("HEAD !!!!!!!!!!!!!!!!!!!");
                    }
                    isCanonical = req.query.canonical && req.query.canonical === "true";
                    isSecureHttp = req.secure ||
                        req.protocol === "https" ||
                        req.get("X-Forwarded-Proto") === "https";
                    pathBase64Str = new Buffer(req.params.pathBase64, "base64").toString("utf8");
                    publication = server.cachedPublication(pathBase64Str);
                    if (!!publication) return [3, 8];
                    fileName = path.basename(pathBase64Str);
                    ext = path.extname(fileName).toLowerCase();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    if (!(ext === ".epub")) return [3, 3];
                    return [4, epub_1.EpubParsePromise(pathBase64Str)];
                case 2:
                    _a = _b.sent();
                    return [3, 5];
                case 3: return [4, cbz_1.CbzParsePromise(pathBase64Str)];
                case 4:
                    _a = _b.sent();
                    _b.label = 5;
                case 5:
                    publication = _a;
                    return [3, 7];
                case 6:
                    err_1 = _b.sent();
                    debug(err_1);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_1 + "</p></body></html>");
                    return [2];
                case 7:
                    server.cachePublication(pathBase64Str, publication);
                    _b.label = 8;
                case 8:
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
function traverseJsonObjects(obj, func) {
    func(obj);
    if (obj instanceof Array) {
        obj.forEach(function (item) {
            if (item) {
                traverseJsonObjects(item, func);
            }
        });
    }
    else if (typeof obj === "object") {
        Object.keys(obj).forEach(function (key) {
            if (obj.hasOwnProperty(key) && obj[key]) {
                traverseJsonObjects(obj[key], func);
            }
        });
    }
}
//# sourceMappingURL=server-mediaoverlays.js.map