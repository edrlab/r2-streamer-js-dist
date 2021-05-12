"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverManifestJson = void 0;
var tslib_1 = require("tslib");
var crypto = require("crypto");
var css2json = require("css2json");
var debug_ = require("debug");
var DotProp = require("dot-prop");
var express = require("express");
var jsonMarkup = require("json-markup");
var path = require("path");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var epub_1 = require("r2-shared-js/dist/es5/src/parser/epub");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var json_schema_validate_1 = require("../utils/json-schema-validate");
var request_ext_1 = require("./request-ext");
var debug = debug_("r2:streamer#http/server-manifestjson");
function serverManifestJson(server, routerPathBase64) {
    var _this = this;
    var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
    var routerManifestJson = express.Router({ strict: false });
    routerManifestJson.get(["/", "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        function absoluteURL(href) {
            return rootUrl + "/" + href;
        }
        function absolutizeURLs(jsonObj) {
            JsonUtils_1.traverseJsonObjects(jsonObj, function (obj) {
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
        var reqparams, isShow, isHead, isCanonical, isSecureHttp, pathBase64Str, publication, err_1, lcpPass, err_2, errMsg, rootUrl, manifestURL, contentType, selfLink, hasMO, link, moLink, moURL, coverImage, coverLink, objToSerialize, _a, err_3, jsonObj, validationStr, doValidate, jsonSchemasRootpath, jsonSchemasNames, validationErrors, _i, validationErrors_1, err, val, valueStr, title, jsonPretty, regex, publicationJsonObj, publicationJsonStr, checkSum, hash, match, links, n, prefetch, _b, links_1, l, href;
        var _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    reqparams = req.params;
                    if (!reqparams.pathBase64) {
                        reqparams.pathBase64 = req.pathBase64;
                    }
                    if (!reqparams.lcpPass64) {
                        reqparams.lcpPass64 = req.lcpPass64;
                    }
                    isShow = req.url.indexOf("/show") >= 0 || req.query.show;
                    if (!reqparams.jsonPath && req.query.show) {
                        reqparams.jsonPath = req.query.show;
                    }
                    isHead = req.method.toLowerCase() === "head";
                    if (isHead) {
                        debug("HEAD !!!!!!!!!!!!!!!!!!!");
                    }
                    isCanonical = req.query.canonical &&
                        req.query.canonical === "true";
                    isSecureHttp = req.secure ||
                        req.protocol === "https" ||
                        req.get("X-Forwarded-Proto") === "https";
                    pathBase64Str = Buffer.from(reqparams.pathBase64, "base64").toString("utf8");
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4, server.loadOrGetCachedPublication(pathBase64Str)];
                case 2:
                    publication = _d.sent();
                    return [3, 4];
                case 3:
                    err_1 = _d.sent();
                    debug(err_1);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_1 + "</p></body></html>");
                    return [2];
                case 4:
                    if (!(reqparams.lcpPass64 && !server.disableDecryption)) return [3, 8];
                    lcpPass = Buffer.from(reqparams.lcpPass64, "base64").toString("utf8");
                    if (!publication.LCP) return [3, 8];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    return [4, publication.LCP.tryUserKeys([lcpPass])];
                case 6:
                    _d.sent();
                    return [3, 8];
                case 7:
                    err_2 = _d.sent();
                    publication.LCP.ContentKey = undefined;
                    debug(err_2);
                    errMsg = "FAIL publication.LCP.tryUserKeys(): " + err_2;
                    debug(errMsg);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + errMsg + "</p></body></html>");
                    return [2];
                case 8:
                    rootUrl = (isSecureHttp ? "https://" : "http://")
                        + req.headers.host + "/pub/"
                        + (reqparams.lcpPass64 ?
                            (server.lcpBeginToken + UrlUtils_1.encodeURIComponent_RFC3986(reqparams.lcpPass64) + server.lcpEndToken) :
                            "")
                        + UrlUtils_1.encodeURIComponent_RFC3986(reqparams.pathBase64);
                    manifestURL = rootUrl + "/" + "manifest.json";
                    contentType = (publication.Metadata && publication.Metadata.RDFType &&
                        /http[s]?:\/\/schema\.org\/Audiobook$/.test(publication.Metadata.RDFType)) ?
                        "application/audiobook+json" : ((publication.Metadata && publication.Metadata.RDFType &&
                        (/http[s]?:\/\/schema\.org\/ComicStory$/.test(publication.Metadata.RDFType) ||
                            /http[s]?:\/\/schema\.org\/VisualNarrative$/.test(publication.Metadata.RDFType))) ? "application/divina+json" :
                        "application/webpub+json");
                    selfLink = publication.searchLinkByRel("self");
                    if (!selfLink) {
                        publication.AddLink(contentType, ["self"], manifestURL, undefined);
                    }
                    hasMO = false;
                    if (publication.Spine) {
                        link = publication.Spine.find(function (l) {
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
                        moLink = publication.searchLinkByRel("media-overlay");
                        if (!moLink) {
                            moURL = epub_1.mediaOverlayURLPath +
                                "?" + epub_1.mediaOverlayURLParam + "={path}";
                            publication.AddLink("application/vnd.syncnarr+json", ["media-overlay"], moURL, true);
                        }
                    }
                    coverLink = publication.GetCover();
                    if (coverLink) {
                        coverImage = coverLink.Href;
                        if (coverImage && !UrlUtils_1.isHTTP(coverImage)) {
                            coverImage = absoluteURL(coverImage);
                        }
                    }
                    if (!isShow) return [3, 26];
                    objToSerialize = null;
                    if (!reqparams.jsonPath) return [3, 24];
                    _a = reqparams.jsonPath;
                    switch (_a) {
                        case "all": return [3, 9];
                        case "cover": return [3, 10];
                        case "mediaoverlays": return [3, 11];
                        case "spine": return [3, 15];
                        case "pagelist": return [3, 16];
                        case "landmarks": return [3, 17];
                        case "links": return [3, 18];
                        case "resources": return [3, 19];
                        case "toc": return [3, 20];
                        case "metadata": return [3, 21];
                    }
                    return [3, 22];
                case 9:
                    {
                        objToSerialize = publication;
                        return [3, 23];
                    }
                    _d.label = 10;
                case 10:
                    {
                        objToSerialize = publication.GetCover();
                        return [3, 23];
                    }
                    _d.label = 11;
                case 11:
                    _d.trys.push([11, 13, , 14]);
                    return [4, epub_1.getAllMediaOverlays(publication)];
                case 12:
                    objToSerialize = _d.sent();
                    return [3, 14];
                case 13:
                    err_3 = _d.sent();
                    debug(err_3);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_3 + "</p></body></html>");
                    return [2];
                case 14: return [3, 23];
                case 15:
                    {
                        objToSerialize = publication.Spine;
                        return [3, 23];
                    }
                    _d.label = 16;
                case 16:
                    {
                        objToSerialize = publication.PageList;
                        return [3, 23];
                    }
                    _d.label = 17;
                case 17:
                    {
                        objToSerialize = publication.Landmarks;
                        return [3, 23];
                    }
                    _d.label = 18;
                case 18:
                    {
                        objToSerialize = publication.Links;
                        return [3, 23];
                    }
                    _d.label = 19;
                case 19:
                    {
                        objToSerialize = publication.Resources;
                        return [3, 23];
                    }
                    _d.label = 20;
                case 20:
                    {
                        objToSerialize = publication.TOC;
                        return [3, 23];
                    }
                    _d.label = 21;
                case 21:
                    {
                        objToSerialize = publication.Metadata;
                        return [3, 23];
                    }
                    _d.label = 22;
                case 22:
                    {
                        objToSerialize = null;
                    }
                    _d.label = 23;
                case 23: return [3, 25];
                case 24:
                    objToSerialize = publication;
                    _d.label = 25;
                case 25:
                    if (!objToSerialize) {
                        objToSerialize = {};
                    }
                    jsonObj = serializable_1.TaJsonSerialize(objToSerialize);
                    validationStr = void 0;
                    doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
                    if (doValidate) {
                        jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                        jsonSchemasNames = [
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
                        validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonObj);
                        if (validationErrors) {
                            validationStr = "";
                            for (_i = 0, validationErrors_1 = validationErrors; _i < validationErrors_1.length; _i++) {
                                err = validationErrors_1[_i];
                                debug("JSON Schema validation FAIL.");
                                debug(err);
                                val = err.jsonPath ? DotProp.get(jsonObj, err.jsonPath) : "";
                                valueStr = (typeof val === "string") ?
                                    "" + val :
                                    ((val instanceof Array || typeof val === "object") ?
                                        "" + JSON.stringify(val) :
                                        "");
                                debug(valueStr);
                                title = DotProp.get(jsonObj, "metadata.title");
                                debug(title);
                                validationStr +=
                                    "\n\"" + title + "\"\n\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + ((_c = err.ajvDataPath) === null || _c === void 0 ? void 0 : _c.replace(/^\./, "")) + "' (" + err.ajvSchemaPath + ")\n\n";
                            }
                        }
                    }
                    absolutizeURLs(jsonObj);
                    jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
                    regex = new RegExp(">" + rootUrl + "/([^<]+</a>)", "g");
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
                    return [3, 27];
                case 26:
                    server.setResponseCORS(res);
                    res.set("Content-Type", contentType + "; charset=utf-8");
                    publicationJsonObj = serializable_1.TaJsonSerialize(publication);
                    if (isCanonical) {
                        if (publicationJsonObj.links) {
                            delete publicationJsonObj.links;
                        }
                    }
                    publicationJsonStr = isCanonical ?
                        global.JSON.stringify(JsonUtils_1.sortObject(publicationJsonObj), null, "") :
                        global.JSON.stringify(publicationJsonObj, null, "  ");
                    checkSum = crypto.createHash("sha256");
                    checkSum.update(publicationJsonStr);
                    hash = checkSum.digest("hex");
                    match = req.header("If-None-Match");
                    if (match === hash) {
                        debug("manifest.json cache");
                        res.status(304);
                        res.end();
                        return [2];
                    }
                    res.setHeader("ETag", hash);
                    links = getPreFetchResources(publication);
                    if (links && links.length) {
                        n = 0;
                        prefetch = "";
                        for (_b = 0, links_1 = links; _b < links_1.length; _b++) {
                            l = links_1[_b];
                            n++;
                            if (n > server.maxPrefetchLinks) {
                                break;
                            }
                            href = absoluteURL(l.Href);
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
                    _d.label = 27;
                case 27: return [2];
            }
        });
    }); });
    routerPathBase64.use("/:" + request_ext_1._pathBase64 + "/manifest.json", routerManifestJson);
}
exports.serverManifestJson = serverManifestJson;
function getPreFetchResources(publication) {
    var links = [];
    if (publication.Resources) {
        var mediaTypes = ["text/css",
            "text/javascript", "application/javascript",
            "application/vnd.ms-opentype", "font/otf", "application/font-sfnt",
            "font/ttf", "application/font-sfnt",
            "font/woff", "application/font-woff", "font/woff2"];
        for (var _i = 0, mediaTypes_1 = mediaTypes; _i < mediaTypes_1.length; _i++) {
            var mediaType = mediaTypes_1[_i];
            for (var _a = 0, _b = publication.Resources; _a < _b.length; _a++) {
                var link = _b[_a];
                if (link.TypeLink === mediaType) {
                    links.push(link);
                }
            }
        }
    }
    return links;
}
//# sourceMappingURL=server-manifestjson.js.map