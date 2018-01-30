"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const transformer_1 = require("r2-shared-js/dist/es6-es2015/src/transform/transformer");
const RangeUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/RangeUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const debug_ = require("debug");
const express = require("express");
const mime = require("mime-types");
const debug = debug_("r2:server:assets");
function serverAssets(server, routerPathBase64) {
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
            debug("HEAD !!!!!!!!!!!!!!!!!!!");
        }
        const pathBase64Str = new Buffer(req.params.pathBase64, "base64").toString("utf8");
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
        const zipInternal = publication.findFromInternal("zip");
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
        if ((publication.Resources || publication.Spine)
            && pathInZip.indexOf("META-INF/") !== 0
            && !pathInZip.endsWith(".opf")) {
            const relativePath = pathInZip;
            if (publication.Resources) {
                link = publication.Resources.find((l) => {
                    if (l.Href === relativePath) {
                        return true;
                    }
                    return false;
                });
            }
            if (!link) {
                if (publication.Spine) {
                    link = publication.Spine.find((l) => {
                        if (l.Href === relativePath) {
                            return true;
                        }
                        return false;
                    });
                }
            }
            if (!link) {
                const err = "Asset not declared in publication spine/resources!" + relativePath;
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
        if (server.isSecured() && !link &&
            (pathInZip.indexOf("META-INF/") === 0 || pathInZip.endsWith(".opf"))) {
            res.status(200).send("<html><body></body></html>");
            return;
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
        const isPartialByteRangeRequest = ((req.headers && req.headers.range) ? true : false);
        let partialByteBegin = 0;
        let partialByteEnd = -1;
        let partialByteLength = 0;
        if (isPartialByteRangeRequest) {
            debug(req.headers.range);
            const ranges = RangeUtils_1.parseRangeHeader(req.headers.range);
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
        let zipStream_;
        try {
            zipStream_ = isPartialByteRangeRequest && !isEncrypted ?
                yield zip.entryStreamRangePromise(pathInZip, partialByteBegin, partialByteEnd) :
                yield zip.entryStreamPromise(pathInZip);
        }
        catch (err) {
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        if ((isEncrypted && (isObfuscatedFont || !server.disableDecryption)) &&
            link) {
            let decryptFail = false;
            let transformedStream;
            try {
                transformedStream = yield transformer_1.Transformers.tryStream(publication, link, zipStream_, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
            if (transformedStream) {
                zipStream_ = transformedStream;
            }
            else {
                decryptFail = true;
            }
            if (decryptFail) {
                const err = "Encryption scheme not supported.";
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
        if (partialByteEnd < 0) {
            partialByteEnd = zipStream_.length - 1;
        }
        partialByteLength = isPartialByteRangeRequest ?
            partialByteEnd - partialByteBegin + 1 :
            zipStream_.length;
        if (isShow) {
            let zipData;
            try {
                zipData = yield BufferUtils_1.streamToBufferPromise(zipStream_.stream);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
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
            const rangeHeader = `bytes ${partialByteBegin}-${partialByteEnd}/${zipStream_.length}`;
            res.setHeader("Content-Range", rangeHeader);
            res.status(206);
        }
        else {
            res.setHeader("Content-Length", `${zipStream_.length}`);
            res.status(200);
        }
        if (isHead) {
            res.end();
        }
        else {
            zipStream_.stream
                .pipe(res)
                .on("close", () => {
                res.end();
            });
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