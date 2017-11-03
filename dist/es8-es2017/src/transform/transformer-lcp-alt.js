"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const debug_ = require("debug");
const forge = require("node-forge");
const transformer_lcp_1 = require("./transformer-lcp");
const debug = debug_("r2:transformer:lcp");
const debugx = debug_("r2:transformer:stream:lcp");
const AES_BLOCK_SIZE = 16;
class TransformerLCPAlt extends transformer_lcp_1.TransformerLCP {
    async transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        let cryptoInfo;
        let plainTextSize = -1;
        let cypherBlockPadding = -1;
        if (link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0) {
            plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
            cypherBlockPadding = link.Properties.Encrypted.CypherBlockPadding;
        }
        else {
            cryptoInfo = await this.getDecryptedSizeStream(publication, link, stream);
            plainTextSize = cryptoInfo.length;
            cypherBlockPadding = cryptoInfo.padding;
            link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
            link.Properties.Encrypted.CypherBlockPadding = cypherBlockPadding;
            stream = await stream.reset();
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
        let decryptStreamBytesSent = 0;
        let decryptStreamFinished = false;
        let decryptStreamClosed = false;
        let decryptStreamFirst = true;
        const decryptStreamThis = this;
        let decryptStreamBuffers = [];
        const TWO_AES_BLOCK_SIZE = 2 * AES_BLOCK_SIZE;
        const decryptStream = new stream_1.Transform({
            flush(callback) {
                debugx("LcpDecryptStream FLUSH");
                let toDecrypt;
                let decryptStreamBuffersTotalLength = 0;
                decryptStreamBuffers.forEach((buff) => {
                    decryptStreamBuffersTotalLength += buff.length;
                });
                if (decryptStreamBuffersTotalLength) {
                    debugx("LcpDecryptStream FLUSH decryptStreamBuffersTotalLength: " +
                        decryptStreamBuffersTotalLength);
                    const available = decryptStreamBuffersTotalLength;
                    if (available === TWO_AES_BLOCK_SIZE) {
                        toDecrypt = Buffer.concat(decryptStreamBuffers);
                        decryptStreamBuffers = [];
                    }
                    else if (available < TWO_AES_BLOCK_SIZE) {
                        debugx("LcpDecryptStream NOT ENOUGH DATA????");
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
                            debugx("LcpDecryptStream OVERFLOW DATA????");
                        }
                    }
                }
                if (toDecrypt) {
                    let newBuff = decryptStreamThis.innerDecrypt(publication, link, toDecrypt, padding);
                    if (decryptStreamFirst) {
                        decryptStreamFirst = false;
                        newBuff = newBuff.slice(decryptStreamBlockOffset);
                    }
                    decryptStreamBytesSent += newBuff.length;
                    debugx("LcpDecryptStream FLUSH decryptStreamBytesSent: " + decryptStreamBytesSent);
                    decryptStream.push(newBuff);
                }
                if (decryptStreamBytesSent !== plainTextSize) {
                    debugx(`############### ` +
                        `LcpDecryptStream FLUSH  LENGTH NOT MATCH ` +
                        `decryptStreamBytesSent !== plainTextSize:` +
                        `[ ${decryptStreamStreamBegin} (${decryptStreamStreamEnd}) ] ` +
                        `${decryptStreamBytesReceived} (${stream.length}) > ` +
                        `${decryptStreamBytesSent} !== ${plainTextSize}`);
                }
                callback();
            },
            transform(chunk, _encoding, callback) {
                decryptStreamBytesReceived += chunk.length;
                debugx("TRANSFORM chunk.length: " + chunk.length + " (( " + decryptStreamBytesReceived);
                if (decryptStreamFinished) {
                    if (!decryptStreamClosed) {
                        debugx("???? LcpDecryptStream CLOSING...");
                        decryptStreamClosed = true;
                        decryptStream.push(null);
                    }
                    else {
                        debugx("???? LcpDecryptStream STILL PIPE CALLING _transform ??!");
                        decryptStream.end();
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
                            const decr = decryptStreamBytesReceived - decryptStreamStreamEnd;
                            debugx("LcpDecryptStream TRANSFORM FINISH decr: " + decr);
                            chunkEnd = chunk.length - decr;
                        }
                        debugx(`CHUNK: ${chunkBegin}-${chunkEnd}/${chunk.length}`);
                        const encryptedChunk = chunk.slice(chunkBegin, chunkEnd + 1);
                        let toDecrypt;
                        let decryptStreamBuffersTotalLength = 0;
                        decryptStreamBuffers.forEach((buff) => {
                            decryptStreamBuffersTotalLength += buff.length;
                        });
                        if (decryptStreamBuffersTotalLength) {
                            debugx("LcpDecryptStream TRANSFORM decryptStreamBuffersTotalLength: " +
                                decryptStreamBuffersTotalLength);
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
                            debugx(`CHUNK TO DECRYPT: ${toDecrypt.length}`);
                            let newBuff = decryptStreamThis.innerDecrypt(publication, link, toDecrypt, decryptStreamFinished ? padding : false);
                            debugx(`CHUNK DECRYPTED: ${newBuff.length}`);
                            if (decryptStreamFirst) {
                                decryptStreamFirst = false;
                                debugx("LcpDecryptStream TRANSFORM decryptStreamBlockOffset: " +
                                    decryptStreamBlockOffset);
                                newBuff = newBuff.slice(decryptStreamBlockOffset);
                            }
                            decryptStreamBytesSent += newBuff.length;
                            debugx("LcpDecryptStream TRANSFORM decryptStreamBytesSent: " + decryptStreamBytesSent);
                            decryptStream.push(newBuff);
                        }
                        if (decryptStreamFinished) {
                            debugx("LcpDecryptStream FINISHING...");
                            decryptStreamClosed = true;
                            decryptStream.push(null);
                            decryptStream.end();
                        }
                    }
                    else {
                    }
                }
                callback();
            },
        });
        const l = link.Properties.Encrypted.OriginalLength ?
            link.Properties.Encrypted.OriginalLength : plainTextSize;
        const sal = {
            length: l,
            reset: async () => {
                const resetedStream = await stream.reset();
                return this.transformStream(publication, link, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
            },
            stream: decryptStream,
        };
        return Promise.resolve(sal);
    }
    innerDecrypt(publication, _link, data, padding) {
        const contentKey = publication.LCP.ContentKey;
        const buffIV = data.slice(0, AES_BLOCK_SIZE);
        const iv = buffIV.toString("binary");
        const buffToDecrypt = data.slice(AES_BLOCK_SIZE);
        const strToDecrypt = buffToDecrypt.toString("binary");
        const toDecrypt = forge.util.createBuffer(strToDecrypt, "binary");
        const aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", contentKey);
        aesCbcDecipher.start({ iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        function unpadFunc() { return false; }
        aesCbcDecipher.finish(padding ? undefined : unpadFunc);
        const decryptedZipData = aesCbcDecipher.output.bytes();
        const buff = new Buffer(decryptedZipData, "binary");
        return buff;
    }
}
exports.TransformerLCPAlt = TransformerLCPAlt;
//# sourceMappingURL=transformer-lcp-alt.js.map