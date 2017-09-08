"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
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
            var plainTextSize, timeBegin, timeElapsed, partialByteLength, padding, sizeWithoutPaddedBlock, blockOffset, readPosition, blocksCount, bytesInFirstBlock, diff, inc, rem, toRead, readPositionEND, decryptStreamStreamBegin, decryptStreamStreamEnd, decryptStreamBlockOffset, decryptStreamBytesReceived, decryptStreamFinished, decryptStreamClosed, decryptStreamFirst, decryptStreamThis, decryptStreamBuffers, TWO_AES_BLOCK_SIZE, decryptStream, destStream, inflateStream, sal;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plainTextSize = -1;
                        if (!(link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0)) return [3, 1];
                        plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
                        return [3, 4];
                    case 1:
                        timeBegin = process.hrtime();
                        return [4, this.getDecryptedSizeStream(publication, link, stream)];
                    case 2:
                        plainTextSize = _a.sent();
                        debug("LCP transformStream() ---- getDecryptedSizeStream(): " + plainTextSize);
                        return [4, stream.reset()];
                    case 3:
                        stream = _a.sent();
                        link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
                        timeElapsed = process.hrtime(timeBegin);
                        debug("LCP transformStream() ---- getDecryptedSizeStream():" +
                            (timeElapsed[0] + " seconds + " + timeElapsed[1] + " nanoseconds"));
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
                        partialByteLength = (partialByteEnd + 1) - partialByteBegin;
                        padding = false;
                        sizeWithoutPaddedBlock = plainTextSize - (plainTextSize % AES_BLOCK_SIZE);
                        if ((partialByteEnd + 1) > sizeWithoutPaddedBlock) {
                            padding = true;
                        }
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
                        diff = partialByteLength - bytesInFirstBlock;
                        inc = diff / AES_BLOCK_SIZE;
                        inc = Math.floor(inc);
                        blocksCount += inc;
                        rem = diff % AES_BLOCK_SIZE;
                        if (rem !== 0) {
                            blocksCount++;
                        }
                        toRead = blocksCount * AES_BLOCK_SIZE;
                        readPositionEND = readPosition + toRead - 1;
                        decryptStreamStreamBegin = readPosition;
                        decryptStreamStreamEnd = readPositionEND;
                        decryptStreamBlockOffset = blockOffset;
                        decryptStreamBytesReceived = 0;
                        decryptStreamFinished = false;
                        decryptStreamClosed = false;
                        decryptStreamFirst = true;
                        decryptStreamThis = this;
                        decryptStreamBuffers = [];
                        TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
                        decryptStream = new stream_1.Transform({
                            flush: function (callback) {
                                debug("LcpDecryptStream FLUSH");
                                var toDecrypt;
                                var decryptStreamBuffersTotalLength = 0;
                                decryptStreamBuffers.forEach(function (buff) {
                                    decryptStreamBuffersTotalLength += buff.length;
                                });
                                if (decryptStreamBuffersTotalLength) {
                                    var available = decryptStreamBuffersTotalLength;
                                    if (available === TWO_AES_BLOCK_SIZE) {
                                        toDecrypt = Buffer.concat(decryptStreamBuffers);
                                        decryptStreamBuffers = [];
                                    }
                                    else if (available < TWO_AES_BLOCK_SIZE) {
                                        debug("LcpDecryptStream NOT ENOUGH DATA????");
                                    }
                                    else {
                                        var decryptStreamBuffersConcat = Buffer.concat(decryptStreamBuffers);
                                        decryptStreamBuffers = [];
                                        var nBlocks = Math.floor(decryptStreamBuffersConcat.length / AES_BLOCK_SIZE);
                                        var blocksBytes = nBlocks * AES_BLOCK_SIZE;
                                        if (blocksBytes === decryptStreamBuffersConcat.length) {
                                            toDecrypt = decryptStreamBuffersConcat;
                                        }
                                        else {
                                            debug("LcpDecryptStream OVERFLOW DATA????");
                                        }
                                    }
                                }
                                if (toDecrypt) {
                                    var newBuff = decryptStreamThis.innerDecrypt(toDecrypt, padding);
                                    if (decryptStreamFirst) {
                                        decryptStreamFirst = false;
                                        newBuff = newBuff.slice(decryptStreamBlockOffset);
                                    }
                                    this.push(newBuff);
                                }
                                callback();
                            },
                            transform: function (chunk, _encoding, callback) {
                                decryptStreamBytesReceived += chunk.length;
                                if (decryptStreamFinished) {
                                    if (!decryptStreamClosed) {
                                        debug("???? LcpDecryptStream CLOSING...");
                                        decryptStreamClosed = true;
                                        this.push(null);
                                    }
                                    else {
                                        debug("???? LcpDecryptStream STILL PIPE CALLING _transform ??!");
                                        this.end();
                                    }
                                }
                                else {
                                    if (decryptStreamBytesReceived > decryptStreamStreamBegin) {
                                        var chunkBegin = 0;
                                        var chunkEnd = chunk.length - 1;
                                        chunkBegin = decryptStreamStreamBegin - (decryptStreamBytesReceived - chunk.length);
                                        if (chunkBegin < 0) {
                                            chunkBegin = 0;
                                        }
                                        if (decryptStreamBytesReceived > decryptStreamStreamEnd) {
                                            decryptStreamFinished = true;
                                            chunkEnd = chunk.length - (decryptStreamBytesReceived - decryptStreamStreamEnd);
                                        }
                                        var encryptedChunk = chunk.slice(chunkBegin, chunkEnd + 1);
                                        var toDecrypt = void 0;
                                        var decryptStreamBuffersTotalLength_1 = 0;
                                        decryptStreamBuffers.forEach(function (buff) {
                                            decryptStreamBuffersTotalLength_1 += buff.length;
                                        });
                                        if (decryptStreamBuffersTotalLength_1) {
                                            var available = decryptStreamBuffersTotalLength_1 + encryptedChunk.length;
                                            if (available === TWO_AES_BLOCK_SIZE) {
                                                decryptStreamBuffers.push(encryptedChunk);
                                                toDecrypt = Buffer.concat(decryptStreamBuffers);
                                                decryptStreamBuffers = [];
                                            }
                                            else if (available < TWO_AES_BLOCK_SIZE) {
                                                decryptStreamBuffers.push(encryptedChunk);
                                            }
                                            else {
                                                decryptStreamBuffers.push(encryptedChunk);
                                                var decryptStreamBuffersConcat = Buffer.concat(decryptStreamBuffers);
                                                decryptStreamBuffers = [];
                                                var nBlocks = Math.floor(decryptStreamBuffersConcat.length / AES_BLOCK_SIZE);
                                                var blocksBytes = nBlocks * AES_BLOCK_SIZE;
                                                if (blocksBytes === decryptStreamBuffersConcat.length) {
                                                    toDecrypt = decryptStreamBuffersConcat;
                                                }
                                                else {
                                                    toDecrypt = decryptStreamBuffersConcat.slice(0, blocksBytes);
                                                    decryptStreamBuffers.push(decryptStreamBuffersConcat.slice(blocksBytes));
                                                }
                                            }
                                        }
                                        else {
                                            if (encryptedChunk.length === TWO_AES_BLOCK_SIZE) {
                                                toDecrypt = encryptedChunk;
                                            }
                                            else if (encryptedChunk.length < TWO_AES_BLOCK_SIZE) {
                                                decryptStreamBuffers.push(encryptedChunk);
                                            }
                                            else {
                                                var nBlocks = Math.floor(encryptedChunk.length / AES_BLOCK_SIZE);
                                                var blocksBytes = nBlocks * AES_BLOCK_SIZE;
                                                if (blocksBytes === encryptedChunk.length) {
                                                    toDecrypt = encryptedChunk;
                                                }
                                                else {
                                                    toDecrypt = encryptedChunk.slice(0, blocksBytes);
                                                    decryptStreamBuffers.push(encryptedChunk.slice(blocksBytes));
                                                }
                                            }
                                        }
                                        if (toDecrypt) {
                                            var newBuff = decryptStreamThis.innerDecrypt(toDecrypt, decryptStreamFinished ? padding : false);
                                            if (decryptStreamFirst) {
                                                decryptStreamFirst = false;
                                                newBuff = newBuff.slice(decryptStreamBlockOffset);
                                            }
                                            this.push(newBuff);
                                        }
                                        if (decryptStreamFinished) {
                                            debug("LcpDecryptStream FINISHING...");
                                            decryptStreamClosed = true;
                                            this.push(null);
                                            this.end();
                                        }
                                    }
                                    else {
                                    }
                                }
                                callback();
                            },
                        });
                        stream.stream.pipe(decryptStream);
                        destStream = decryptStream;
                        if (link.Properties.Encrypted.Compression === "deflate") {
                            inflateStream = zlib.createInflateRaw();
                            decryptStream.pipe(inflateStream);
                            destStream = inflateStream;
                        }
                        sal = {
                            length: plainTextSize,
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
            var TWO_AES_BLOCK_SIZE, readPos, rangeStream, buff, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
                        if (stream.length < TWO_AES_BLOCK_SIZE) {
                            return [2, 0];
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
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [2, 0];
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
            var newBuff, nPaddingBytes, size;
            return tslib_1.__generator(this, function (_a) {
                newBuff = this.innerDecrypt(buff, true);
                nPaddingBytes = AES_BLOCK_SIZE - newBuff.length;
                size = totalByteLength - AES_BLOCK_SIZE - nPaddingBytes;
                return [2, Promise.resolve(size)];
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