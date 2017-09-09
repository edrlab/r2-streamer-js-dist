"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var zlib = require("zlib");
var BufferUtils_1 = require("../../../es8-es2017/src/_utils/stream/BufferUtils");
var RangeStream_1 = require("../../../es8-es2017/src/_utils/stream/RangeStream");
var debug_ = require("debug");
var forge = require("node-forge");
var debug = debug_("r2:transformer:lcp");
var AES_BLOCK_SIZE = 16;
var TransformerLCP = (function () {
    function TransformerLCP() {
    }
    TransformerLCP.prototype.supports = function (publication, link) {
        var check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
            && link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile"
            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            return false;
        }
        var lcpPass = publication.Internal.find(function (i) {
            if (i.Name === "lcp_user_pass") {
                return true;
            }
            return false;
        });
        var lcpPassHash = lcpPass ? lcpPass.Value : undefined;
        if (!lcpPassHash) {
            debug("LCP missing key.");
            return false;
        }
        this.contentKey = this.UpdateLCP(publication, lcpPassHash);
        return true;
    };
    TransformerLCP.prototype.transformStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var cryptoInfo, plainTextSize, cypherBlockPadding, ivBuffer, ivRangeStream, err_1, cypherRangeStream, decryptStream, destStream, cypherUnpaddedStream, inflateStream, l, rangeStream, sal;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        return [3, 11];
                    case 5:
                        ivRangeStream = new RangeStream_1.RangeStream(0, AES_BLOCK_SIZE - 1, stream.length);
                        stream.stream.pipe(ivRangeStream);
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4, BufferUtils_1.streamToBufferPromise(ivRangeStream)];
                    case 7:
                        ivBuffer = _a.sent();
                        return [3, 9];
                    case 8:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [2, Promise.reject("OUCH!")];
                    case 9: return [4, stream.reset()];
                    case 10:
                        stream = _a.sent();
                        link.Properties.Encrypted.CypherBlockIV = ivBuffer.toString("binary");
                        _a.label = 11;
                    case 11:
                        cypherRangeStream = new RangeStream_1.RangeStream(AES_BLOCK_SIZE, stream.length - 1, stream.length);
                        stream.stream.pipe(cypherRangeStream);
                        decryptStream = crypto.createDecipheriv("aes-256-cbc", new Buffer(this.contentKey, "binary"), ivBuffer);
                        decryptStream.setAutoPadding(false);
                        cypherRangeStream.pipe(decryptStream);
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
    TransformerLCP.prototype.getDecryptedSizeStream = function (_publication, _link, stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var TWO_AES_BLOCK_SIZE, readPos, rangeStream, buff, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
                        if (stream.length < TWO_AES_BLOCK_SIZE) {
                            return [2, Promise.reject("crypto err")];
                        }
                        readPos = stream.length - TWO_AES_BLOCK_SIZE;
                        rangeStream = new RangeStream_1.RangeStream(readPos, readPos + TWO_AES_BLOCK_SIZE - 1, stream.length);
                        stream.stream.pipe(rangeStream);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, BufferUtils_1.streamToBufferPromise(rangeStream)];
                    case 2:
                        buff = _a.sent();
                        return [3, 4];
                    case 3:
                        err_2 = _a.sent();
                        console.log(err_2);
                        return [2, Promise.reject("crypto err")];
                    case 4: return [2, this.getDecryptedSizeBuffer_(stream.length, buff)];
                }
            });
        });
    };
    TransformerLCP.prototype.innerDecrypt = function (data, padding) {
        var buffIV = data.slice(0, AES_BLOCK_SIZE);
        var iv = buffIV.toString("binary");
        var buffToDecrypt = data.slice(AES_BLOCK_SIZE);
        var strToDecrypt = buffToDecrypt.toString("binary");
        var toDecrypt = forge.util.createBuffer(strToDecrypt, "binary");
        var aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", this.contentKey);
        aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        function unpadFunc() { return false; }
        aesCbcDecipher.finish(padding ? undefined : unpadFunc);
        var decryptedZipData = aesCbcDecipher.output.bytes();
        var buff = new Buffer(decryptedZipData, "binary");
        return buff;
    };
    TransformerLCP.prototype.getDecryptedSizeBuffer_ = function (totalByteLength, buff) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var newBuff, nPaddingBytes, size, res;
            return tslib_1.__generator(this, function (_a) {
                newBuff = this.innerDecrypt(buff, true);
                nPaddingBytes = AES_BLOCK_SIZE - newBuff.length;
                size = totalByteLength - AES_BLOCK_SIZE - nPaddingBytes;
                res = {
                    length: size,
                    padding: nPaddingBytes,
                };
                return [2, Promise.resolve(res)];
            });
        });
    };
    TransformerLCP.prototype.UpdateLCP = function (publication, lcpPassHash) {
        if (!publication.LCP) {
            return undefined;
        }
        var userKey = forge.util.hexToBytes(lcpPassHash);
        if (userKey
            && publication.LCP.Encryption.UserKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#sha256"
            && publication.LCP.Encryption.Profile === "http://readium.org/lcp/basic-profile"
            && publication.LCP.Encryption.ContentKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc") {
            try {
                var keyCheck = new Buffer(publication.LCP.Encryption.UserKey.KeyCheck, "base64").toString("binary");
                var encryptedLicenseID = keyCheck;
                var iv = encryptedLicenseID.substring(0, AES_BLOCK_SIZE);
                var toDecrypt = forge.util.createBuffer(encryptedLicenseID.substring(AES_BLOCK_SIZE), "binary");
                var aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", userKey);
                aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
                aesCbcDecipher.update(toDecrypt);
                aesCbcDecipher.finish();
                if (publication.LCP.ID === aesCbcDecipher.output.toString()) {
                    var encryptedContentKey = new Buffer(publication.LCP.Encryption.ContentKey.EncryptedValue, "base64").toString("binary");
                    var iv2 = encryptedContentKey.substring(0, AES_BLOCK_SIZE);
                    var toDecrypt2 = forge.util.createBuffer(encryptedContentKey.substring(AES_BLOCK_SIZE), "binary");
                    var aesCbcDecipher2 = forge.cipher.createDecipher("AES-CBC", userKey);
                    aesCbcDecipher2.start({ iv: iv2, additionalData_: "binary-encoded string" });
                    aesCbcDecipher2.update(toDecrypt2);
                    aesCbcDecipher2.finish();
                    var contentKey = aesCbcDecipher2.output.bytes();
                    return contentKey;
                }
            }
            catch (err) {
                console.log("LCP error! " + err);
            }
        }
        return undefined;
    };
    return TransformerLCP;
}());
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map