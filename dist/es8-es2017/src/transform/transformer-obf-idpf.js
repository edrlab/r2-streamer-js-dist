"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const BufferUtils_1 = require("../_utils/stream/BufferUtils");
class TransformerObfIDPF {
    supports(_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding";
    }
    async getDecryptedSizeStream(publication, link, stream) {
        let sal;
        try {
            sal = await this.transformStream(publication, link, stream, false, 0, 0);
        }
        catch (err) {
            console.log(err);
            return Promise.reject("WTF?");
        }
        return Promise.resolve(sal.length);
    }
    async getDecryptedSizeBuffer(publication, link, data) {
        let buff;
        try {
            buff = await this.transformBuffer(publication, link, data);
        }
        catch (err) {
            console.log(err);
            return Promise.reject("WTF?");
        }
        return Promise.resolve(buff.length);
    }
    async transformStream(publication, link, stream, _isPartialByteRangeRequest, _partialByteBegin, _partialByteEnd) {
        const data = await BufferUtils_1.streamToBufferPromise(stream.stream);
        const buff = await this.transformBuffer(publication, link, data);
        const sal = {
            length: buff.length,
            reset: async () => {
                return Promise.resolve(sal);
            },
            stream: BufferUtils_1.bufferToStream(buff),
        };
        return Promise.resolve(sal);
    }
    async transformBuffer(publication, _link, data) {
        let pubID = publication.Metadata.Identifier;
        pubID = pubID.replace(/\s/g, "");
        const checkSum = crypto.createHash("sha1");
        checkSum.update(pubID);
        const key = checkSum.digest();
        const prefixLength = 1040;
        const zipDataPrefix = data.slice(0, prefixLength);
        for (let i = 0; i < prefixLength; i++) {
            zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
        }
        const zipDataRemainder = data.slice(prefixLength);
        return Promise.resolve(Buffer.concat([zipDataPrefix, zipDataRemainder]));
    }
}
exports.TransformerObfIDPF = TransformerObfIDPF;
//# sourceMappingURL=transformer-obf-idpf.js.map