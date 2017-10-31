"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var zlib = require("zlib");
var RangeStream_1 = require("../_utils/stream/RangeStream");
var debug_ = require("debug");
var BufferUtils_1 = require("../_utils/stream/BufferUtils");
var debug = debug_("r2:transformer:lcp");
var AES_BLOCK_SIZE = 16;
var readStream = function (s, n) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
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
var TransformerLCP = (function () {
    function TransformerLCP() {
    }
    TransformerLCP.prototype.supports = function (publication, link) {
        if (!publication.LCP) {
            return false;
        }
        if (!publication.LCP.isReady()) {
            debug("LCP not ready!");
            return false;
        }
        var check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
            && (link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile" ||
                link.Properties.Encrypted.Profile === "http://readium.org/lcp/profile-1.0")
            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            debug("Incorrect resource LCP fields.");
            debug(link.Properties.Encrypted.Scheme);
            debug(link.Properties.Encrypted.Profile);
            debug(link.Properties.Encrypted.Algorithm);
            return false;
        }
        return true;
    };
    TransformerLCP.prototype.transformStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var plainTextSize, nativelyDecryptedStream, fullEncryptedBuffer, err_1, nativelyDecryptedBuffer, err_2, cryptoInfo, cypherBlockPadding, err_3, err_4, destStream, rawDecryptStream, ivBuffer, cypherRangeStream, err_5, decryptStream, cypherUnpaddedStream, inflateStream, l, rangeStream, sal;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plainTextSize = -1;
                        if (!publication.LCP.isNativeNodePlugin()) return [3, 9];
                        debug("DECRYPT: " + link.Href);
                        fullEncryptedBuffer = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, BufferUtils_1.streamToBufferPromise(stream.stream)];
                    case 2:
                        fullEncryptedBuffer = _a.sent();
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        debug(err_1);
                        return [2, Promise.reject("OUCH!")];
                    case 4:
                        nativelyDecryptedBuffer = void 0;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4, publication.LCP.decrypt(fullEncryptedBuffer)];
                    case 6:
                        nativelyDecryptedBuffer = _a.sent();
                        return [3, 8];
                    case 7:
                        err_2 = _a.sent();
                        debug(err_2);
                        return [2, Promise.reject("OUCH!")];
                    case 8:
                        plainTextSize = nativelyDecryptedBuffer.length;
                        link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                        if (link.Properties.Encrypted.OriginalLength &&
                            link.Properties.Encrypted.Compression === "none" &&
                            link.Properties.Encrypted.OriginalLength !== plainTextSize) {
                            debug("############### " +
                                "LCP transformStream() LENGTH NOT MATCH " +
                                "link.Properties.Encrypted.OriginalLength !== plainTextSize: " +
                                (link.Properties.Encrypted.OriginalLength + " !== " + plainTextSize));
                        }
                        nativelyDecryptedStream = BufferUtils_1.bufferToStream(nativelyDecryptedBuffer);
                        return [3, 18];
                    case 9:
                        cryptoInfo = void 0;
                        cypherBlockPadding = -1;
                        if (!(link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0)) return [3, 10];
                        plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                        cypherBlockPadding = link.Properties.Encrypted.CypherBlockPadding;
                        return [3, 18];
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4, this.getDecryptedSizeStream(publication, link, stream)];
                    case 11:
                        cryptoInfo = _a.sent();
                        return [3, 13];
                    case 12:
                        err_3 = _a.sent();
                        debug(err_3);
                        return [2, Promise.reject(err_3)];
                    case 13:
                        plainTextSize = cryptoInfo.length;
                        cypherBlockPadding = cryptoInfo.padding;
                        link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                        link.Properties.Encrypted.CypherBlockPadding = cypherBlockPadding;
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 16, , 17]);
                        return [4, stream.reset()];
                    case 15:
                        stream = _a.sent();
                        return [3, 17];
                    case 16:
                        err_4 = _a.sent();
                        debug(err_4);
                        return [2, Promise.reject(err_4)];
                    case 17:
                        if (link.Properties.Encrypted.OriginalLength &&
                            link.Properties.Encrypted.Compression === "none" &&
                            link.Properties.Encrypted.OriginalLength !== plainTextSize) {
                            debug("############### " +
                                "LCP transformStream() LENGTH NOT MATCH " +
                                "link.Properties.Encrypted.OriginalLength !== plainTextSize: " +
                                (link.Properties.Encrypted.OriginalLength + " !== " + plainTextSize));
                        }
                        _a.label = 18;
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
                        if (!nativelyDecryptedStream) return [3, 19];
                        destStream = nativelyDecryptedStream;
                        return [3, 25];
                    case 19:
                        rawDecryptStream = void 0;
                        ivBuffer = void 0;
                        if (!link.Properties.Encrypted.CypherBlockIV) return [3, 20];
                        ivBuffer = Buffer.from(link.Properties.Encrypted.CypherBlockIV, "binary");
                        cypherRangeStream = new RangeStream_1.RangeStream(AES_BLOCK_SIZE, stream.length - 1, stream.length);
                        stream.stream.pipe(cypherRangeStream);
                        rawDecryptStream = cypherRangeStream;
                        return [3, 24];
                    case 20:
                        _a.trys.push([20, 22, , 23]);
                        return [4, readStream(stream.stream, AES_BLOCK_SIZE)];
                    case 21:
                        ivBuffer = _a.sent();
                        return [3, 23];
                    case 22:
                        err_5 = _a.sent();
                        debug(err_5);
                        return [2, Promise.reject(err_5)];
                    case 23:
                        link.Properties.Encrypted.CypherBlockIV = ivBuffer.toString("binary");
                        stream.stream.resume();
                        rawDecryptStream = stream.stream;
                        _a.label = 24;
                    case 24:
                        decryptStream = crypto.createDecipheriv("aes-256-cbc", publication.LCP.ContentKey, ivBuffer);
                        decryptStream.setAutoPadding(false);
                        rawDecryptStream.pipe(decryptStream);
                        destStream = decryptStream;
                        if (link.Properties.Encrypted.CypherBlockPadding) {
                            cypherUnpaddedStream = new RangeStream_1.RangeStream(0, plainTextSize - 1, plainTextSize);
                            destStream.pipe(cypherUnpaddedStream);
                            destStream = cypherUnpaddedStream;
                        }
                        _a.label = 25;
                    case 25:
                        if (link.Properties.Encrypted.Compression === "deflate") {
                            inflateStream = zlib.createInflateRaw();
                            destStream.pipe(inflateStream);
                            destStream = inflateStream;
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
                                        case 3:
                                            if (!resetedStream) {
                                                return [2, Promise.reject("??")];
                                            }
                                            return [2, this.transformStream(publication, link, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd)];
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
    TransformerLCP.prototype.getDecryptedSizeStream = function (publication, _link, stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
                        if (stream.length < TWO_AES_BLOCK_SIZE) {
                            reject("crypto err");
                            return;
                        }
                        var readPos = stream.length - TWO_AES_BLOCK_SIZE;
                        var cypherRangeStream = new RangeStream_1.RangeStream(readPos, readPos + TWO_AES_BLOCK_SIZE - 1, stream.length);
                        stream.stream.pipe(cypherRangeStream);
                        var decrypteds = [];
                        cypherRangeStream.on("readable", function () {
                            var ivBuffer = cypherRangeStream.read(AES_BLOCK_SIZE);
                            if (!ivBuffer) {
                                return;
                            }
                            var encrypted = cypherRangeStream.read(AES_BLOCK_SIZE);
                            var decryptStream = crypto.createDecipheriv("aes-256-cbc", publication.LCP.ContentKey, ivBuffer);
                            decryptStream.setAutoPadding(false);
                            var buff1 = decryptStream.update(encrypted);
                            if (buff1) {
                                decrypteds.push(buff1);
                            }
                            var buff2 = decryptStream.final();
                            if (buff2) {
                                decrypteds.push(buff2);
                            }
                        });
                        cypherRangeStream.on("end", function () {
                            var decrypted = Buffer.concat(decrypteds);
                            var nPaddingBytes = decrypted[AES_BLOCK_SIZE - 1];
                            var size = stream.length - AES_BLOCK_SIZE - nPaddingBytes;
                            var res = {
                                length: size,
                                padding: nPaddingBytes,
                            };
                            resolve(res);
                        });
                        cypherRangeStream.on("error", function () {
                            reject("DECRYPT err");
                        });
                    })];
            });
        });
    };
    return TransformerLCP;
}());
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map