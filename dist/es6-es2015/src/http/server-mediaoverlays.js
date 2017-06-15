"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const path = require("path");
const cbz_1 = require("../parser/cbz");
const epub_1 = require("../parser/epub");
const UrlUtils_1 = require("../_utils/http/UrlUtils");
const JsonUtils_1 = require("../_utils/JsonUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const ta_json_1 = require("ta-json");
const debug = debug_("r2:server:mediaoverlays");
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
    routerMediaOverlays.get(["/", "/show/:" + epub_1.mediaOverlayURLParam + "?"], (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.params.pathBase64) {
            req.params.pathBase64 = req.pathBase64;
        }
        if (!req.params.lcpPass64) {
            req.params.lcpPass64 = req.lcpPass64;
        }
        const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        const isHead = req.method.toLowerCase() === "head";
        if (isHead) {
            console.log("HEAD !!!!!!!!!!!!!!!!!!!");
        }
        const isCanonical = req.query.canonical && req.query.canonical === "true";
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        const pathBase64Str = new Buffer(req.params.pathBase64, "base64").toString("utf8");
        let publication = server.cachedPublication(pathBase64Str);
        if (!publication) {
            const fileName = path.basename(pathBase64Str);
            const ext = path.extname(fileName).toLowerCase();
            try {
                publication = ext === ".epub" ?
                    yield epub_1.EpubParsePromise(pathBase64Str) :
                    yield cbz_1.CbzParsePromise(pathBase64Str);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
            server.cachePublication(pathBase64Str, publication);
        }
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host + "/pub/"
            + (req.params.lcpPass64 ?
                (server.lcpBeginToken + UrlUtils_1.encodeURIComponent_RFC3986(req.params.lcpPass64) + server.lcpEndToken) :
                "")
            + UrlUtils_1.encodeURIComponent_RFC3986(req.params.pathBase64);
        function absoluteURL(href) {
            return rootUrl + "/" + href;
        }
        function absolutizeURLs(jsonObj) {
            traverseJsonObjects(jsonObj, (obj) => {
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
        let jsonObj = ta_json_1.JSON.serialize(objToSerialize);
        jsonObj = { "media-overlay": jsonObj };
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
            res.set("Content-Type", "application/vnd.readium.mo+json; charset=utf-8");
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
    routerPathBase64.use("/:pathBase64/" + epub_1.mediaOverlayURLPath, routerMediaOverlays);
}
exports.serverMediaOverlays = serverMediaOverlays;
function traverseJsonObjects(obj, func) {
    func(obj);
    if (obj instanceof Array) {
        obj.forEach((item) => {
            if (item) {
                traverseJsonObjects(item, func);
            }
        });
    }
    else if (typeof obj === "object") {
        Object.keys(obj).forEach((key) => {
            if (obj.hasOwnProperty(key) && obj[key]) {
                traverseJsonObjects(obj[key], func);
            }
        });
    }
}
//# sourceMappingURL=server-mediaoverlays.js.map