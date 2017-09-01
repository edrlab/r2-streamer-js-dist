"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    async getDecryptedSizeStream(_publication, _link, stream) {
        const twoBlocks = 2 * AES_BLOCK_SIZE;
        if (stream.length < twoBlocks) {
            return 0;
        }
        const readPos = stream.length - twoBlocks;
        const rangeStream = new RangeStream_1.RangeStream(readPos, readPos + twoBlocks - 1, stream.length);
        stream.stream.pipe(rangeStream);
        let buff;
        try {
            buff = await BufferUtils_1.streamToBufferPromise(rangeStream);
        }
        catch (err) {
            console.log(err);
            return 0;
        }
        const newBuff = this.innerDecrypt(buff);
        const size = stream.length - AES_BLOCK_SIZE - ((AES_BLOCK_SIZE - newBuff.length) % AES_BLOCK_SIZE);
        return Promise.resolve(size);
    }
    async getDecryptedSizeBuffer(_publication, _link, data) {
        const totalByteLength = data.length;
        const twoBlocks = 2 * AES_BLOCK_SIZE;
        if (totalByteLength < twoBlocks) {
            return 0;
        }
        const readPos = totalByteLength - twoBlocks;
        const buff = data.slice(readPos, readPos + twoBlocks);
        const newBuff = this.innerDecrypt(buff);
        const size = totalByteLength - AES_BLOCK_SIZE - ((AES_BLOCK_SIZE - newBuff.length) % AES_BLOCK_SIZE);
        return size;
    }
    async transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        if (!isPartialByteRangeRequest) {
            return this.transformStream_(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
        }
        debug("LCP transformStream() RAW STREAM LENGTH: " + stream.length);
        let plainTextSize = -1;
        if (link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0) {
            plainTextSize = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
        }
        else {
            plainTextSize = await this.getDecryptedSizeStream(publication, link, stream);
            debug("LCP getDecryptedSizeStream(): " + plainTextSize);
            stream = await stream.reset();
            link.Properties.Encrypted.DecryptedLengthBeforeInflate = plainTextSize;
        }
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
        const partialByteLength = partialByteEnd - partialByteBegin;
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
        blocksCount += (partialByteLength - bytesInFirstBlock) / AES_BLOCK_SIZE;
        if ((partialByteLength - bytesInFirstBlock) % AES_BLOCK_SIZE !== 0) {
            blocksCount++;
        }
        let padding = false;
        const sizeWithoutPaddedBlock = plainTextSize - (plainTextSize % AES_BLOCK_SIZE);
        if (partialByteEnd > sizeWithoutPaddedBlock) {
            padding = true;
        }
        const toRead = blocksCount * AES_BLOCK_SIZE;
        const rangeStream = new RangeStream_1.RangeStream(readPosition, readPosition + toRead - 1, stream.length);
        stream.stream.pipe(rangeStream);
        let buff;
        try {
            buff = await BufferUtils_1.streamToBufferPromise(rangeStream);
        }
        catch (err) {
            console.log(err);
            return Promise.reject("OUCH!");
        }
        let newBuff = this.innerDecrypt(buff);
        if (newBuff.length < partialByteLength) {
            debug("newBuff.length < partialByteLength");
        }
        newBuff = newBuff.slice(blockOffset);
        const bufferStream = BufferUtils_1.bufferToStream(newBuff);
        const sal = {
            length: newBuff.length,
            reset: async () => {
                const resetedStream = await stream.reset();
                return this.transformStream(publication, link, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
            },
            stream: bufferStream,
        };
        return Promise.resolve(sal);
    }
    async transformStream_(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        debug("LCP transformStream() RAW STREAM LENGTH: " + stream.length);
        let l = -1;
        if (link.Properties.Encrypted.DecryptedLengthBeforeInflate > 0) {
            l = link.Properties.Encrypted.DecryptedLengthBeforeInflate;
        }
        else {
            l = await this.getDecryptedSizeStream(publication, link, stream);
            debug("LCP getDecryptedSizeStream(): " + l);
            stream = await stream.reset();
            link.Properties.Encrypted.DecryptedLengthBeforeInflate = l;
        }
        const data = await BufferUtils_1.streamToBufferPromise(stream.stream);
        debug("LCP transformStream() RAW BUFFER LENGTH after reset: " + stream.length);
        const buff = await this.transformBuffer(publication, link, data);
        debug("LCP transformStream() DECRYPTED BUFFER LENGTH: " + buff.length);
        if (partialByteBegin < 0) {
            partialByteBegin = 0;
        }
        if (partialByteEnd < 0) {
            partialByteEnd = buff.length - 1;
        }
        if (isPartialByteRangeRequest) {
            debug("LCP transformStream() PARTIAL: " + partialByteBegin + " - " + partialByteEnd);
            const rangeStream = new RangeStream_1.RangeStream(partialByteBegin, partialByteEnd, buff.length);
            const bufferStream = BufferUtils_1.bufferToStream(buff);
            bufferStream.pipe(rangeStream);
            const sal = {
                length: buff.length,
                reset: async () => {
                    const resetedStream = await stream.reset();
                    return this.transformStream(publication, link, resetedStream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
                },
                stream: rangeStream,
            };
            return Promise.resolve(sal);
        }
        else {
            debug("LCP transformStream() WHOLE: " + buff.length);
            const sal = {
                length: buff.length,
                reset: async () => {
                    return Promise.resolve(sal);
                },
                stream: BufferUtils_1.bufferToStream(buff),
            };
            return Promise.resolve(sal);
        }
    }
    innerDecrypt(data) {
        const iv = data.slice(0, AES_BLOCK_SIZE).toString("binary");
        const toDecrypt = forge.util.createBuffer(data.slice(AES_BLOCK_SIZE).toString("binary"), "binary");
        const aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", this.contentKey);
        aesCbcDecipher.start({ iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        aesCbcDecipher.finish();
        const decryptedZipData = aesCbcDecipher.output.bytes();
        return new Buffer(decryptedZipData, "binary");
    }
    async transformBuffer(_publication, link, data) {
        let transformedData = this.innerDecrypt(data);
        debug("LCP transformBuffer() decrypted buffer length: " + transformedData.length);
        const l = await this.getDecryptedSizeBuffer(_publication, link, data);
        debug("LCP transformBuffer() decrypted buffer length CHECK: " + l);
        if (link.Properties.Encrypted.Compression === "deflate") {
            transformedData = zlib.inflateRawSync(transformedData);
        }
        debug("LCP transformBuffer() decrypted buffer length after INFLATE: " + transformedData.length);
        if (link.Properties.Encrypted.OriginalLength
            && link.Properties.Encrypted.OriginalLength !== transformedData.length) {
            debug(`LENGTH NOT MATCH ${link.Properties.Encrypted.OriginalLength} !== ${transformedData.length}`);
        }
        return Promise.resolve(transformedData);
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