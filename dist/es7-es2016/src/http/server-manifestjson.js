"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const path = require("path");
const epub_1 = require("../../../es8-es2017/src/parser/epub");
const publication_parser_1 = require("../../../es8-es2017/src/parser/publication-parser");
const UrlUtils_1 = require("../../../es8-es2017/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("../../../es8-es2017/src/_utils/JsonUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const ta_json_1 = require("ta-json");
const debug = debug_("r2:server:manifestjson");
function serverManifestJson(server, routerPathBase64) {
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
    const routerManifestJson = express.Router({ strict: false });
    routerManifestJson.get(["/", "/show/:jsonPath?"], (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!req.params.pathBase64) {
            req.params.pathBase64 = req.pathBase64;
        }
        if (!req.params.lcpPass64) {
            req.params.lcpPass64 = req.lcpPass64;
        }
        const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        if (!req.params.jsonPath && req.query.show) {
            req.params.jsonPath = req.query.show;
        }
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
            try {
                publication = yield publication_parser_1.PublicationParsePromise(pathBase64Str);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
            server.cachePublication(pathBase64Str, publication);
        }
        if (req.params.lcpPass64) {
            const lcpPass = new Buffer(req.params.lcpPass64, "base64").toString("utf8");
            if (publication.LCP) {
                const okay = publication.LCP.setUserPassphrase(lcpPass);
                if (!okay) {
                    const errMsg = "FAIL publication.LCP.setUserPassphrase()";
                    debug(errMsg);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + errMsg + "</p></body></html>");
                    return;
                }
            }
        }
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host + "/pub/"
            + (req.params.lcpPass64 ?
                (server.lcpBeginToken + UrlUtils_1.encodeURIComponent_RFC3986(req.params.lcpPass64) + server.lcpEndToken) :
                "")
            + UrlUtils_1.encodeURIComponent_RFC3986(req.params.pathBase64);
        const manifestURL = rootUrl + "/" + "manifest.json";
        const selfLink = publication.searchLinkByRel("self");
        if (!selfLink) {
            publication.AddLink("application/webpub+json", ["self"], manifestURL, false);
        }
        function absoluteURL(href) {
            return rootUrl + "/" + href;
        }
        function absolutizeURLs(jsonObj) {
            JsonUtils_1.traverseJsonObjects(jsonObj, (obj) => {
                if (obj.href && typeof obj.href === "string"
                    && !UrlUtils_1.isHTTP(obj.href)) {
                    obj.href = absoluteURL(obj.href);
                }
                if (obj["media-overlay"] && typeof obj["media-overlay"] === "string"
                    && !UrlUtils_1.isHTTP(obj["media-overlay"])) {
                    obj["media-overlay"] = absoluteURL(obj["media-overlay"]);
                }
            });
        }
        let hasMO = false;
        if (publication.Spine) {
            const link = publication.Spine.find((l) => {
                if (l.Properties && l.Properties.MediaOverlay) {
                    return true;
                }
                return false;
            });
            if (link) {
                hasMO = true;
            }
        }
        if (hasMO) {
            const moLink = publication.searchLinkByRel("media-overlay");
            if (!moLink) {
                const moURL = epub_1.mediaOverlayURLPath +
                    "?" + epub_1.mediaOverlayURLParam + "={path}";
                publication.AddLink("application/vnd.readium.mo+json", ["media-overlay"], moURL, true);
            }
        }
        let coverImage;
        const coverLink = publication.GetCover();
        if (coverLink) {
            coverImage = coverLink.Href;
            if (coverImage && !UrlUtils_1.isHTTP(coverImage)) {
                coverImage = absoluteURL(coverImage);
            }
        }
        if (isShow) {
            let objToSerialize = null;
            if (req.params.jsonPath) {
                switch (req.params.jsonPath) {
                    case "all": {
                        objToSerialize = publication;
                        break;
                    }
                    case "cover": {
                        objToSerialize = publication.GetCover();
                        break;
                    }
                    case "mediaoverlays": {
                        objToSerialize = publication.FindAllMediaOverlay();
                        break;
                    }
                    case "spine": {
                        objToSerialize = publication.Spine;
                        break;
                    }
                    case "pagelist": {
                        objToSerialize = publication.PageList;
                        break;
                    }
                    case "landmarks": {
                        objToSerialize = publication.Landmarks;
                        break;
                    }
                    case "links": {
                        objToSerialize = publication.Links;
                        break;
                    }
                    case "resources": {
                        objToSerialize = publication.Resources;
                        break;
                    }
                    case "toc": {
                        objToSerialize = publication.TOC;
                        break;
                    }
                    case "metadata": {
                        objToSerialize = publication.Metadata;
                        break;
                    }
                    default: {
                        objToSerialize = null;
                    }
                }
            }
            else {
                objToSerialize = publication;
            }
            if (!objToSerialize) {
                objToSerialize = {};
            }
            const jsonObj = ta_json_1.JSON.serialize(objToSerialize);
            absolutizeURLs(jsonObj);
            const jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            res.status(200).send("<html>" +
                "<head><script type=\"application/ld+json\" href=\"" +
                manifestURL +
                "\"></script></head>" +
                "<body>" +
                "<h1>" + path.basename(pathBase64Str) + "</h1>" +
                (coverImage ? "<img src=\"" + coverImage + "\" alt=\"\"/>" : "") +
                "<hr><p><pre>" + jsonPretty + "</pre></p>" +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", "application/webpub+json; charset=utf-8");
            const publicationJsonObj = ta_json_1.JSON.serialize(publication);
            if (isCanonical) {
                if (publicationJsonObj.links) {
                    delete publicationJsonObj.links;
                }
            }
            const publicationJsonStr = isCanonical ?
                global.JSON.stringify(JsonUtils_1.sortObject(publicationJsonObj), null, "") :
                global.JSON.stringify(publicationJsonObj, null, "  ");
            const checkSum = crypto.createHash("sha256");
            checkSum.update(publicationJsonStr);
            const hash = checkSum.digest("hex");
            const match = req.header("If-None-Match");
            if (match === hash) {
                debug("manifest.json cache");
                res.status(304);
                res.end();
                return;
            }
            res.setHeader("ETag", hash);
            const links = publication.GetPreFetchResources();
            if (links && links.length) {
                let prefetch = "";
                links.forEach((l) => {
                    const href = absoluteURL(l.Href);
                    prefetch += "<" + href + ">;" + "rel=prefetch,";
                });
                res.setHeader("Link", prefetch);
            }
            res.status(200);
            if (isHead) {
                res.end();
            }
            else {
                res.send(publicationJsonStr);
            }
        }
    }));
    routerPathBase64.use("/:pathBase64/manifest.json", routerManifestJson);
}
exports.serverManifestJson = serverManifestJson;
//# sourceMappingURL=server-manifestjson.js.map