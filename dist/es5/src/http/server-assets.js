"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var transformer_1 = require("r2-shared-js/dist/es5/src/transform/transformer");
var RangeUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/RangeUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var debug_ = require("debug");
var express = require("express");
var mime = require("mime-types");
var request_ext_1 = require("./request-ext");
var debug = debug_("r2:streamer#http/server-assets");
function serverAssets(server, routerPathBase64) {
    var _this = this;
    var routerAssets = express.Router({ strict: false });
    routerAssets.get("/", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var reqparams, isShow, isHead, pathBase64Str, publication, err_1, zipInternal, err, zip, pathInZip, err, link, relativePath_1, err, mediaType, isText, isEncrypted, isObfuscatedFont, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, partialByteLength, ranges, err, zipStream_, _a, err_2, doTransform, transformFail, transformedStream, err_3, err, zipData, err_4, rangeHeader;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reqparams = req.params;
                    if (!reqparams.pathBase64) {
                        reqparams.pathBase64 = req.pathBase64;
                    }
                    if (!reqparams.asset) {
                        reqparams.asset = req.asset;
                    }
                    if (!reqparams.lcpPass64) {
                        reqparams.lcpPass64 = req.lcpPass64;
                    }
                    isShow = req.query.show;
                    isHead = req.method.toLowerCase() === "head";
                    if (isHead) {
                        debug("HEAD !!!!!!!!!!!!!!!!!!!");
                    }
                    pathBase64Str = new Buffer(decodeURIComponent(reqparams.pathBase64), "base64").toString("utf8");
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
                    zipInternal = publication.findFromInternal("zip");
                    if (!zipInternal) {
                        err = "No publication zip!";
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    zip = zipInternal.Value;
                    pathInZip = reqparams.asset;
                    if (!zip.hasEntry(pathInZip)) {
                        err = "Asset not in zip! " + pathInZip;
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    if ((publication.Resources || publication.Spine)
                        && pathInZip.indexOf("META-INF/") !== 0
                        && !pathInZip.endsWith(".opf")) {
                        relativePath_1 = pathInZip;
                        if (publication.Resources) {
                            link = publication.Resources.find(function (l) {
                                if (l.Href === relativePath_1) {
                                    return true;
                                }
                                return false;
                            });
                        }
                        if (!link) {
                            if (publication.Spine) {
                                link = publication.Spine.find(function (l) {
                                    if (l.Href === relativePath_1) {
                                        return true;
                                    }
                                    return false;
                                });
                            }
                        }
                        if (!link) {
                            err = "Asset not declared in publication spine/resources!" + relativePath_1;
                            debug(err);
                            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                + err + "</p></body></html>");
                            return [2];
                        }
                    }
                    if (server.isSecured() && !link &&
                        (pathInZip.indexOf("META-INF/") === 0 || pathInZip.endsWith(".opf"))) {
                        res.status(200).send("<html><body></body></html>");
                        return [2];
                    }
                    mediaType = mime.lookup(pathInZip);
                    if (link && link.TypeLink) {
                        mediaType = link.TypeLink;
                    }
                    isText = (typeof mediaType === "string") && (mediaType.indexOf("text/") === 0 ||
                        mediaType.indexOf("application/xhtml") === 0 ||
                        mediaType.indexOf("application/xml") === 0 ||
                        mediaType.indexOf("application/json") === 0 ||
                        mediaType.indexOf("application/svg") === 0 ||
                        mediaType.indexOf("application/smil") === 0 ||
                        mediaType.indexOf("+json") > 0 ||
                        mediaType.indexOf("+smil") > 0 ||
                        mediaType.indexOf("+svg") > 0 ||
                        mediaType.indexOf("+xhtml") > 0 ||
                        mediaType.indexOf("+xml") > 0);
                    isEncrypted = link && link.Properties && link.Properties.Encrypted;
                    isObfuscatedFont = isEncrypted && link &&
                        (link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC"
                            || link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding");
                    isPartialByteRangeRequest = ((req.headers && req.headers.range) ? true : false);
                    partialByteBegin = 0;
                    partialByteEnd = -1;
                    partialByteLength = 0;
                    if (isPartialByteRangeRequest) {
                        debug(req.headers.range);
                        ranges = RangeUtils_1.parseRangeHeader(req.headers.range);
                        if (ranges && ranges.length) {
                            if (ranges.length > 1) {
                                err = "Too many HTTP ranges: " + req.headers.range;
                                debug(err);
                                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                    + err + "</p></body></html>");
                                return [2];
                            }
                            partialByteBegin = ranges[0].begin;
                            partialByteEnd = ranges[0].end;
                            if (partialByteBegin < 0) {
                                partialByteBegin = 0;
                            }
                        }
                    }
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 10, , 11]);
                    if (!(isPartialByteRangeRequest && !isEncrypted)) return [3, 7];
                    return [4, zip.entryStreamRangePromise(pathInZip, partialByteBegin, partialByteEnd)];
                case 6:
                    _a = _b.sent();
                    return [3, 9];
                case 7: return [4, zip.entryStreamPromise(pathInZip)];
                case 8:
                    _a = _b.sent();
                    _b.label = 9;
                case 9:
                    zipStream_ = _a;
                    return [3, 11];
                case 10:
                    err_2 = _b.sent();
                    debug(err_2);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_2 + "</p></body></html>");
                    return [2];
                case 11:
                    doTransform = !isEncrypted || (isObfuscatedFont || !server.disableDecryption);
                    if (!(doTransform && link)) return [3, 16];
                    transformFail = false;
                    transformedStream = void 0;
                    _b.label = 12;
                case 12:
                    _b.trys.push([12, 14, , 15]);
                    return [4, transformer_1.Transformers.tryStream(publication, link, zipStream_, isPartialByteRangeRequest, partialByteBegin, partialByteEnd)];
                case 13:
                    transformedStream = _b.sent();
                    return [3, 15];
                case 14:
                    err_3 = _b.sent();
                    debug(err_3);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_3 + "</p></body></html>");
                    return [2];
                case 15:
                    if (transformedStream) {
                        if (transformedStream !== zipStream_) {
                            debug("Asset transformed ok: " + link.Href);
                        }
                        zipStream_ = transformedStream;
                    }
                    else {
                        transformFail = true;
                    }
                    if (transformFail) {
                        err = "Transform fail (encryption scheme not supported?)";
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    _b.label = 16;
                case 16:
                    if (partialByteEnd < 0) {
                        partialByteEnd = zipStream_.length - 1;
                    }
                    partialByteLength = isPartialByteRangeRequest ?
                        partialByteEnd - partialByteBegin + 1 :
                        zipStream_.length;
                    if (!isShow) return [3, 21];
                    zipData = void 0;
                    _b.label = 17;
                case 17:
                    _b.trys.push([17, 19, , 20]);
                    return [4, BufferUtils_1.streamToBufferPromise(zipStream_.stream)];
                case 18:
                    zipData = _b.sent();
                    return [3, 20];
                case 19:
                    err_4 = _b.sent();
                    debug(err_4);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_4 + "</p></body></html>");
                    return [2];
                case 20:
                    if (zipData) {
                        debug("CHECK: " + zipStream_.length + " ==> " + zipData.length);
                    }
                    res.status(200).send("<html><body>" +
                        "<h1>" + path.basename(pathBase64Str) + "</h1>" +
                        "<h2>" + mediaType + "</h2>" +
                        ((isText && zipData) ?
                            ("<p><pre>" +
                                zipData.toString("utf8").replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/"/g, "&quot;")
                                    .replace(/'/g, "&apos;") +
                                "</pre></p>")
                            : "<p>BINARY</p>") + "</body></html>");
                    return [2];
                case 21:
                    server.setResponseCORS(res);
                    res.setHeader("Cache-Control", "public,max-age=86400");
                    if (mediaType) {
                        res.set("Content-Type", mediaType);
                    }
                    res.setHeader("Accept-Ranges", "bytes");
                    if (isPartialByteRangeRequest) {
                        res.setHeader("Content-Length", "" + partialByteLength);
                        rangeHeader = "bytes " + partialByteBegin + "-" + partialByteEnd + "/" + zipStream_.length;
                        res.setHeader("Content-Range", rangeHeader);
                        res.status(206);
                    }
                    else {
                        res.setHeader("Content-Length", "" + zipStream_.length);
                        res.status(200);
                    }
                    if (isHead) {
                        res.end();
                    }
                    else {
                        zipStream_.stream
                            .pipe(res)
                            .on("close", function () {
                            res.end();
                        });
                    }
                    return [2];
            }
        });
    }); });
    routerPathBase64.param("asset", function (req, _res, next, value, _name) {
        req.asset = value;
        next();
    });
    routerPathBase64.use("/:" + request_ext_1._pathBase64 + "/:" + request_ext_1._asset + "(*)", routerAssets);
}
exports.serverAssets = serverAssets;
//# sourceMappingURL=server-assets.js.map