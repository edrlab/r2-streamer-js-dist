"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
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
        let ivBuffer;
        if (link.Properties.Encrypted.CypherBlockIV) {
            ivBuffer = Buffer.from(link.Properties.Encrypted.CypherBlockIV, "binary");
        }
        else {
            const ivRangeStream = new RangeStream_1.RangeStream(0, AES_BLOCK_SIZE - 1, stream.length);
            stream.stream.pipe(ivRangeStream);
            try {
                ivBuffer = await BufferUtils_1.streamToBufferPromise(ivRangeStream);
            }
            catch (err) {
                console.log(err);
                return Promise.reject("OUCH!");
            }
            stream = await stream.reset();
            link.Properties.Encrypted.CypherBlockIV = ivBuffer.toString("binary");
        }
        const cypherRangeStream = new RangeStream_1.RangeStream(AES_BLOCK_SIZE, stream.length - 1, stream.length);
        stream.stream.pipe(cypherRangeStream);
        const decryptStream = crypto.createDecipheriv("aes-256-cbc", new Buffer(this.contentKey, "binary"), ivBuffer);
        decryptStream.setAutoPadding(false);
        cypherRangeStream.pipe(decryptStream);
        let destStream = decryptStream;
        if (cypherBlockPadding) {
            const cypherUnpaddedStream = new RangeStream_1.RangeStream(0, plainTextSize - 1, plainTextSize);
            destStream.pipe(cypherUnpaddedStream);
            destStream = cypherUnpaddedStream;
        }
        if (link.Properties.Encrypted.Compression === "deflate") {
            const inflateStream = zlib.createInflateRaw();
            destStream.pipe(inflateStream);
            destStream = inflateStream;
        }
        const l = link.Properties.Encrypted.OriginalLength ?
            link.Properties.Encrypted.OriginalLength : plainTextSize;
        if (isPartialByteRangeRequest) {
            const rangeStream = new RangeStream_1.RangeStream(partialByteBegin, partialByteEnd, l);
            destStream.pipe(rangeStream);
            destStream = rangeStream;
        }
        const sal = {
            length: l,
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
            return Promise.reject("crypto err");
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
            return Promise.reject("crypto err");
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
        const res = {
            length: size,
            padding: nPaddingBytes,
        };
        return Promise.resolve(res);
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