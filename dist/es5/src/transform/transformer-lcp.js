"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
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
    TransformerLCP.prototype.getDecryptedSizeStream = function (_publication, _link, stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var twoBlocks, readPos, rangeStream, buff, err_1, newBuff, size;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        twoBlocks = 2 * AES_BLOCK_SIZE;
                        if (stream.length < twoBlocks) {
                            return [2, 0];
                        }
                        readPos = stream.length - twoBlocks;
                        rangeStream = new RangeStream_1.RangeStream(readPos, readPos + twoBlocks - 1, stream.length);
                        stream.stream.pipe(rangeStream);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, BufferUtils_1.streamToBufferPromise(rangeStream)];
                    case 2:
                        buff = _a.sent();
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [2, 0];
                    case 4:
                        newBuff = this.innerDecrypt(buff);
                        size = stream.length - AES_BLOCK_SIZE - ((AES_BLOCK_SIZE - newBuff.length) % AES_BLOCK_SIZE);
                        return [2, Promise.resolve(size)];
                }
            });
        });
    };
    TransformerLCP.prototype.getDecryptedSizeBuffer = function (_publication, _link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var totalByteLength, twoBlocks, readPos, buff, newBuff, size;
            return tslib_1.__generator(this, function (_a) {
                totalByteLength = data.length;
                twoBlocks = 2 * AES_BLOCK_SIZE;
                if (totalByteLength < twoBlocks) {
                    return [2, 0];
                }
                readPos = totalByteLength - twoBlocks;
                buff = data.slice(readPos, readPos + twoBlocks);
                newBuff = this.innerDecrypt(buff);
                size = totalByteLength - AES_BLOCK_SIZE - ((AES_BLOCK_SIZE - newBuff.length) % AES_BLOCK_SIZE);
                return [2, size];
            });
        });
    };
    TransformerLCP.prototype.transformStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var plainTextSize, partialByteLength, blockOffset, readPosition, blocksCount, bytesInFirstBlock, padding, sizeWithoutPaddedBlock, toRead, rangeStream, buff, err_2, newBuff, bufferStream, sal;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isPartialByteRangeRequest) {
                            return [2, this.transformStream_(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd)];
                        }
                        debug("LCP transformStream() RAW STREAM LENGTH: " + stream.length);
                        plainTextSize = -1;
                        if (!(link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0)) return [3, 1];
                        plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                        return [3, 4];
                    case 1: return [4, this.getDecryptedSizeStream(publication, link, stream)];
                    case 2:
                        plainTextSize = _a.sent();
                        debug("LCP getDecryptedSizeStream(): " + plainTextSize);
                        return [4, stream.reset()];
                    case 3:
                        stream = _a.sent();
                        link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                        _a.label = 4;
                    case 4:
                        debug("LCP plainTextSize: " + plainTextSize);
                        if (partialByteBegin < 0) {
                            partialByteBegin = 0;
                        }
                        if (partialByteEnd < 0) {
                            partialByteEnd = plainTextSize;
                            if (link.Properties.Encrypted.OriginalLength) {
                                partialByteEnd = link.Properties.Encrypted.OriginalLength - 1;
                            }
                        }
                        partialByteLength = partialByteEnd - partialByteBegin;
                        blockOffset = partialByteBegin % AES_BLOCK_SIZE;
                        readPosition = partialByteBegin - blockOffset;
                        blocksCount = 1;
                        bytesInFirstBlock = (AES_BLOCK_SIZE - blockOffset) % AES_BLOCK_SIZE;
                        if (partialByteLength < bytesInFirstBlock) {
                            bytesInFirstBlock = 0;
                        }
                        if (bytesInFirstBlock > 0) {
                            blocksCount++;
                        }
                        blocksCount += (partialByteLength - bytesInFirstBlock) / AES_BLOCK_SIZE;
                        if ((partialByteLength - bytesInFirstBlock) % AES_BLOCK_SIZE !== 0) {
                            blocksCount++;
                        }
                        padding = false;
                        sizeWithoutPaddedBlock = plainTextSize - (plainTextSize % AES_BLOCK_SIZE);
                        if (partialByteEnd > sizeWithoutPaddedBlock) {
                            padding = true;
                        }
                        toRead = blocksCount * AES_BLOCK_SIZE;
                        rangeStream = new RangeStream_1.RangeStream(readPosition, readPosition + toRead - 1, stream.length);
                        stream.stream.pipe(rangeStream);
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4, BufferUtils_1.streamToBufferPromise(rangeStream)];
                    case 6:
                        buff = _a.sent();
                        return [3, 8];
                    case 7:
                        err_2 = _a.sent();
                        console.log(err_2);
                        return [2, Promise.reject("OUCH!")];
                    case 8:
                        newBuff = this.innerDecrypt(buff);
                        if (newBuff.length < partialByteLength) {
                            debug("newBuff.length < partialByteLength");
                        }
                        newBuff = newBuff.slice(blockOffset);
                        bufferStream = BufferUtils_1.bufferToStream(newBuff);
                        sal = {
                            length: newBuff.length,
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
                            stream: bufferStream,
                        };
                        return [2, Promise.resolve(sal)];
                }
            });
        });
    };
    TransformerLCP.prototype.transformStream_ = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var l, data, buff, rangeStream, bufferStream, sal, sal_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debug("LCP transformStream() RAW STREAM LENGTH: " + stream.length);
                        l = -1;
                        if (!(link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0)) return [3, 1];
                        l = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                        return [3, 4];
                    case 1: return [4, this.getDecryptedSizeStream(publication, link, stream)];
                    case 2:
                        l = _a.sent();
                        debug("LCP getDecryptedSizeStream(): " + l);
                        return [4, stream.reset()];
                    case 3:
                        stream = _a.sent();
                        link.Properties.Encrypted.DecryptedLengthBeforeInflate = l;
                        _a.label = 4;
                    case 4: return [4, BufferUtils_1.streamToBufferPromise(stream.stream)];
                    case 5:
                        data = _a.sent();
                        debug("LCP transformStream() RAW BUFFER LENGTH after reset: " + stream.length);
                        return [4, this.transformBuffer(publication, link, data)];
                    case 6:
                        buff = _a.sent();
                        debug("LCP transformStream() DECRYPTED BUFFER LENGTH: " + buff.length);
                        if (partialByteBegin < 0) {
                            partialByteBegin = 0;
                        }
                        if (partialByteEnd < 0) {
                            partialByteEnd = buff.length - 1;
                        }
                        if (isPartialByteRangeRequest) {
                            debug("LCP transformStream() PARTIAL: " + partialByteBegin + " - " + partialByteEnd);
                            rangeStream = new RangeStream_1.RangeStream(partialByteBegin, partialByteEnd, buff.length);
                            bufferStream = BufferUtils_1.bufferToStream(buff);
                            bufferStream.pipe(rangeStream);
                            sal = {
                                length: buff.length,
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
                                stream: rangeStream,
                            };
                            return [2, Promise.resolve(sal)];
                        }
                        else {
                            debug("LCP transformStream() WHOLE: " + buff.length);
                            sal_1 = {
                                length: buff.length,
                                reset: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    return tslib_1.__generator(this, function (_a) {
                                        return [2, Promise.resolve(sal_1)];
                                    });
                                }); },
                                stream: BufferUtils_1.bufferToStream(buff),
                            };
                            return [2, Promise.resolve(sal_1)];
                        }
                        return [2];
                }
            });
        });
    };
    TransformerLCP.prototype.innerDecrypt = function (data) {
        var iv = data.slice(0, AES_BLOCK_SIZE).toString("binary");
        var toDecrypt = forge.util.createBuffer(data.slice(AES_BLOCK_SIZE).toString("binary"), "binary");
        var aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", this.contentKey);
        aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        aesCbcDecipher.finish();
        var decryptedZipData = aesCbcDecipher.output.bytes();
        return new Buffer(decryptedZipData, "binary");
    };
    TransformerLCP.prototype.transformBuffer = function (_publication, link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transformedData, l;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transformedData = this.innerDecrypt(data);
                        debug("LCP transformBuffer() decrypted buffer length: " + transformedData.length);
                        return [4, this.getDecryptedSizeBuffer(_publication, link, data)];
                    case 1:
                        l = _a.sent();
                        debug("LCP transformBuffer() decrypted buffer length CHECK: " + l);
                        if (link.Properties.Encrypted.Compression === "deflate") {
                            transformedData = zlib.inflateRawSync(transformedData);
                        }
                        debug("LCP transformBuffer() decrypted buffer length after INFLATE: " + transformedData.length);
                        if (link.Properties.Encrypted.OriginalLength
                            && link.Properties.Encrypted.OriginalLength !== transformedData.length) {
                            debug("LENGTH NOT MATCH " + link.Properties.Encrypted.OriginalLength + " !== " + transformedData.length);
                        }
                        return [2, Promise.resolve(transformedData)];
                }
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