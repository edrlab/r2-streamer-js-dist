"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
var debug_ = require("debug");
var forge = require("node-forge");
var transformer_lcp_1 = require("./transformer-lcp");
var debug = debug_("r2:transformer:lcp");
var debugx = debug_("r2:transformer:stream:lcp");
var AES_BLOCK_SIZE = 16;
var TransformerLCPAlt = (function (_super) {
    tslib_1.__extends(TransformerLCPAlt, _super);
    function TransformerLCPAlt() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TransformerLCPAlt.prototype.transformStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var cryptoInfo, plainTextSize, cypherBlockPadding, partialByteLength, padding, sizeWithoutPaddedBlock, blockOffset, readPosition, blocksCount, bytesInFirstBlock, diff, inc, rem, toRead, readPositionEND, decryptStreamStreamBegin, decryptStreamStreamEnd, decryptStreamBlockOffset, decryptStreamBytesReceived, decryptStreamBytesSent, decryptStreamFinished, decryptStreamClosed, decryptStreamFirst, decryptStreamThis, decryptStreamBuffers, TWO_AES_BLOCK_SIZE, decryptStream, l, sal;
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
                        decryptStreamBytesSent = 0;
                        decryptStreamFinished = false;
                        decryptStreamClosed = false;
                        decryptStreamFirst = true;
                        decryptStreamThis = this;
                        decryptStreamBuffers = [];
                        TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
                        decryptStream = new stream_1.Transform({
                            flush: function (callback) {
                                debugx("LcpDecryptStream FLUSH");
                                var toDecrypt;
                                var decryptStreamBuffersTotalLength = 0;
                                decryptStreamBuffers.forEach(function (buff) {
                                    decryptStreamBuffersTotalLength += buff.length;
                                });
                                if (decryptStreamBuffersTotalLength) {
                                    debugx("LcpDecryptStream FLUSH decryptStreamBuffersTotalLength: " +
                                        decryptStreamBuffersTotalLength);
                                    var available = decryptStreamBuffersTotalLength;
                                    if (available === TWO_AES_BLOCK_SIZE) {
                                        toDecrypt = Buffer.concat(decryptStreamBuffers);
                                        decryptStreamBuffers = [];
                                    }
                                    else if (available < TWO_AES_BLOCK_SIZE) {
                                        debugx("LcpDecryptStream NOT ENOUGH DATA????");
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
                                            debugx("LcpDecryptStream OVERFLOW DATA????");
                                        }
                                    }
                                }
                                if (toDecrypt) {
                                    var newBuff = decryptStreamThis.innerDecrypt(publication, link, toDecrypt, padding);
                                    if (decryptStreamFirst) {
                                        decryptStreamFirst = false;
                                        newBuff = newBuff.slice(decryptStreamBlockOffset);
                                    }
                                    decryptStreamBytesSent += newBuff.length;
                                    debugx("LcpDecryptStream FLUSH decryptStreamBytesSent: " + decryptStreamBytesSent);
                                    this.push(newBuff);
                                }
                                if (decryptStreamBytesSent !== plainTextSize) {
                                    debugx("############### " +
                                        "LcpDecryptStream FLUSH  LENGTH NOT MATCH " +
                                        "decryptStreamBytesSent !== plainTextSize:" +
                                        ("[ " + decryptStreamStreamBegin + " (" + decryptStreamStreamEnd + ") ] ") +
                                        (decryptStreamBytesReceived + " (" + stream.length + ") > ") +
                                        (decryptStreamBytesSent + " !== " + plainTextSize));
                                }
                                callback();
                            },
                            transform: function (chunk, _encoding, callback) {
                                decryptStreamBytesReceived += chunk.length;
                                debugx("TRANSFORM chunk.length: " + chunk.length + " (( " + decryptStreamBytesReceived);
                                if (decryptStreamFinished) {
                                    if (!decryptStreamClosed) {
                                        debugx("???? LcpDecryptStream CLOSING...");
                                        decryptStreamClosed = true;
                                        this.push(null);
                                    }
                                    else {
                                        debugx("???? LcpDecryptStream STILL PIPE CALLING _transform ??!");
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
                                            var decr = decryptStreamBytesReceived - decryptStreamStreamEnd;
                                            debugx("LcpDecryptStream TRANSFORM FINISH decr: " + decr);
                                            chunkEnd = chunk.length - decr;
                                        }
                                        debugx("CHUNK: " + chunkBegin + "-" + chunkEnd + "/" + chunk.length);
                                        var encryptedChunk = chunk.slice(chunkBegin, chunkEnd + 1);
                                        var toDecrypt = void 0;
                                        var decryptStreamBuffersTotalLength_1 = 0;
                                        decryptStreamBuffers.forEach(function (buff) {
                                            decryptStreamBuffersTotalLength_1 += buff.length;
                                        });
                                        if (decryptStreamBuffersTotalLength_1) {
                                            debugx("LcpDecryptStream TRANSFORM decryptStreamBuffersTotalLength: " +
                                                decryptStreamBuffersTotalLength_1);
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
                                            debugx("CHUNK TO DECRYPT: " + toDecrypt.length);
                                            var newBuff = decryptStreamThis.innerDecrypt(publication, link, toDecrypt, decryptStreamFinished ? padding : false);
                                            debugx("CHUNK DECRYPTED: " + newBuff.length);
                                            if (decryptStreamFirst) {
                                                decryptStreamFirst = false;
                                                debugx("LcpDecryptStream TRANSFORM decryptStreamBlockOffset: " +
                                                    decryptStreamBlockOffset);
                                                newBuff = newBuff.slice(decryptStreamBlockOffset);
                                            }
                                            decryptStreamBytesSent += newBuff.length;
                                            debugx("LcpDecryptStream TRANSFORM decryptStreamBytesSent: " + decryptStreamBytesSent);
                                            this.push(newBuff);
                                        }
                                        if (decryptStreamFinished) {
                                            debugx("LcpDecryptStream FINISHING...");
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
                        l = link.Properties.Encrypted.OriginalLength ?
                            link.Properties.Encrypted.OriginalLength : plainTextSize;
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
                            stream: decryptStream,
                        };
                        return [2, Promise.resolve(sal)];
                }
            });
        });
    };
    TransformerLCPAlt.prototype.innerDecrypt = function (publication, _link, data, padding) {
        var contentKey = publication.LCP.ContentKey;
        var buffIV = data.slice(0, AES_BLOCK_SIZE);
        var iv = buffIV.toString("binary");
        var buffToDecrypt = data.slice(AES_BLOCK_SIZE);
        var strToDecrypt = buffToDecrypt.toString("binary");
        var toDecrypt = forge.util.createBuffer(strToDecrypt, "binary");
        var aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", contentKey);
        aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        function unpadFunc() { return false; }
        aesCbcDecipher.finish(padding ? undefined : unpadFunc);
        var decryptedZipData = aesCbcDecipher.output.bytes();
        var buff = new Buffer(decryptedZipData, "binary");
        return buff;
    };
    return TransformerLCPAlt;
}(transformer_lcp_1.TransformerLCP));
exports.TransformerLCPAlt = TransformerLCPAlt;
//# sourceMappingURL=transformer-lcp-alt.js.map