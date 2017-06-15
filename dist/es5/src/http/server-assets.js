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
var zlib = require("zlib");
var cbz_1 = require("../parser/cbz");
var epub_1 = require("../parser/epub");
var RangeUtils_1 = require("../_utils/http/RangeUtils");
var BufferUtils_1 = require("../_utils/stream/BufferUtils");
var debug_ = require("debug");
var express = require("express");
var mime = require("mime-types");
var forge = require("node-forge");
var debug = debug_("r2:server:assets");
function serverAssets(server, routerPathBase64) {
    var _this = this;
    var routerAssets = express.Router({ strict: false });
    routerAssets.get("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var isShow, isHead, pathBase64Str, publication, fileName, ext, _a, err_1, err, zipInternal, err, zip, pathInZip, err, link, relativePath_1, err, mediaType, isText, isEncrypted, isPartialByteRangeRequest, err, partialByteBegin, partialByteEnd, ranges, err, zipStream_, _b, err_2, zipStream, totalByteLength, partialByteLength, zipData, err_3, pubID, checkSum, key, prefixLength, zipDataPrefix, i, zipDataRemainder, pubID, key, i, byteHex, byteNumer, prefixLength, zipDataPrefix, i, zipDataRemainder, contentKey, lcpPass, err, AES_BLOCK_SIZE, iv, toDecrypt, aesCbcDecipher, decryptedZipData, err, err, rangeHeader;
        return __generator(this, function (_c) {
            switch (_c.label) {
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
                    if (!!publication) return [3, 8];
                    fileName = path.basename(pathBase64Str);
                    ext = path.extname(fileName).toLowerCase();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    if (!(ext === ".epub")) return [3, 3];
                    return [4, epub_1.EpubParsePromise(pathBase64Str)];
                case 2:
                    _a = _c.sent();
                    return [3, 5];
                case 3: return [4, cbz_1.CbzParsePromise(pathBase64Str)];
                case 4:
                    _a = _c.sent();
                    _c.label = 5;
                case 5:
                    publication = _a;
                    return [3, 7];
                case 6:
                    err_1 = _c.sent();
                    debug(err_1);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_1 + "</p></body></html>");
                    return [2];
                case 7:
                    server.cachePublication(pathBase64Str, publication);
                    _c.label = 8;
                case 8:
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
                    isPartialByteRangeRequest = req.headers &&
                        req.headers.range;
                    if (isEncrypted && isPartialByteRangeRequest) {
                        err = "Encrypted video/audio not supported (HTTP 206 partial request byte range)";
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                        return [2];
                    }
                    partialByteBegin = -1;
                    partialByteEnd = -1;
                    if (isPartialByteRangeRequest) {
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
                    if (partialByteBegin === 0 && partialByteEnd < 0) {
                    }
                    _c.label = 9;
                case 9:
                    _c.trys.push([9, 14, , 15]);
                    if (!isPartialByteRangeRequest) return [3, 11];
                    return [4, zip.entryStreamRangePromise(pathInZip, partialByteBegin, partialByteEnd)];
                case 10:
                    _b = _c.sent();
                    return [3, 13];
                case 11: return [4, zip.entryStreamPromise(pathInZip)];
                case 12:
                    _b = _c.sent();
                    _c.label = 13;
                case 13:
                    zipStream_ = _b;
                    return [3, 15];
                case 14:
                    err_2 = _c.sent();
                    debug(err_2);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_2 + "</p></body></html>");
                    return [2];
                case 15:
                    zipStream = zipStream_.stream;
                    totalByteLength = zipStream_.length;
                    if (partialByteEnd < 0) {
                        partialByteEnd = totalByteLength - 1;
                    }
                    partialByteLength = isPartialByteRangeRequest ?
                        partialByteEnd - partialByteBegin + 1 :
                        totalByteLength;
                    if (!(!isHead && (isEncrypted || (isShow && isText)))) return [3, 19];
                    _c.label = 16;
                case 16:
                    _c.trys.push([16, 18, , 19]);
                    return [4, BufferUtils_1.streamToBufferPromise(zipStream)];
                case 17:
                    zipData = _c.sent();
                    return [3, 19];
                case 18:
                    err_3 = _c.sent();
                    debug(err_3);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err_3 + "</p></body></html>");
                    return [2];
                case 19:
                    if (zipData && isEncrypted && link) {
                        if (link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding") {
                            pubID = publication.Metadata.Identifier;
                            pubID = pubID.replace(/\s/g, "");
                            checkSum = crypto.createHash("sha1");
                            checkSum.update(pubID);
                            key = checkSum.digest();
                            prefixLength = 1040;
                            zipDataPrefix = zipData.slice(0, prefixLength);
                            for (i = 0; i < prefixLength; i++) {
                                zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
                            }
                            zipDataRemainder = zipData.slice(prefixLength);
                            zipData = Buffer.concat([zipDataPrefix, zipDataRemainder]);
                        }
                        else if (link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC") {
                            pubID = publication.Metadata.Identifier;
                            pubID = pubID.replace("urn:uuid:", "");
                            pubID = pubID.replace(/-/g, "");
                            pubID = pubID.replace(/\s/g, "");
                            key = [];
                            for (i = 0; i < 16; i++) {
                                byteHex = pubID.substr(i * 2, 2);
                                byteNumer = parseInt(byteHex, 16);
                                key.push(byteNumer);
                            }
                            prefixLength = 1024;
                            zipDataPrefix = zipData.slice(0, prefixLength);
                            for (i = 0; i < prefixLength; i++) {
                                zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
                            }
                            zipDataRemainder = zipData.slice(prefixLength);
                            zipData = Buffer.concat([zipDataPrefix, zipDataRemainder]);
                        }
                        else if (link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
                            && link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile"
                            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc") {
                            contentKey = void 0;
                            if (req.params.lcpPass64) {
                                lcpPass = new Buffer(req.params.lcpPass64, "base64").toString("utf8");
                                contentKey = publication.UpdateLCP(lcpPass);
                            }
                            if (!contentKey) {
                                err = "LCP missing key.";
                                debug(err);
                                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                    + err + "</p></body></html>");
                                return [2];
                            }
                            try {
                                AES_BLOCK_SIZE = 16;
                                iv = zipData.slice(0, AES_BLOCK_SIZE).toString("binary");
                                toDecrypt = forge.util.createBuffer(zipData.slice(AES_BLOCK_SIZE).toString("binary"), "binary");
                                aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", contentKey);
                                aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
                                aesCbcDecipher.update(toDecrypt);
                                aesCbcDecipher.finish();
                                decryptedZipData = aesCbcDecipher.output.bytes();
                                zipData = new Buffer(decryptedZipData, "binary");
                                if (link.Properties.Encrypted.Compression === "deflate") {
                                    zipData = zlib.inflateRawSync(zipData);
                                }
                                if (link.Properties.Encrypted.OriginalLength
                                    && link.Properties.Encrypted.OriginalLength !== zipData.length) {
                                    debug("LENGTH NOT MATCH " + link.Properties.Encrypted.OriginalLength + " !== " + zipData.length);
                                }
                            }
                            catch (erro) {
                                err = "LCP decrypt error.";
                                debug(err);
                                debug(erro);
                                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                    + err + " (" + erro + ")</p></body></html>");
                                return [2];
                            }
                        }
                        else {
                            err = "Encryption scheme not supported.";
                            debug(err);
                            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                + err + "</p></body></html>");
                            return [2];
                        }
                    }
                    if (isShow) {
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
                    }
                    else {
                        server.setResponseCORS(res);
                        res.setHeader("Cache-Control", "public,max-age=86400");
                        if (mediaType) {
                            res.set("Content-Type", mediaType);
                        }
                        res.setHeader("Accept-Ranges", "bytes");
                        if (isPartialByteRangeRequest) {
                            res.setHeader("Content-Length", "" + partialByteLength);
                            rangeHeader = "bytes " + partialByteBegin + "-" + partialByteEnd + "/" + totalByteLength;
                            res.setHeader("Content-Range", rangeHeader);
                            res.status(206);
                        }
                        else {
                            res.setHeader("Content-Length", "" + totalByteLength);
                            res.status(200);
                        }
                        if (isHead) {
                            res.end();
                        }
                        else {
                            if (zipData) {
                                res.send(zipData);
                            }
                            else {
                                zipStream.pipe(res);
                            }
                        }
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