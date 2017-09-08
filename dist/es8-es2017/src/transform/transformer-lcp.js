"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const zlib = require("zlib");
const BufferUtils_1 = require("../_utils/stream/BufferUtils");
const RangeStream_1 = require("../_utils/stream/RangeStream");
const debug_ = require("debug");
const forge = require("node-forge");
const debug = debug_("r2:transformer:lcp");
const AES_BLOCK_SIZE = 16;
class TransformerLCP {
    supports(publication, link) {
        const check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
            && link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile"
            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            return false;
        }
        const lcpPass = publication.Internal.find((i) => {
            if (i.Name === "lcp_user_pass") {
                return true;
            }
            return false;
        });
        const lcpPassHash = lcpPass ? lcpPass.Value : undefined;
        if (!lcpPassHash) {
            debug("LCP missing key.");
            return false;
        }
        this.contentKey = this.UpdateLCP(publication, lcpPassHash);
        return true;
    }
    async transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        let plainTextSize = -1;
        if (link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0) {
            plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
        }
        else {
            const timeBegin = process.hrtime();
            plainTextSize = await this.getDecryptedSizeStream(publication, link, stream);
            debug("LCP transformStream() ---- getDecryptedSizeStream(): " + plainTextSize);
            stream = await stream.reset();
            link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
            const timeElapsed = process.hrtime(timeBegin);
            debug(`LCP transformStream() ---- getDecryptedSizeStream():` +
                `${timeElapsed[0]} seconds + ${timeElapsed[1]} nanoseconds`);
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
        const partialByteLength = (partialByteEnd + 1) - partialByteBegin;
        let padding = false;
        const sizeWithoutPaddedBlock = plainTextSize - (plainTextSize % AES_BLOCK_SIZE);
        if ((partialByteEnd + 1) > sizeWithoutPaddedBlock) {
            padding = true;
        }
        const blockOffset = partialByteBegin % AES_BLOCK_SIZE;
        const readPosition = partialByteBegin - blockOffset;
        let blocksCount = 1;
        let bytesInFirstBlock = (AES_BLOCK_SIZE - blockOffset) % AES_BLOCK_SIZE;
        if (partialByteLength < bytesInFirstBlock) {
            bytesInFirstBlock = 0;
        }
        if (bytesInFirstBlock > 0) {
            blocksCount++;
        }
        const diff = partialByteLength - bytesInFirstBlock;
        let inc = diff / AES_BLOCK_SIZE;
        inc = Math.floor(inc);
        blocksCount += inc;
        const rem = diff % AES_BLOCK_SIZE;
        if (rem !== 0) {
            blocksCount++;
        }
        const toRead = blocksCount * AES_BLOCK_SIZE;
        const readPositionEND = readPosition + toRead - 1;
        const decryptStreamStreamBegin = readPosition;
        const decryptStreamStreamEnd = readPositionEND;
        const decryptStreamBlockOffset = blockOffset;
        let decryptStreamBytesReceived = 0;
        let decryptStreamFinished = false;
        let decryptStreamClosed = false;
        let decryptStreamFirst = true;
        const decryptStreamThis = this;
        let decryptStreamBuffers = [];
        const TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
        const decryptStream = new stream_1.Transform({
            flush(callback) {
                debug("LcpDecryptStream FLUSH");
                let toDecrypt;
                let decryptStreamBuffersTotalLength = 0;
                decryptStreamBuffers.forEach((buff) => {
                    decryptStreamBuffersTotalLength += buff.length;
                });
                if (decryptStreamBuffersTotalLength) {
                    const available = decryptStreamBuffersTotalLength;
                    if (available === TWO_AES_BLOCK_SIZE) {
                        toDecrypt = Buffer.concat(decryptStreamBuffers);
                        decryptStreamBuffers = [];
                    }
                    else if (available < TWO_AES_BLOCK_SIZE) {
                        debug("LcpDecryptStream NOT ENOUGH DATA????");
                    }
                    else {
                        const decryptStreamBuffersConcat = Buffer.concat(decryptStreamBuffers);
                        decryptStreamBuffers = [];
                        const nBlocks = Math.floor(decryptStreamBuffersConcat.length / AES_BLOCK_SIZE);
                        const blocksBytes = nBlocks * AES_BLOCK_SIZE;
                        if (blocksBytes === decryptStreamBuffersConcat.length) {
                            toDecrypt = decryptStreamBuffersConcat;
                        }
                        else {
                            debug("LcpDecryptStream OVERFLOW DATA????");
                        }
                    }
                }
                if (toDecrypt) {
                    let newBuff = decryptStreamThis.innerDecrypt(toDecrypt, padding);
                    if (decryptStreamFirst) {
                        decryptStreamFirst = false;
                        newBuff = newBuff.slice(decryptStreamBlockOffset);
                    }
                    this.push(newBuff);
                }
                callback();
            },
            transform(chunk, _encoding, callback) {
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
                        let chunkBegin = 0;
                        let chunkEnd = chunk.length - 1;
                        chunkBegin = decryptStreamStreamBegin - (decryptStreamBytesReceived - chunk.length);
                        if (chunkBegin < 0) {
                            chunkBegin = 0;
                        }
                        if (decryptStreamBytesReceived > decryptStreamStreamEnd) {
                            decryptStreamFinished = true;
                            chunkEnd = chunk.length - (decryptStreamBytesReceived - decryptStreamStreamEnd);
                        }
                        const encryptedChunk = chunk.slice(chunkBegin, chunkEnd + 1);
                        let toDecrypt;
                        let decryptStreamBuffersTotalLength = 0;
                        decryptStreamBuffers.forEach((buff) => {
                            decryptStreamBuffersTotalLength += buff.length;
                        });
                        if (decryptStreamBuffersTotalLength) {
                            const available = decryptStreamBuffersTotalLength + encryptedChunk.length;
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
                                const decryptStreamBuffersConcat = Buffer.concat(decryptStreamBuffers);
                                decryptStreamBuffers = [];
                                const nBlocks = Math.floor(decryptStreamBuffersConcat.length / AES_BLOCK_SIZE);
                                const blocksBytes = nBlocks * AES_BLOCK_SIZE;
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
                                const nBlocks = Math.floor(encryptedChunk.length / AES_BLOCK_SIZE);
                                const blocksBytes = nBlocks * AES_BLOCK_SIZE;
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
                            let newBuff = decryptStreamThis.innerDecrypt(toDecrypt, decryptStreamFinished ? padding : false);
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
        let destStream = decryptStream;
        if (link.Properties.Encrypted.Compression === "deflate") {
            const inflateStream = zlib.createInflateRaw();
            decryptStream.pipe(inflateStream);
            destStream = inflateStream;
        }
        const sal = {
            length: plainTextSize,
            reset: async () => {
                const resetedStream = await stream.reset();
                return this.transformStream(publication, link, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
            },
            stream: destStream,
        };
        return Promise.resolve(sal);
    }
    async getDecryptedSizeStream(_publication, _link, stream) {
        const TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
        if (stream.length < TWO_AES_BLOCK_SIZE) {
            return 0;
        }
        const readPos = stream.length - TWO_AES_BLOCK_SIZE;
        const rangeStream = new RangeStream_1.RangeStream(readPos, readPos + TWO_AES_BLOCK_SIZE - 1, stream.length);
        stream.stream.pipe(rangeStream);
        let buff;
        try {
            buff = await BufferUtils_1.streamToBufferPromise(rangeStream);
        }
        catch (err) {
            console.log(err);
            return 0;
        }
        return this.getDecryptedSizeBuffer_(stream.length, buff);
    }
    innerDecrypt(data, padding) {
        const buffIV = data.slice(0, AES_BLOCK_SIZE);
        const iv = buffIV.toString("binary");
        const buffToDecrypt = data.slice(AES_BLOCK_SIZE);
        const strToDecrypt = buffToDecrypt.toString("binary");
        const toDecrypt = forge.util.createBuffer(strToDecrypt, "binary");
        const aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", this.contentKey);
        aesCbcDecipher.start({ iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        function unpadFunc() { return false; }
        aesCbcDecipher.finish(padding ? undefined : unpadFunc);
        const decryptedZipData = aesCbcDecipher.output.bytes();
        const buff = new Buffer(decryptedZipData, "binary");
        return buff;
    }
    async getDecryptedSizeBuffer_(totalByteLength, buff) {
        const newBuff = this.innerDecrypt(buff, true);
        const nPaddingBytes = AES_BLOCK_SIZE - newBuff.length;
        const size = totalByteLength - AES_BLOCK_SIZE - nPaddingBytes;
        return Promise.resolve(size);
    }
    UpdateLCP(publication, lcpPassHash) {
        if (!publication.LCP) {
            return undefined;
        }
        const userKey = forge.util.hexToBytes(lcpPassHash);
        if (userKey
            && publication.LCP.Encryption.UserKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#sha256"
            && publication.LCP.Encryption.Profile === "http://readium.org/lcp/basic-profile"
            && publication.LCP.Encryption.ContentKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc") {
            try {
                const keyCheck = new Buffer(publication.LCP.Encryption.UserKey.KeyCheck, "base64").toString("binary");
                const encryptedLicenseID = keyCheck;
                const iv = encryptedLicenseID.substring(0, AES_BLOCK_SIZE);
                const toDecrypt = forge.util.createBuffer(encryptedLicenseID.substring(AES_BLOCK_SIZE), "binary");
                const aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", userKey);
                aesCbcDecipher.start({ iv, additionalData_: "binary-encoded string" });
                aesCbcDecipher.update(toDecrypt);
                aesCbcDecipher.finish();
                if (publication.LCP.ID === aesCbcDecipher.output.toString()) {
                    const encryptedContentKey = new Buffer(publication.LCP.Encryption.ContentKey.EncryptedValue, "base64").toString("binary");
                    const iv2 = encryptedContentKey.substring(0, AES_BLOCK_SIZE);
                    const toDecrypt2 = forge.util.createBuffer(encryptedContentKey.substring(AES_BLOCK_SIZE), "binary");
                    const aesCbcDecipher2 = forge.cipher.createDecipher("AES-CBC", userKey);
                    aesCbcDecipher2.start({ iv: iv2, additionalData_: "binary-encoded string" });
                    aesCbcDecipher2.update(toDecrypt2);
                    aesCbcDecipher2.finish();
                    const contentKey = aesCbcDecipher2.output.bytes();
                    return contentKey;
                }
            }
            catch (err) {
                console.log("LCP error! " + err);
            }
        }
        return undefined;
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map