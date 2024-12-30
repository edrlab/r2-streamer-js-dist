"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformerLCPRaw = void 0;
const tslib_1 = require("tslib");
const crypto = require("crypto");
const debug_ = require("debug");
const zlib = require("zlib");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const RangeStream_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/RangeStream");
const debug = debug_("r2:streamer#transformer-lcp-raw");
const AES_BLOCK_SIZE = 16;
const readStream = (s, n) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
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
function getDecryptedSizeStream(lcpContentKey, stream) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
            if (stream.length < TWO_AES_BLOCK_SIZE) {
                reject("crypto err");
                return;
            }
            const readPos = stream.length - TWO_AES_BLOCK_SIZE;
            const cypherRangeStream = new RangeStream_1.RangeStream(readPos, readPos + TWO_AES_BLOCK_SIZE - 1, stream.length);
            stream.stream.pipe(cypherRangeStream);
            const decrypteds = [];
            const handle = (ivBuffer, encrypted) => {
                const decryptStream = crypto.createDecipheriv("aes-256-cbc", lcpContentKey, ivBuffer);
                decryptStream.setAutoPadding(false);
                const buff1 = decryptStream.update(encrypted);
                if (buff1) {
                    decrypteds.push(buff1);
                }
                const buff2 = decryptStream.final();
                if (buff2) {
                    decrypteds.push(buff2);
                }
                finish();
            };
            let finished = false;
            const finish = () => {
                if (finished) {
                    return;
                }
                finished = true;
                const decrypted = Buffer.concat(decrypteds);
                if (decrypted.length !== AES_BLOCK_SIZE) {
                    reject("decrypted.length !== AES_BLOCK_SIZE");
                    return;
                }
                const nPaddingBytes = decrypted[AES_BLOCK_SIZE - 1];
                const size = stream.length - AES_BLOCK_SIZE - nPaddingBytes;
                const res = {
                    length: size,
                    padding: nPaddingBytes,
                };
                resolve(res);
            };
            try {
                const buf = yield readStream(cypherRangeStream, TWO_AES_BLOCK_SIZE);
                if (!buf) {
                    reject("!buf (end?)");
                    return;
                }
                if (buf.length !== TWO_AES_BLOCK_SIZE) {
                    reject("buf.length !== TWO_AES_BLOCK_SIZE");
                    return;
                }
                handle(buf.slice(0, AES_BLOCK_SIZE), buf.slice(AES_BLOCK_SIZE));
            }
            catch (err) {
                debug(err);
                reject(err);
                return;
            }
        }));
    });
}
class TransformerLCPRaw {
    supports(publication, link) {
        var _a;
        if (publication.LCP) {
            return false;
        }
        if (!((_a = link.Properties) === null || _a === void 0 ? void 0 : _a.Encrypted)) {
            return false;
        }
        if (!publication["AES256CBCContentKey"]) {
            return false;
        }
        const check = link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            return false;
        }
        return true;
    }
    transformStream(publication, link, url, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lcpContentKey = publication["AES256CBCContentKey"];
            const isCompressionNone = link.Properties.Encrypted.Compression === "none";
            const isCompressionDeflate = link.Properties.Encrypted.Compression === "deflate";
            let plainTextSize = -1;
            let cryptoInfo;
            let cypherBlockPadding = -1;
            if (link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0) {
                plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                cypherBlockPadding = link.Properties.Encrypted.CypherBlockPadding;
            }
            else {
                try {
                    cryptoInfo = yield getDecryptedSizeStream(lcpContentKey, stream);
                }
                catch (err) {
                    debug(err);
                    return Promise.reject(err);
                }
                plainTextSize = cryptoInfo.length;
                cypherBlockPadding = cryptoInfo.padding;
                link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                link.Properties.Encrypted.CypherBlockPadding = cypherBlockPadding;
                try {
                    stream = yield stream.reset();
                }
                catch (err) {
                    debug(err);
                    return Promise.reject(err);
                }
                if (link.Properties.Encrypted.OriginalLength &&
                    isCompressionNone &&
                    link.Properties.Encrypted.OriginalLength !== plainTextSize) {
                    debug("############### LCP transformStream() LENGTH NOT MATCH link.Properties.Encrypted.OriginalLength !== plainTextSize: " +
                        `${link.Properties.Encrypted.OriginalLength} !== ${plainTextSize}`);
                }
            }
            let destStream;
            let rawDecryptStream;
            let ivBuffer;
            if (link.Properties.Encrypted.CypherBlockIV) {
                ivBuffer = Buffer.from(link.Properties.Encrypted.CypherBlockIV, "binary");
                const cypherRangeStream = new RangeStream_1.RangeStream(AES_BLOCK_SIZE, stream.length - 1, stream.length);
                stream.stream.pipe(cypherRangeStream);
                rawDecryptStream = cypherRangeStream;
            }
            else {
                try {
                    ivBuffer = yield readStream(stream.stream, AES_BLOCK_SIZE);
                }
                catch (err) {
                    debug(err);
                    return Promise.reject(err);
                }
                link.Properties.Encrypted.CypherBlockIV = ivBuffer.toString("binary");
                stream.stream.resume();
                rawDecryptStream = stream.stream;
            }
            const decryptStream = crypto.createDecipheriv("aes-256-cbc", lcpContentKey, ivBuffer);
            decryptStream.setAutoPadding(false);
            rawDecryptStream.pipe(decryptStream);
            destStream = decryptStream;
            if (link.Properties.Encrypted.CypherBlockPadding) {
                const cypherUnpaddedStream = new RangeStream_1.RangeStream(0, plainTextSize - 1, plainTextSize);
                destStream.pipe(cypherUnpaddedStream);
                destStream = cypherUnpaddedStream;
            }
            if (isCompressionDeflate) {
                const inflateStream = zlib.createInflateRaw();
                destStream.pipe(inflateStream);
                destStream = inflateStream;
                if (!link.Properties.Encrypted.OriginalLength) {
                    debug("############### RESOURCE ENCRYPTED OVER DEFLATE, BUT NO OriginalLength!");
                    let fullDeflatedBuffer;
                    try {
                        fullDeflatedBuffer = yield (0, BufferUtils_1.streamToBufferPromise)(destStream);
                        link.Properties.Encrypted.OriginalLength = fullDeflatedBuffer.length;
                        destStream = (0, BufferUtils_1.bufferToStream)(fullDeflatedBuffer);
                    }
                    catch (err) {
                        debug(err);
                    }
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
                    let resetedStream;
                    try {
                        resetedStream = yield stream.reset();
                    }
                    catch (err) {
                        debug(err);
                        return Promise.reject(err);
                    }
                    return this.transformStream(publication, link, url, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo);
                }),
                stream: destStream,
            };
            return Promise.resolve(sal);
        });
    }
}
exports.TransformerLCPRaw = TransformerLCPRaw;
//# sourceMappingURL=transformer-lcp-raw.js.map