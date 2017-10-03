"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var zlib = require("zlib");
var RangeStream_1 = require("../../../es8-es2017/src/_utils/stream/RangeStream");
var debug_ = require("debug");
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
        if (!publication.LCP.ContentKey) {
            debug("Missing LCP content key.");
            return false;
        }
        var check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
            && link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile"
            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            debug("Incorrect resource LCP fields.");
            return false;
        }
        return true;
    };
    TransformerLCP.prototype.transformStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var contentKey, cryptoInfo, plainTextSize, cypherBlockPadding, rawDecryptStream, ivBuffer, cypherRangeStream, decryptStream, destStream, cypherUnpaddedStream, inflateStream, l, rangeStream, sal;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contentKey = publication.LCP.ContentKey;
                        plainTextSize = -1;
                        cypherBlockPadding = -1;
                        if (!(link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0)) return [3, 1];
                        plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                        cypherBlockPadding = link.Properties.Encrypted.CypherBlockPadding;
                        return [3, 4];
                    case 1: return [4, this.getDecryptedSizeStream(publication, link, stream)];
                    case 2:
                        cryptoInfo = _a.sent();
                        plainTextSize = cryptoInfo.length;
                        cypherBlockPadding = cryptoInfo.padding;
                        link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                        link.Properties.Encrypted.CypherBlockPadding = cypherBlockPadding;
                        return [4, stream.reset()];
                    case 3:
                        stream = _a.sent();
                        if (link.Properties.Encrypted.OriginalLength &&
                            link.Properties.Encrypted.Compression === "none" &&
                            link.Properties.Encrypted.OriginalLength !== plainTextSize) {
                            debug("############### " +
                                "LCP transformStream() LENGTH NOT MATCH " +
                                "link.Properties.Encrypted.OriginalLength !== plainTextSize:" +
                                (link.Properties.Encrypted.OriginalLength + " !== " + plainTextSize));
                        }
                        _a.label = 4;
                    case 4:
                        if (partialByteBegin < 0) {
                            partialByteBegin = 0;
                        }
                        if (partialByteEnd < 0) {
                            partialByteEnd = plainTextSize - 1;
                            if (link.Properties.Encrypted.OriginalLength) {
                                partialByteEnd = link.Properties.Encrypted.OriginalLength - 1;
                            }
                        }
                        if (!link.Properties.Encrypted.CypherBlockIV) return [3, 5];
                        ivBuffer = Buffer.from(link.Properties.Encrypted.CypherBlockIV, "binary");
                        cypherRangeStream = new RangeStream_1.RangeStream(AES_BLOCK_SIZE, stream.length - 1, stream.length);
                        stream.stream.pipe(cypherRangeStream);
                        rawDecryptStream = cypherRangeStream;
                        return [3, 7];
                    case 5: return [4, readStream(stream.stream, AES_BLOCK_SIZE)];
                    case 6:
                        ivBuffer = _a.sent();
                        link.Properties.Encrypted.CypherBlockIV = ivBuffer.toString("binary");
                        stream.stream.resume();
                        rawDecryptStream = stream.stream;
                        _a.label = 7;
                    case 7:
                        decryptStream = crypto.createDecipheriv("aes-256-cbc", contentKey, ivBuffer);
                        decryptStream.setAutoPadding(false);
                        rawDecryptStream.pipe(decryptStream);
                        destStream = decryptStream;
                        if (cypherBlockPadding) {
                            cypherUnpaddedStream = new RangeStream_1.RangeStream(0, plainTextSize - 1, plainTextSize);
                            destStream.pipe(cypherUnpaddedStream);
                            destStream = cypherUnpaddedStream;
                        }
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
                                var resetedStream;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, stream.reset()];
                                        case 1:
                                            resetedStream = _a.sent();
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
            var contentKey;
            return tslib_1.__generator(this, function (_a) {
                contentKey = publication.LCP.ContentKey;
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
                            var decryptStream = crypto.createDecipheriv("aes-256-cbc", contentKey, ivBuffer);
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