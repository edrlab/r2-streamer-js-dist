"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverAssets = void 0;
const tslib_1 = require("tslib");
const debug_ = require("debug");
const express = require("express");
const mime = require("mime-types");
const path = require("path");
const zipHasEntry_1 = require("r2-shared-js/dist/es6-es2015/src/_utils/zipHasEntry");
const transformer_1 = require("r2-shared-js/dist/es6-es2015/src/transform/transformer");
const RangeUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/RangeUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const request_ext_1 = require("./request-ext");
const debug = debug_("r2:streamer#http/server-assets");
function serverAssets(server, routerPathBase64) {
    const routerAssets = express.Router({ strict: false });
    routerAssets.get("/", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const reqparams = req.params;
        if (!reqparams.pathBase64) {
            reqparams.pathBase64 = req.pathBase64;
        }
        if (!reqparams.asset) {
            reqparams.asset = req.asset;
        }
        if (!reqparams.lcpPass64) {
            reqparams.lcpPass64 = req.lcpPass64;
        }
        const isShow = req.query.show;
        const isHead = req.method.toLowerCase() === "head";
        if (isHead) {
            debug("HEAD !!!!!!!!!!!!!!!!!!!");
        }
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
        const zipInternal = publication.findFromInternal("zip");
        if (!zipInternal) {
            const err = "No publication zip!";
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        const zip = zipInternal.Value;
        const pathInZip = reqparams.asset;
        if (!zipHasEntry_1.zipHasEntry(zip, pathInZip, undefined)) {
            const err = "Asset not in zip! " + pathInZip;
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        const isDivina = publication.Metadata && publication.Metadata.RDFType &&
            (/http[s]?:\/\/schema\.org\/ComicStory$/.test(publication.Metadata.RDFType) ||
                /http[s]?:\/\/schema\.org\/VisualNarrative$/.test(publication.Metadata.RDFType));
        let link;
        const findLinkRecursive = (relativePath, l) => {
            if (l.Href === relativePath) {
                return l;
            }
            let found;
            if (l.Children) {
                for (const child of l.Children) {
                    found = findLinkRecursive(relativePath, child);
                    if (found) {
                        return found;
                    }
                }
            }
            if (l.Alternate) {
                for (const alt of l.Alternate) {
                    found = findLinkRecursive(relativePath, alt);
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        };
        if ((publication.Resources || publication.Spine || publication.Links)
            && pathInZip.indexOf("META-INF/") !== 0
            && !pathInZip.endsWith(".opf")) {
            const relativePath = pathInZip;
            if (publication.Resources) {
                for (const l of publication.Resources) {
                    link = findLinkRecursive(relativePath, l);
                    if (link) {
                        break;
                    }
                }
            }
            if (!link) {
                if (publication.Spine) {
                    for (const l of publication.Spine) {
                        link = findLinkRecursive(relativePath, l);
                        if (link) {
                            break;
                        }
                    }
                }
            }
            if (!link) {
                if (publication.Links) {
                    for (const l of publication.Links) {
                        link = findLinkRecursive(relativePath, l);
                        if (link) {
                            break;
                        }
                    }
                }
            }
            if (!link &&
                !isDivina) {
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
        const isText = (typeof mediaType === "string") && (mediaType.indexOf("text/") === 0 ||
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
        const isPartialByteRangeRequest = ((req.headers && req.headers.range) ? true : false);
        let partialByteBegin = 0;
        let partialByteEnd = -1;
        if (isPartialByteRangeRequest) {
            debug(req.headers.range);
            const ranges = RangeUtils_1.parseRangeHeader(req.headers.range);
            if (ranges && ranges.length) {
                if (ranges.length > 1) {
                    const err = "Too many HTTP ranges: " + req.headers.range;
                    debug(err);
                    res.status(416).send("<html><body><p>Internal Server Error</p><p>"
                        + err + "</p></body></html>");
                    return;
                }
                partialByteBegin = ranges[0].begin;
                partialByteEnd = ranges[0].end;
                if (partialByteBegin < 0) {
                    partialByteBegin = 0;
                }
            }
            debug(`${pathInZip} >> ${partialByteBegin}-${partialByteEnd}`);
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
        const doTransform = true;
        const sessionInfo = req.query[request_ext_1.URL_PARAM_SESSION_INFO];
        if (doTransform && link) {
            const fullUrl = `${server.serverUrl()}${req.originalUrl}`;
            let transformedStream;
            try {
                transformedStream = yield transformer_1.Transformers.tryStream(publication, link, fullUrl, zipStream_, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
            if (transformedStream) {
                if (transformedStream !== zipStream_) {
                    debug("Asset transformed ok: " + link.Href);
                }
                zipStream_ = transformedStream;
            }
            else {
                const err = "Transform fail (encryption scheme not supported?)";
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
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
        if (isPartialByteRangeRequest || isEncrypted) {
            server.setResponseCacheHeaders(res, false);
        }
        else {
            server.setResponseCacheHeaders(res, true);
        }
        if (mediaType) {
            res.set("Content-Type", mediaType);
        }
        res.setHeader("Accept-Ranges", "bytes");
        if (isPartialByteRangeRequest) {
            if (partialByteEnd < 0) {
                partialByteEnd = zipStream_.length - 1;
            }
            const partialByteLength = isPartialByteRangeRequest ?
                partialByteEnd - partialByteBegin + 1 :
                zipStream_.length;
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
                .on("error", function f() {
                debug("ZIP ERROR " + pathInZip);
            })
                .pipe(res)
                .on("error", function f() {
                debug("RES ERROR " + pathInZip);
            })
                .on("close", function f() {
                res.end();
            });
        }
    }));
    routerPathBase64.param("asset", (req, _res, next, value, _name) => {
        if (value) {
            value = value.replace(/\/\/+/g, "/");
        }
        req.asset = value;
        next();
    });
    routerPathBase64.use("/:" + request_ext_1._pathBase64 + "/:" + request_ext_1._asset + "(*)", routerAssets);
}
exports.serverAssets = serverAssets;
//# sourceMappingURL=server-assets.js.map