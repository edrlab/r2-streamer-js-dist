"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var path = require("path");
var epub_1 = require("r2-shared-js/dist/es5/src/parser/epub");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var css2json = require("css2json");
var debug_ = require("debug");
var express = require("express");
var jsonMarkup = require("json-markup");
var ta_json_x_1 = require("ta-json-x");
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
        var reqparams, isShow, isHead, isCanonical, isSecureHttp, pathBase64Str, publication, err_1, lcpPass, err_2, errMsg, rootUrl, manifestURL, selfLink, hasMO, link, moLink, moURL, coverImage, coverLink, objToSerialize, _a, err_3, jsonObj, validationStr, doValidate, jsonSchemasRootpath, jsonSchemasNames, jsonPretty, regex, publicationJsonObj, publicationJsonStr, checkSum, hash, match, links, prefetch_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
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
                    pathBase64Str = new Buffer(reqparams.pathBase64, "base64").toString("utf8");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, server.loadOrGetCachedPublication(pathBase64Str)];
                case 2:
                    publication = _b.sent();
                    return [3, 4];
                case 3:
                    err_1 = _b.sent();
                    debug(err_1);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_1 + "</p></body></html>");
                    return [2];
                case 4:
                    if (!(reqparams.lcpPass64 && !server.disableDecryption)) return [3, 8];
                    lcpPass = new Buffer(reqparams.lcpPass64, "base64").toString("utf8");
                    if (!publication.LCP) return [3, 8];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4, publication.LCP.tryUserKeys([lcpPass])];
                case 6:
                    _b.sent();
                    return [3, 8];
                case 7:
                    err_2 = _b.sent();
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
                    selfLink = publication.searchLinkByRel("self");
                    if (!selfLink) {
                        publication.AddLink("application/webpub+json", ["self"], manifestURL, undefined);
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
                            publication.AddLink("application/vnd.readium.mo+json", ["media-overlay"], moURL, true);
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
                    _b.label = 10;
                case 10:
                    {
                        objToSerialize = publication.GetCover();
                        return [3, 23];
                    }
                    _b.label = 11;
                case 11:
                    _b.trys.push([11, 13, , 14]);
                    return [4, epub_1.getAllMediaOverlays(publication)];
                case 12:
                    objToSerialize = _b.sent();
                    return [3, 14];
                case 13:
                    err_3 = _b.sent();
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
                    _b.label = 16;
                case 16:
                    {
                        objToSerialize = publication.PageList;
                        return [3, 23];
                    }
                    _b.label = 17;
                case 17:
                    {
                        objToSerialize = publication.Landmarks;
                        return [3, 23];
                    }
                    _b.label = 18;
                case 18:
                    {
                        objToSerialize = publication.Links;
                        return [3, 23];
                    }
                    _b.label = 19;
                case 19:
                    {
                        objToSerialize = publication.Resources;
                        return [3, 23];
                    }
                    _b.label = 20;
                case 20:
                    {
                        objToSerialize = publication.TOC;
                        return [3, 23];
                    }
                    _b.label = 21;
                case 21:
                    {
                        objToSerialize = publication.Metadata;
                        return [3, 23];
                    }
                    _b.label = 22;
                case 22:
                    {
                        objToSerialize = null;
                    }
                    _b.label = 23;
                case 23: return [3, 25];
                case 24:
                    objToSerialize = publication;
                    _b.label = 25;
                case 25:
                    if (!objToSerialize) {
                        objToSerialize = {};
                    }
                    jsonObj = ta_json_x_1.JSON.serialize(objToSerialize);
                    validationStr = void 0;
                    doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
                    if (doValidate) {
                        jsonSchemasRootpath = path.join(process.cwd(), "misc/json-schema/webpub-manifest");
                        jsonSchemasNames = [
                            "publication",
                            "contributor-object",
                            "contributor",
                            "link",
                            "metadata",
                            "subcollection",
                        ];
                        validationStr = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, "webpubmanifest", jsonSchemasNames, jsonObj);
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
                    res.set("Content-Type", "application/webpub+json; charset=utf-8");
                    publicationJsonObj = ta_json_x_1.JSON.serialize(publication);
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
                        prefetch_1 = "";
                        links.forEach(function (l) {
                            var href = absoluteURL(l.Href);
                            prefetch_1 += "<" + href + ">;" + "rel=prefetch,";
                        });
                        res.setHeader("Link", prefetch_1);
                    }
                    res.status(200);
                    if (isHead) {
                        res.end();
                    }
                    else {
                        res.send(publicationJsonStr);
                    }
                    _b.label = 27;
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
        var mediaTypes_1 = ["text/css", "application/vnd.ms-opentype", "text/javascript"];
        publication.Resources.forEach(function (link) {
            mediaTypes_1.forEach(function (mediaType) {
                if (link.TypeLink === mediaType) {
                    links.push(link);
                }
            });
        });
    }
    return links;
}
//# sourceMappingURL=server-manifestjson.js.map