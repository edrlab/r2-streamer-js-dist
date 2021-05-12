"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverManifestJson = void 0;
const tslib_1 = require("tslib");
const crypto = require("crypto");
const css2json = require("css2json");
const debug_ = require("debug");
const DotProp = require("dot-prop");
const express = require("express");
const jsonMarkup = require("json-markup");
const path = require("path");
const serializable_1 = require("r2-lcp-js/dist/es6-es2015/src/serializable");
const epub_1 = require("r2-shared-js/dist/es6-es2015/src/parser/epub");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/JsonUtils");
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
    routerManifestJson.get(["/", "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        var _a;
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
        if (reqparams.lcpPass64 && !server.disableDecryption) {
            const lcpPass = Buffer.from(reqparams.lcpPass64, "base64").toString("utf8");
            if (publication.LCP) {
                try {
                    yield publication.LCP.tryUserKeys([lcpPass]);
                }
                catch (err) {
                    publication.LCP.ContentKey = undefined;
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
        const contentType = (publication.Metadata && publication.Metadata.RDFType &&
            /http[s]?:\/\/schema\.org\/Audiobook$/.test(publication.Metadata.RDFType)) ?
            "application/audiobook+json" : ((publication.Metadata && publication.Metadata.RDFType &&
            (/http[s]?:\/\/schema\.org\/ComicStory$/.test(publication.Metadata.RDFType) ||
                /http[s]?:\/\/schema\.org\/VisualNarrative$/.test(publication.Metadata.RDFType))) ? "application/divina+json" :
            "application/webpub+json");
        const selfLink = publication.searchLinkByRel("self");
        if (!selfLink) {
            publication.AddLink(contentType, ["self"], manifestURL, undefined);
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
                publication.AddLink("application/vnd.syncnarr+json", ["media-overlay"], moURL, true);
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
                            objToSerialize = yield epub_1.getAllMediaOverlays(publication);
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
            const jsonObj = serializable_1.TaJsonSerialize(objToSerialize);
            let validationStr;
            const doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
            if (doValidate) {
                const jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                const jsonSchemasNames = [
                    "webpub-manifest/publication",
                    "webpub-manifest/contributor-object",
                    "webpub-manifest/contributor",
                    "webpub-manifest/link",
                    "webpub-manifest/metadata",
                    "webpub-manifest/subcollection",
                    "webpub-manifest/properties",
                    "webpub-manifest/subject",
                    "webpub-manifest/subject-object",
                    "webpub-manifest/extensions/epub/metadata",
                    "webpub-manifest/extensions/epub/subcollections",
                    "webpub-manifest/extensions/epub/properties",
                    "webpub-manifest/extensions/presentation/metadata",
                    "webpub-manifest/extensions/presentation/properties",
                    "webpub-manifest/language-map",
                    "opds/acquisition-object",
                    "opds/catalog-entry",
                    "opds/properties",
                ];
                const validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonObj);
                if (validationErrors) {
                    validationStr = "";
                    for (const err of validationErrors) {
                        debug("JSON Schema validation FAIL.");
                        debug(err);
                        const val = err.jsonPath ? DotProp.get(jsonObj, err.jsonPath) : "";
                        const valueStr = (typeof val === "string") ?
                            `${val}` :
                            ((val instanceof Array || typeof val === "object") ?
                                `${JSON.stringify(val)}` :
                                "");
                        debug(valueStr);
                        const title = DotProp.get(jsonObj, "metadata.title");
                        debug(title);
                        validationStr +=
                            `\n"${title}"\n\n${err.ajvMessage}: ${valueStr}\n\n'${(_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
                    }
                }
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
                (doValidate ? (validationStr ? ("<hr><p><pre>" + validationStr + "</pre></p>") : ("<hr><p>JSON SCHEMA OK.</p>")) : "") +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", `${contentType}; charset=utf-8`);
            const publicationJsonObj = serializable_1.TaJsonSerialize(publication);
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
            const links = getPreFetchResources(publication);
            if (links && links.length) {
                let n = 0;
                let prefetch = "";
                for (const l of links) {
                    n++;
                    if (n > server.maxPrefetchLinks) {
                        break;
                    }
                    const href = absoluteURL(l.Href);
                    prefetch += "<" + href + ">;" + "rel=prefetch,";
                }
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
    routerPathBase64.use("/:" + request_ext_1._pathBase64 + "/manifest.json", routerManifestJson);
}
exports.serverManifestJson = serverManifestJson;
function getPreFetchResources(publication) {
    const links = [];
    if (publication.Resources) {
        const mediaTypes = ["text/css",
            "text/javascript", "application/javascript",
            "application/vnd.ms-opentype", "font/otf", "application/font-sfnt",
            "font/ttf", "application/font-sfnt",
            "font/woff", "application/font-woff", "font/woff2"];
        for (const mediaType of mediaTypes) {
            for (const link of publication.Resources) {
                if (link.TypeLink === mediaType) {
                    links.push(link);
                }
            }
        }
    }
    return links;
}
//# sourceMappingURL=server-manifestjson.js.map