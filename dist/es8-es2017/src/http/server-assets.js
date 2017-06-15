"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const path = require("path");
const zlib = require("zlib");
const cbz_1 = require("../parser/cbz");
const epub_1 = require("../parser/epub");
const RangeUtils_1 = require("../_utils/http/RangeUtils");
const BufferUtils_1 = require("../_utils/stream/BufferUtils");
const debug_ = require("debug");
const express = require("express");
const mime = require("mime-types");
const forge = require("node-forge");
const debug = debug_("r2:server:assets");
function serverAssets(server, routerPathBase64) {
    const routerAssets = express.Router({ strict: false });
    routerAssets.get("/", async (req, res) => {
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
            const fileName = path.basename(pathBase64Str);
            const ext = path.extname(fileName).toLowerCase();
            try {
                publication = ext === ".epub" ?
                    await epub_1.EpubParsePromise(pathBase64Str) :
                    await cbz_1.CbzParsePromise(pathBase64Str);
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
        if (partialByteBegin === 0 && partialByteEnd < 0) {
        }
        let zipStream_;
        try {
            zipStream_ = isPartialByteRangeRequest ?
                await zip.entryStreamRangePromise(pathInZip, partialByteBegin, partialByteEnd) :
                await zip.entryStreamPromise(pathInZip);
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
        if (!isHead && (isEncrypted || (isShow && isText))) {
            try {
                zipData = await BufferUtils_1.streamToBufferPromise(zipStream);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
        }
        if (zipData && isEncrypted && link) {
            if (link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding") {
                let pubID = publication.Metadata.Identifier;
                pubID = pubID.replace(/\s/g, "");
                const checkSum = crypto.createHash("sha1");
                checkSum.update(pubID);
                const key = checkSum.digest();
                const prefixLength = 1040;
                const zipDataPrefix = zipData.slice(0, prefixLength);
                for (let i = 0; i < prefixLength; i++) {
                    zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
                }
                const zipDataRemainder = zipData.slice(prefixLength);
                zipData = Buffer.concat([zipDataPrefix, zipDataRemainder]);
            }
            else if (link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC") {
                let pubID = publication.Metadata.Identifier;
                pubID = pubID.replace("urn:uuid:", "");
                pubID = pubID.replace(/-/g, "");
                pubID = pubID.replace(/\s/g, "");
                const key = [];
                for (let i = 0; i < 16; i++) {
                    const byteHex = pubID.substr(i * 2, 2);
                    const byteNumer = parseInt(byteHex, 16);
                    key.push(byteNumer);
                }
                const prefixLength = 1024;
                const zipDataPrefix = zipData.slice(0, prefixLength);
                for (let i = 0; i < prefixLength; i++) {
                    zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
                }
                const zipDataRemainder = zipData.slice(prefixLength);
                zipData = Buffer.concat([zipDataPrefix, zipDataRemainder]);
            }
            else if (link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
                && link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile"
                && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc") {
                let contentKey;
                if (req.params.lcpPass64) {
                    const lcpPass = new Buffer(req.params.lcpPass64, "base64").toString("utf8");
                    contentKey = publication.UpdateLCP(lcpPass);
                }
                if (!contentKey) {
                    const err = "LCP missing key.";
                    debug(err);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err + "</p></body></html>");
                    return;
                }
                try {
                    const AES_BLOCK_SIZE = 16;
                    const iv = zipData.slice(0, AES_BLOCK_SIZE).toString("binary");
                    const toDecrypt = forge.util.createBuffer(zipData.slice(AES_BLOCK_SIZE).toString("binary"), "binary");
                    const aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", contentKey);
                    aesCbcDecipher.start({ iv, additionalData_: "binary-encoded string" });
                    aesCbcDecipher.update(toDecrypt);
                    aesCbcDecipher.finish();
                    const decryptedZipData = aesCbcDecipher.output.bytes();
                    zipData = new Buffer(decryptedZipData, "binary");
                    if (link.Properties.Encrypted.Compression === "deflate") {
                        zipData = zlib.inflateRawSync(zipData);
                    }
                    if (link.Properties.Encrypted.OriginalLength
                        && link.Properties.Encrypted.OriginalLength !== zipData.length) {
                        debug(`LENGTH NOT MATCH ${link.Properties.Encrypted.OriginalLength} !== ${zipData.length}`);
                    }
                }
                catch (erro) {
                    const err = "LCP decrypt error.";
                    debug(err);
                    debug(erro);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err + " (" + erro + ")</p></body></html>");
                    return;
                }
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
        }
        else {
            server.setResponseCORS(res);
            res.setHeader("Cache-Control", "public,max-age=86400");
            if (mediaType) {
                res.set("Content-Type", mediaType);
            }
            res.setHeader("Accept-Ranges", "bytes");
            if (isPartialByteRangeRequest) {
                res.setHeader("Content-Length", `${partialByteLength}`);
                const rangeHeader = `bytes ${partialByteBegin}-${partialByteEnd}/${totalByteLength}`;
                res.setHeader("Content-Range", rangeHeader);
                res.status(206);
            }
            else {
                res.setHeader("Content-Length", `${totalByteLength}`);
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
    });
    routerPathBase64.param("asset", (req, _res, next, value, _name) => {
        req.asset = value;
        next();
    });
    routerPathBase64.use("/:pathBase64/:asset(*)", routerAssets);
}
exports.serverAssets = serverAssets;
//# sourceMappingURL=server-assets.js.map