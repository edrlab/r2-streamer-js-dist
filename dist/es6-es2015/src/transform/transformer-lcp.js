"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const zlib = require("zlib");
const RangeStream_1 = require("../../../es8-es2017/src/_utils/stream/RangeStream");
const debug_ = require("debug");
const debug = debug_("r2:transformer:lcp");
const AES_BLOCK_SIZE = 16;
const readStream = (s, n) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const onReadable = () => {
            const b = s.read(n);
            s.removeListener("readable", onReadable);
            s.removeListener("error", reject);
            resolve(b);
        };
        s.on("readable", onReadable);
        s.on("error", reject);
    });
});
class TransformerLCP {
    supports(publication, link) {
        if (!publication.LCP) {
            return false;
        }
        if (!publication.LCP.ContentKey) {
            debug("Missing LCP content key.");
            return false;
        }
        const check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
            && link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile"
            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            debug("Incorrect resource LCP fields.");
            return false;
        }
        return true;
    }
    transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const contentKey = publication.LCP.ContentKey;
            let cryptoInfo;
            let plainTextSize = -1;
            let cypherBlockPadding = -1;
            if (link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0) {
                plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                cypherBlockPadding = link.Properties.Encrypted.CypherBlockPadding;
            }
            else {
                cryptoInfo = yield this.getDecryptedSizeStream(publication, link, stream);
                plainTextSize = cryptoInfo.length;
                cypherBlockPadding = cryptoInfo.padding;
                link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                link.Properties.Encrypted.CypherBlockPadding = cypherBlockPadding;
                stream = yield stream.reset();
                if (link.Properties.Encrypted.OriginalLength &&
                    link.Properties.Encrypted.Compression === "none" &&
                    link.Properties.Encrypted.OriginalLength !== plainTextSize) {
                    debug(`############### ` +
                        `LCP transformStream() LENGTH NOT MATCH ` +
                        `link.Properties.Encrypted.OriginalLength !== plainTextSize:` +
                        `${link.Properties.Encrypted.OriginalLength} !== ${plainTextSize}`);
                }
            }
            if (partialByteBegin < 0) {
                partialByteBegin = 0;
            }
            if (partialByteEnd < 0) {
                partialByteEnd = plainTextSize - 1;
                if (link.Properties.Encrypted.OriginalLength) {
                    partialByteEnd = link.Properties.Encrypted.OriginalLength - 1;
                }
            }
            let rawDecryptStream;
            let ivBuffer;
            if (link.Properties.Encrypted.CypherBlockIV) {
                ivBuffer = Buffer.from(link.Properties.Encrypted.CypherBlockIV, "binary");
                const cypherRangeStream = new RangeStream_1.RangeStream(AES_BLOCK_SIZE, stream.length - 1, stream.length);
                stream.stream.pipe(cypherRangeStream);
                rawDecryptStream = cypherRangeStream;
            }
            else {
                ivBuffer = yield readStream(stream.stream, AES_BLOCK_SIZE);
                link.Properties.Encrypted.CypherBlockIV = ivBuffer.toString("binary");
                stream.stream.resume();
                rawDecryptStream = stream.stream;
            }
            const decryptStream = crypto.createDecipheriv("aes-256-cbc", contentKey, ivBuffer);
            decryptStream.setAutoPadding(false);
            rawDecryptStream.pipe(decryptStream);
            let destStream = decryptStream;
            if (cypherBlockPadding) {
                const cypherUnpaddedStream = new RangeStream_1.RangeStream(0, plainTextSize - 1, plainTextSize);
                destStream.pipe(cypherUnpaddedStream);
                destStream = cypherUnpaddedStream;
            }
            if (link.Properties.Encrypted.Compression === "deflate") {
                const inflateStream = zlib.createInflateRaw();
                destStream.pipe(inflateStream);
                destStream = inflateStream;
            }
            const l = link.Properties.Encrypted.OriginalLength ?
                link.Properties.Encrypted.OriginalLength : plainTextSize;
            if (isPartialByteRangeRequest) {
                const rangeStream = new RangeStream_1.RangeStream(partialByteBegin, partialByteEnd, l);
                destStream.pipe(rangeStream);
                destStream = rangeStream;
            }
            const sal = {
                length: l,
                reset: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const resetedStream = yield stream.reset();
                    return this.transformStream(publication, link, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
                }),
                stream: destStream,
            };
            return Promise.resolve(sal);
        });
    }
    getDecryptedSizeStream(publication, _link, stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const contentKey = publication.LCP.ContentKey;
            return new Promise((resolve, reject) => {
                const TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
                if (stream.length < TWO_AES_BLOCK_SIZE) {
                    reject("crypto err");
                    return;
                }
                const readPos = stream.length - TWO_AES_BLOCK_SIZE;
                const cypherRangeStream = new RangeStream_1.RangeStream(readPos, readPos + TWO_AES_BLOCK_SIZE - 1, stream.length);
                stream.stream.pipe(cypherRangeStream);
                const decrypteds = [];
                cypherRangeStream.on("readable", () => {
                    const ivBuffer = cypherRangeStream.read(AES_BLOCK_SIZE);
                    if (!ivBuffer) {
                        return;
                    }
                    const encrypted = cypherRangeStream.read(AES_BLOCK_SIZE);
                    const decryptStream = crypto.createDecipheriv("aes-256-cbc", contentKey, ivBuffer);
                    decryptStream.setAutoPadding(false);
                    const buff1 = decryptStream.update(encrypted);
                    if (buff1) {
                        decrypteds.push(buff1);
                    }
                    const buff2 = decryptStream.final();
                    if (buff2) {
                        decrypteds.push(buff2);
                    }
                });
                cypherRangeStream.on("end", () => {
                    const decrypted = Buffer.concat(decrypteds);
                    const nPaddingBytes = decrypted[AES_BLOCK_SIZE - 1];
                    const size = stream.length - AES_BLOCK_SIZE - nPaddingBytes;
                    const res = {
                        length: size,
                        padding: nPaddingBytes,
                    };
                    resolve(res);
                });
                cypherRangeStream.on("error", () => {
                    reject("DECRYPT err");
                });
            });
        });
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map