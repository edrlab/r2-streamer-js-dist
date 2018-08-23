"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const path = require("path");
const epub_1 = require("r2-shared-js/dist/es8-es2017/src/parser/epub");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/JsonUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const ta_json_1 = require("ta-json");
const json_schema_validate_1 = require("../utils/json-schema-validate");
const request_ext_1 = require("./request-ext");
const debug = debug_("r2:streamer#http/server-manifestjson");
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
    routerManifestJson.get(["/", "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], async (req, res) => {
        const reqparams = req.params;
        if (!reqparams.pathBase64) {
            reqparams.pathBase64 = req.pathBase64;
        }
        if (!reqparams.lcpPass64) {
            reqparams.lcpPass64 = req.lcpPass64;
        }
        const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        if (!reqparams.jsonPath && req.query.show) {
            reqparams.jsonPath = req.query.show;
        }
        const isHead = req.method.toLowerCase() === "head";
        if (isHead) {
            debug("HEAD !!!!!!!!!!!!!!!!!!!");
        }
        const isCanonical = req.query.canonical &&
            req.query.canonical === "true";
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        const pathBase64Str = new Buffer(reqparams.pathBase64, "base64").toString("utf8");
        let publication;
        try {
            publication = await server.loadOrGetCachedPublication(pathBase64Str);
        }
        catch (err) {
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        if (reqparams.lcpPass64 && !server.disableDecryption) {
            const lcpPass = new Buffer(reqparams.lcpPass64, "base64").toString("utf8");
            if (publication.LCP) {
                try {
                    await publication.LCP.tryUserKeys([lcpPass]);
                }
                catch (err) {
                    debug(err);
                    const errMsg = "FAIL publication.LCP.tryUserKeys(): " + err;
                    debug(errMsg);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + errMsg + "</p></body></html>");
                    return;
                }
            }
        }
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host + "/pub/"
            + (reqparams.lcpPass64 ?
                (server.lcpBeginToken + UrlUtils_1.encodeURIComponent_RFC3986(reqparams.lcpPass64) + server.lcpEndToken) :
                "")
            + UrlUtils_1.encodeURIComponent_RFC3986(reqparams.pathBase64);
        const manifestURL = rootUrl + "/" + "manifest.json";
        const selfLink = publication.searchLinkByRel("self");
        if (!selfLink) {
            publication.AddLink("application/webpub+json", ["self"], manifestURL, undefined);
        }
        publication.AddLink("txt", ["test1"], "./relative/%20URL?param=val#hash", false);
        publication.AddLink("txt", ["test2"], "./relative/%20URL?param=val#hash", true);
        publication.AddLink("txt", ["test3"], "./relative/%20URL?param=val#hash", undefined);
        publication.AddLink("txt", ["test4"], "./relative/%20URL{var}/?param=val#hash", false);
        publication.AddLink("txt", ["test5"], "./relative/%20URL{var}/?param=val#hash", true);
        publication.AddLink("txt", ["test6"], "./relative/%20URL{var}/?param=val#hash", undefined);
        publication.AddLink("txt", ["test7"], "http://absolute.com/%20URL?param=val#hash", false);
        publication.AddLink("txt", ["test8"], "http://absolute.com/%20URL?param=val#hash", true);
        publication.AddLink("txt", ["test9"], "http://absolute.com/%20URL?param=val#hash", undefined);
        publication.AddLink("txt", ["test10"], "http://absolute.com/%20URL{var}/?param=val#hash", false);
        publication.AddLink("txt", ["test11"], "http://absolute.com/%20URL{var}/?param=val#hash", true);
        publication.AddLink("txt", ["test12"], "http://absolute.com/%20URL{var}/?param=val#hash", undefined);
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
            if (reqparams.jsonPath) {
                switch (reqparams.jsonPath) {
                    case "all": {
                        objToSerialize = publication;
                        break;
                    }
                    case "cover": {
                        objToSerialize = publication.GetCover();
                        break;
                    }
                    case "mediaoverlays": {
                        try {
                            objToSerialize = await epub_1.getAllMediaOverlays(publication);
                        }
                        catch (err) {
                            debug(err);
                            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                + err + "</p></body></html>");
                            return;
                        }
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
            let validationStr;
            if (!reqparams.jsonPath || reqparams.jsonPath === "all") {
                const jsonSchemasRootpath = path.join(process.cwd(), "misc/json-schema");
                validationStr = json_schema_validate_1.webPubManifestJsonValidate(jsonSchemasRootpath, jsonObj);
            }
            absolutizeURLs(jsonObj);
            let jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            const regex = new RegExp(">" + rootUrl + "/([^<]+</a>)", "g");
            jsonPretty = jsonPretty.replace(regex, ">$1");
            jsonPretty = jsonPretty.replace(/>manifest.json<\/a>/, ">" + rootUrl + "/manifest.json</a>");
            res.status(200).send("<html>" +
                "<head><script type=\"application/ld+json\" href=\"" +
                manifestURL +
                "\"></script></head>" +
                "<body>" +
                "<h1>" + path.basename(pathBase64Str) + "</h1>" +
                (coverImage ? "<a href=\"" + coverImage + "\"><div style=\"width: 400px;\"><img src=\"" + coverImage + "\" alt=\"\" style=\"display: block; width: 100%; height: auto;\"/></div></a>" : "") +
                "<hr><p><pre>" + jsonPretty + "</pre></p>" +
                (validationStr ? ("<hr><p><pre>" + validationStr + "</pre></p>") : ("<hr><p>JSON SCHEMA OK.</p>")) +
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
    });
    routerPathBase64.use("/:" + request_ext_1._pathBase64 + "/manifest.json", routerManifestJson);
}
exports.serverManifestJson = serverManifestJson;
//# sourceMappingURL=server-manifestjson.js.map