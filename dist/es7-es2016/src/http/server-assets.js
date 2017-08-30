"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const publication_parser_1 = require("../../../es8-es2017/src/parser/publication-parser");
const transformer_1 = require("../../../es8-es2017/src/transform/transformer");
const RangeUtils_1 = require("../../../es8-es2017/src/_utils/http/RangeUtils");
const BufferUtils_1 = require("../../../es8-es2017/src/_utils/stream/BufferUtils");
const CounterPassThroughStream_1 = require("../../../es8-es2017/src/_utils/stream/CounterPassThroughStream");
const debug_ = require("debug");
const express = require("express");
const mime = require("mime-types");
const debug = debug_("r2:server:assets");
function serverAssets(server, routerPathBase64) {
    let streamCounter = 0;
    const routerAssets = express.Router({ strict: false });
    routerAssets.get("/", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!req.params.pathBase64) {
            req.params.pathBase64 = req.pathBase64;
        }
        if (!req.params.asset) {
            req.params.asset = req.asset;
        }
        if (!req.params.lcpPass64) {
            req.params.lcpPass64 = req.lcpPass64;
        }
        const isShow = req.query.show;
        const isHead = req.method.toLowerCase() === "head";
        if (isHead) {
            console.log("HEAD !!!!!!!!!!!!!!!!!!!");
        }
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
        if (!publication.Internal) {
            const err = "No publication internals!";
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        const zipInternal = publication.Internal.find((i) => {
            if (i.Name === "zip") {
                return true;
            }
            return false;
        });
        if (!zipInternal) {
            const err = "No publication zip!";
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        const zip = zipInternal.Value;
        const pathInZip = req.params.asset;
        if (!zip.hasEntry(pathInZip)) {
            const err = "Asset not in zip! " + pathInZip;
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        let link;
        if (publication.Resources
            && pathInZip.indexOf("META-INF/") !== 0
            && !pathInZip.endsWith(".opf")) {
            const relativePath = pathInZip;
            link = publication.Resources.find((l) => {
                if (l.Href === relativePath) {
                    return true;
                }
                return false;
            });
            if (!link) {
                link = publication.Spine.find((l) => {
                    if (l.Href === relativePath) {
                        return true;
                    }
                    return false;
                });
            }
            if (!link) {
                const err = "Asset not declared in publication spine/resources!";
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
        let mediaType = mime.lookup(pathInZip);
        if (link && link.TypeLink) {
            mediaType = link.TypeLink;
        }
        const isText = mediaType && (mediaType.indexOf("text/") === 0 ||
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
        const isEncrypted = link && link.Properties && link.Properties.Encrypted;
        const isObfuscatedFont = isEncrypted && link &&
            (link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC"
                || link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding");
        const isPartialByteRangeRequest = req.headers &&
            req.headers.range;
        if (isEncrypted && isPartialByteRangeRequest) {
            const err = "Encrypted video/audio not supported (HTTP 206 partial request byte range)";
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        let partialByteBegin = -1;
        let partialByteEnd = -1;
        if (isPartialByteRangeRequest) {
            debug(req.headers.range);
            const ranges = RangeUtils_1.parseRangeHeader(req.headers.range);
            debug(ranges);
            if (ranges && ranges.length) {
                if (ranges.length > 1) {
                    const err = "Too many HTTP ranges: " + req.headers.range;
                    debug(err);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err + "</p></body></html>");
                    return;
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
        let zipStream_;
        try {
            zipStream_ = isPartialByteRangeRequest ?
                yield zip.entryStreamRangePromise(pathInZip, partialByteBegin, partialByteEnd) :
                yield zip.entryStreamPromise(pathInZip);
        }
        catch (err) {
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        const zipStream = zipStream_.stream;
        const totalByteLength = zipStream_.length;
        if (partialByteEnd < 0) {
            partialByteEnd = totalByteLength - 1;
        }
        const partialByteLength = isPartialByteRangeRequest ?
            partialByteEnd - partialByteBegin + 1 :
            totalByteLength;
        let zipData;
        if (!isHead
            && ((isEncrypted && (isObfuscatedFont || !server.disableDecryption))
                || (isShow && isText))) {
            try {
                zipData = yield BufferUtils_1.streamToBufferPromise(zipStream);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
        if (zipData && isEncrypted && link) {
            if (req.params.lcpPass64) {
                const lcpPass = new Buffer(req.params.lcpPass64, "base64").toString("utf8");
                publication.AddToInternal("lcp_user_pass", lcpPass);
            }
            else {
                publication.AddToInternal("lcp_user_pass", null);
            }
            const transformedData = transformer_1.Transformers.try(publication, link, zipData);
            if (transformedData) {
                zipData = transformedData;
            }
            else {
                const err = "Encryption scheme not supported.";
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
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
            return;
        }
        server.setResponseCORS(res);
        res.setHeader("Cache-Control", "public,max-age=86400");
        if (mediaType) {
            res.set("Content-Type", mediaType);
        }
        res.setHeader("Accept-Ranges", "bytes");
        if (isPartialByteRangeRequest) {
            res.setHeader("Content-Length", `${partialByteLength}`);
            const rangeHeader = `bytes ${partialByteBegin}-${partialByteEnd}/${totalByteLength}`;
            debug("+++> " + rangeHeader + " (( " + partialByteLength);
            res.setHeader("Content-Range", rangeHeader);
            res.status(206);
        }
        else {
            res.setHeader("Content-Length", `${totalByteLength}`);
            debug("---> " + totalByteLength);
            res.status(200);
        }
        if (isHead) {
            res.end();
        }
        else {
            if (zipData) {
                debug("~~~~~~~~~~~~> BUFFER SEND");
                res.send(zipData);
            }
            else {
                debug("===> STREAM PIPE");
                const counterStream = new CounterPassThroughStream_1.CounterPassThroughStream(++streamCounter);
                zipStream
                    .on("finish", () => {
                    debug("ZIP FINISH " + counterStream.id);
                })
                    .on("end", () => {
                    debug("ZIP END " + counterStream.id);
                })
                    .on("close", () => {
                    debug("ZIP CLOSE " + counterStream.id);
                })
                    .on("error", () => {
                    debug("ZIP ERROR " + counterStream.id);
                })
                    .pipe(counterStream)
                    .on("end", function () {
                    debug("CounterPassThroughStream END: " +
                        this.id);
                })
                    .on("close", function () {
                    debug("CounterPassThroughStream CLOSE: " +
                        this.id);
                })
                    .once("finish", function () {
                    debug("CounterPassThroughStream FINISH: " +
                        this.id +
                        " -- " + this.bytesReceived);
                })
                    .on("error", function () {
                    debug("CounterPassThroughStream ERROR: " +
                        this.id);
                })
                    .pipe(res)
                    .on("finish", () => {
                    debug("RES FINISH " + counterStream.id);
                })
                    .on("end", () => {
                    debug("RES END " + counterStream.id);
                })
                    .on("close", () => {
                    debug("RES CLOSE " + counterStream.id);
                    res.end();
                    counterStream.unpipe(res);
                    counterStream.end();
                    zipStream.unpipe(counterStream);
                })
                    .on("error", () => {
                    debug("RES ERROR " + counterStream.id);
                });
            }
        }
    }));
    routerPathBase64.param("asset", (req, _res, next, value, _name) => {
        req.asset = value;
        next();
    });
    routerPathBase64.use("/:pathBase64/:asset(*)", routerAssets);
}
exports.serverAssets = serverAssets;
//# sourceMappingURL=server-assets.js.map