"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformerLCPRaw = void 0;
var tslib_1 = require("tslib");
var crypto = require("crypto");
var debug_ = require("debug");
var zlib = require("zlib");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var RangeStream_1 = require("r2-utils-js/dist/es5/src/_utils/stream/RangeStream");
var debug = debug_("r2:streamer#transformer-lcp-raw");
var AES_BLOCK_SIZE = 16;
var readStream = function (s, n) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                var onReadable = function () {
                    var b = s.read(n);
                    s.removeListener("readable", onReadable);
                    s.removeListener("error", reject);
                    resolve(b);
                };
                s.on("readable", onReadable);
                s.on("error", reject);
            })];
    });
}); };
function getDecryptedSizeStream(lcpContentKey, stream) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            return [2, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var TWO_AES_BLOCK_SIZE, readPos, cypherRangeStream, decrypteds, handle, finished, finish, buf, err_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
                                if (stream.length < TWO_AES_BLOCK_SIZE) {
                                    reject("crypto err");
                                    return [2];
                                }
                                readPos = stream.length - TWO_AES_BLOCK_SIZE;
                                cypherRangeStream = new RangeStream_1.RangeStream(readPos, readPos + TWO_AES_BLOCK_SIZE - 1, stream.length);
                                stream.stream.pipe(cypherRangeStream);
                                decrypteds = [];
                                handle = function (ivBuffer, encrypted) {
                                    var decryptStream = crypto.createDecipheriv("aes-256-cbc", lcpContentKey, ivBuffer);
                                    decryptStream.setAutoPadding(false);
                                    var buff1 = decryptStream.update(encrypted);
                                    if (buff1) {
                                        decrypteds.push(buff1);
                                    }
                                    var buff2 = decryptStream.final();
                                    if (buff2) {
                                        decrypteds.push(buff2);
                                    }
                                    finish();
                                };
                                finished = false;
                                finish = function () {
                                    if (finished) {
                                        return;
                                    }
                                    finished = true;
                                    var decrypted = Buffer.concat(decrypteds);
                                    if (decrypted.length !== AES_BLOCK_SIZE) {
                                        reject("decrypted.length !== AES_BLOCK_SIZE");
                                        return;
                                    }
                                    var nPaddingBytes = decrypted[AES_BLOCK_SIZE - 1];
                                    var size = stream.length - AES_BLOCK_SIZE - nPaddingBytes;
                                    var res = {
                                        length: size,
                                        padding: nPaddingBytes,
                                    };
                                    resolve(res);
                                };
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4, readStream(cypherRangeStream, TWO_AES_BLOCK_SIZE)];
                            case 2:
                                buf = _a.sent();
                                if (!buf) {
                                    reject("!buf (end?)");
                                    return [2];
                                }
                                if (buf.length !== TWO_AES_BLOCK_SIZE) {
                                    reject("buf.length !== TWO_AES_BLOCK_SIZE");
                                    return [2];
                                }
                                handle(buf.slice(0, AES_BLOCK_SIZE), buf.slice(AES_BLOCK_SIZE));
                                return [3, 4];
                            case 3:
                                err_1 = _a.sent();
                                debug(err_1);
                                reject(err_1);
                                return [2];
                            case 4: return [2];
                        }
                    });
                }); })];
        });
    });
}
var TransformerLCPRaw = (function () {
    function TransformerLCPRaw() {
    }
    TransformerLCPRaw.prototype.supports = function (publication, link) {
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
        var check = link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            return false;
        }
        return true;
    };
    TransformerLCPRaw.prototype.transformStream = function (publication, link, url, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var lcpContentKey, isCompressionNone, isCompressionDeflate, plainTextSize, cryptoInfo, cypherBlockPadding, err_2, err_3, destStream, rawDecryptStream, ivBuffer, cypherRangeStream, err_4, decryptStream, cypherUnpaddedStream, inflateStream, fullDeflatedBuffer, err_5, l, rangeStream, sal;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lcpContentKey = publication["AES256CBCContentKey"];
                        isCompressionNone = link.Properties.Encrypted.Compression === "none";
                        isCompressionDeflate = link.Properties.Encrypted.Compression === "deflate";
                        plainTextSize = -1;
                        cypherBlockPadding = -1;
                        if (!(link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0)) return [3, 1];
                        plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                        cypherBlockPadding = link.Properties.Encrypted.CypherBlockPadding;
                        return [3, 9];
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, getDecryptedSizeStream(lcpContentKey, stream)];
                    case 2:
                        cryptoInfo = _a.sent();
                        return [3, 4];
                    case 3:
                        err_2 = _a.sent();
                        debug(err_2);
                        return [2, Promise.reject(err_2)];
                    case 4:
                        plainTextSize = cryptoInfo.length;
                        cypherBlockPadding = cryptoInfo.padding;
                        link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                        link.Properties.Encrypted.CypherBlockPadding = cypherBlockPadding;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4, stream.reset()];
                    case 6:
                        stream = _a.sent();
                        return [3, 8];
                    case 7:
                        err_3 = _a.sent();
                        debug(err_3);
                        return [2, Promise.reject(err_3)];
                    case 8:
                        if (link.Properties.Encrypted.OriginalLength &&
                            isCompressionNone &&
                            link.Properties.Encrypted.OriginalLength !== plainTextSize) {
                            debug("############### LCP transformStream() LENGTH NOT MATCH link.Properties.Encrypted.OriginalLength !== plainTextSize: " +
                                "".concat(link.Properties.Encrypted.OriginalLength, " !== ").concat(plainTextSize));
                        }
                        _a.label = 9;
                    case 9:
                        if (!link.Properties.Encrypted.CypherBlockIV) return [3, 10];
                        ivBuffer = Buffer.from(link.Properties.Encrypted.CypherBlockIV, "binary");
                        cypherRangeStream = new RangeStream_1.RangeStream(AES_BLOCK_SIZE, stream.length - 1, stream.length);
                        stream.stream.pipe(cypherRangeStream);
                        rawDecryptStream = cypherRangeStream;
                        return [3, 14];
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4, readStream(stream.stream, AES_BLOCK_SIZE)];
                    case 11:
                        ivBuffer = _a.sent();
                        return [3, 13];
                    case 12:
                        err_4 = _a.sent();
                        debug(err_4);
                        return [2, Promise.reject(err_4)];
                    case 13:
                        link.Properties.Encrypted.CypherBlockIV = ivBuffer.toString("binary");
                        stream.stream.resume();
                        rawDecryptStream = stream.stream;
                        _a.label = 14;
                    case 14:
                        decryptStream = crypto.createDecipheriv("aes-256-cbc", lcpContentKey, ivBuffer);
                        decryptStream.setAutoPadding(false);
                        rawDecryptStream.pipe(decryptStream);
                        destStream = decryptStream;
                        if (link.Properties.Encrypted.CypherBlockPadding) {
                            cypherUnpaddedStream = new RangeStream_1.RangeStream(0, plainTextSize - 1, plainTextSize);
                            destStream.pipe(cypherUnpaddedStream);
                            destStream = cypherUnpaddedStream;
                        }
                        if (!isCompressionDeflate) return [3, 18];
                        inflateStream = zlib.createInflateRaw();
                        destStream.pipe(inflateStream);
                        destStream = inflateStream;
                        if (!!link.Properties.Encrypted.OriginalLength) return [3, 18];
                        debug("############### RESOURCE ENCRYPTED OVER DEFLATE, BUT NO OriginalLength!");
                        fullDeflatedBuffer = void 0;
                        _a.label = 15;
                    case 15:
                        _a.trys.push([15, 17, , 18]);
                        return [4, (0, BufferUtils_1.streamToBufferPromise)(destStream)];
                    case 16:
                        fullDeflatedBuffer = _a.sent();
                        link.Properties.Encrypted.OriginalLength = fullDeflatedBuffer.length;
                        destStream = (0, BufferUtils_1.bufferToStream)(fullDeflatedBuffer);
                        return [3, 18];
                    case 17:
                        err_5 = _a.sent();
                        debug(err_5);
                        return [3, 18];
                    case 18:
                        if (partialByteBegin < 0) {
                            partialByteBegin = 0;
                        }
                        if (partialByteEnd < 0) {
                            partialByteEnd = plainTextSize - 1;
                            if (link.Properties.Encrypted.OriginalLength) {
                                partialByteEnd = link.Properties.Encrypted.OriginalLength - 1;
                            }
                        }
                        l = link.Properties.Encrypted.OriginalLength ?
                            link.Properties.Encrypted.OriginalLength : plainTextSize;
                        if (isPartialByteRangeRequest) {
                            rangeStream = new RangeStream_1.RangeStream(partialByteBegin, partialByteEnd, l);
                            destStream.pipe(rangeStream);
                            destStream = rangeStream;
                        }
                        sal = {
                            length: l,
                            reset: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var resetedStream, err_6;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4, stream.reset()];
                                        case 1:
                                            resetedStream = _a.sent();
                                            return [3, 3];
                                        case 2:
                                            err_6 = _a.sent();
                                            debug(err_6);
                                            return [2, Promise.reject(err_6)];
                                        case 3: return [2, this.transformStream(publication, link, url, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo)];
                                    }
                                });
                            }); },
                            stream: destStream,
                        };
                        return [2, Promise.resolve(sal)];
                }
            });
        });
    };
    return TransformerLCPRaw;
}());
exports.TransformerLCPRaw = TransformerLCPRaw;
//# sourceMappingURL=transformer-lcp-raw.js.map