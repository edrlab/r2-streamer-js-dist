"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var publication_parser_1 = require("../../../es8-es2017/src/parser/publication-parser");
var transformer_1 = require("../../../es8-es2017/src/transform/transformer");
var RangeUtils_1 = require("../../../es8-es2017/src/_utils/http/RangeUtils");
var BufferUtils_1 = require("../../../es8-es2017/src/_utils/stream/BufferUtils");
var CounterPassThroughStream_1 = require("../../../es8-es2017/src/_utils/stream/CounterPassThroughStream");
var debug_ = require("debug");
var express = require("express");
var mime = require("mime-types");
var debug = debug_("r2:server:assets");
function serverAssets(server, routerPathBase64) {
    var _this = this;
    var streamCounter = 0;
    var routerAssets = express.Router({ strict: false });
    routerAssets.get("/", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var isShow, isHead, pathBase64Str, publication, err_1, err, zipInternal, err, zip, pathInZip, err, link, relativePath_1, err, mediaType, isText, isEncrypted, isObfuscatedFont, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, partialByteLength, ranges, err, zipStream_, _a, err_2, lcpPass, decryptFail, transformedStream, err_3, err, zipData, err_4, rangeHeader, counterStream_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!req.params.pathBase64) {
                        req.params.pathBase64 = req.pathBase64;
                    }
                    if (!req.params.asset) {
                        req.params.asset = req.asset;
                    }
                    if (!req.params.lcpPass64) {
                        req.params.lcpPass64 = req.lcpPass64;
                    }
                    isShow = req.query.show;
                    isHead = req.method.toLowerCase() === "head";
                    if (isHead) {
                        console.log("HEAD !!!!!!!!!!!!!!!!!!!");
                    }
                    pathBase64Str = new Buffer(req.params.pathBase64, "base64").toString("utf8");
                    publication = server.cachedPublication(pathBase64Str);
                    if (!!publication) return [3, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, publication_parser_1.PublicationParsePromise(pathBase64Str)];
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
                    server.cachePublication(pathBase64Str, publication);
                    _b.label = 5;
                case 5:
                    if (!publication.Internal) {
                        err = "No publication internals!";
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    zipInternal = publication.Internal.find(function (i) {
                        if (i.Name === "zip") {
                            return true;
                        }
                        return false;
                    });
                    if (!zipInternal) {
                        err = "No publication zip!";
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    zip = zipInternal.Value;
                    pathInZip = req.params.asset;
                    if (!zip.hasEntry(pathInZip)) {
                        err = "Asset not in zip! " + pathInZip;
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    if (publication.Resources
                        && pathInZip.indexOf("META-INF/") !== 0
                        && !pathInZip.endsWith(".opf")) {
                        relativePath_1 = pathInZip;
                        link = publication.Resources.find(function (l) {
                            if (l.Href === relativePath_1) {
                                return true;
                            }
                            return false;
                        });
                        if (!link) {
                            link = publication.Spine.find(function (l) {
                                if (l.Href === relativePath_1) {
                                    return true;
                                }
                                return false;
                            });
                        }
                        if (!link) {
                            err = "Asset not declared in publication spine/resources!";
                            debug(err);
                            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                + err + "</p></body></html>");
                            return [2];
                        }
                    }
                    mediaType = mime.lookup(pathInZip);
                    if (link && link.TypeLink) {
                        mediaType = link.TypeLink;
                    }
                    isText = mediaType && (mediaType.indexOf("text/") === 0 ||
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
                        debug(ranges);
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
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 11, , 12]);
                    if (!(isPartialByteRangeRequest && !isEncrypted)) return [3, 8];
                    return [4, zip.entryStreamRangePromise(pathInZip, partialByteBegin, partialByteEnd)];
                case 7:
                    _a = _b.sent();
                    return [3, 10];
                case 8: return [4, zip.entryStreamPromise(pathInZip)];
                case 9:
                    _a = _b.sent();
                    _b.label = 10;
                case 10:
                    zipStream_ = _a;
                    return [3, 12];
                case 11:
                    err_2 = _b.sent();
                    debug(err_2);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_2 + "</p></body></html>");
                    return [2];
                case 12:
                    if (!((isEncrypted && (isObfuscatedFont || !server.disableDecryption)) &&
                        link)) return [3, 17];
                    if (req.params.lcpPass64) {
                        lcpPass = new Buffer(req.params.lcpPass64, "base64").toString("utf8");
                        publication.AddToInternal("lcp_user_pass", lcpPass);
                    }
                    else {
                        publication.AddToInternal("lcp_user_pass", null);
                    }
                    decryptFail = false;
                    transformedStream = void 0;
                    _b.label = 13;
                case 13:
                    _b.trys.push([13, 15, , 16]);
                    return [4, transformer_1.Transformers.tryStream(publication, link, zipStream_, isPartialByteRangeRequest, partialByteBegin, partialByteEnd)];
                case 14:
                    transformedStream = _b.sent();
                    return [3, 16];
                case 15:
                    err_3 = _b.sent();
                    debug(err_3);
                    return [3, 16];
                case 16:
                    if (transformedStream) {
                        zipStream_ = transformedStream;
                    }
                    else {
                        decryptFail = true;
                    }
                    if (decryptFail) {
                        err = "Encryption scheme not supported.";
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    _b.label = 17;
                case 17:
                    if (partialByteEnd < 0) {
                        partialByteEnd = zipStream_.length - 1;
                    }
                    partialByteLength = isPartialByteRangeRequest ?
                        partialByteEnd - partialByteBegin + 1 :
                        zipStream_.length;
                    if (!isShow) return [3, 22];
                    zipData = void 0;
                    _b.label = 18;
                case 18:
                    _b.trys.push([18, 20, , 21]);
                    return [4, BufferUtils_1.streamToBufferPromise(zipStream_.stream)];
                case 19:
                    zipData = _b.sent();
                    return [3, 21];
                case 20:
                    err_4 = _b.sent();
                    debug(err_4);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_4 + "</p></body></html>");
                    return [2];
                case 21:
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
                case 22:
                    server.setResponseCORS(res);
                    res.setHeader("Cache-Control", "public,max-age=86400");
                    if (mediaType) {
                        res.set("Content-Type", mediaType);
                    }
                    res.setHeader("Accept-Ranges", "bytes");
                    if (isPartialByteRangeRequest) {
                        res.setHeader("Content-Length", "" + partialByteLength);
                        rangeHeader = "bytes " + partialByteBegin + "-" + partialByteEnd + "/" + zipStream_.length;
                        debug("+++> " + rangeHeader + " (( " + partialByteLength);
                        res.setHeader("Content-Range", rangeHeader);
                        res.status(206);
                    }
                    else {
                        res.setHeader("Content-Length", "" + zipStream_.length);
                        debug("---> " + zipStream_.length);
                        res.status(200);
                    }
                    if (isHead) {
                        res.end();
                    }
                    else {
                        debug("===> STREAM PIPE");
                        counterStream_1 = new CounterPassThroughStream_1.CounterPassThroughStream(++streamCounter);
                        zipStream_.stream
                            .on("finish", function () {
                            debug("ZIP FINISH " + counterStream_1.id);
                        })
                            .on("end", function () {
                            debug("ZIP END " + counterStream_1.id);
                        })
                            .on("close", function () {
                            debug("ZIP CLOSE " + counterStream_1.id);
                        })
                            .on("error", function () {
                            debug("ZIP ERROR " + counterStream_1.id);
                        })
                            .on("pipe", function () {
                            debug("ZIP PIPE " + counterStream_1.id);
                        })
                            .on("unpipe", function () {
                            debug("ZIP UNPIPE " + counterStream_1.id);
                        })
                            .pipe(counterStream_1)
                            .on("progress", function f() {
                            debug("CounterPassThroughStream PROGRESS: " +
                                this.id +
                                " -- " + this.bytesReceived);
                        })
                            .on("end", function f() {
                            debug("CounterPassThroughStream END: " +
                                this.id);
                        })
                            .on("close", function f() {
                            debug("CounterPassThroughStream CLOSE: " +
                                this.id);
                        })
                            .once("finish", function f() {
                            debug("CounterPassThroughStream FINISH: " +
                                this.id +
                                " -- " + this.bytesReceived);
                        })
                            .on("error", function f() {
                            debug("CounterPassThroughStream ERROR: " +
                                this.id);
                        })
                            .on("pipe", function f() {
                            debug("CounterPassThroughStream PIPE: " +
                                this.id);
                        })
                            .on("unpipe", function f() {
                            debug("CounterPassThroughStream UNPIPE: " +
                                this.id);
                        })
                            .pipe(res)
                            .on("finish", function () {
                            debug("RES FINISH " + counterStream_1.id);
                        })
                            .on("end", function () {
                            debug("RES END " + counterStream_1.id);
                        })
                            .on("close", function () {
                            debug("RES CLOSE " + counterStream_1.id);
                            res.end();
                            counterStream_1.unpipe(res);
                            counterStream_1.end();
                            if (zipStream_) {
                                zipStream_.stream.unpipe(counterStream_1);
                            }
                        })
                            .on("error", function () {
                            debug("RES ERROR " + counterStream_1.id);
                        })
                            .on("pipe", function () {
                            debug("RES PIPE " + counterStream_1.id);
                        })
                            .on("unpipe", function () {
                            debug("RES UNPIPE " + counterStream_1.id);
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
    routerPathBase64.use("/:pathBase64/:asset(*)", routerAssets);
}
exports.serverAssets = serverAssets;
//# sourceMappingURL=server-assets.js.map