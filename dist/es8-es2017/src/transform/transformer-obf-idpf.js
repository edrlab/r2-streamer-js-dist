"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const BufferUtils_1 = require("../_utils/stream/BufferUtils");
class TransformerObfIDPF {
    supports(_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding";
    }
    async transformStream(publication, link, stream, _isPartialByteRangeRequest, _partialByteBegin, _partialByteEnd) {
        let data;
        try {
            data = await BufferUtils_1.streamToBufferPromise(stream.stream);
        }
        catch (err) {
            return Promise.reject(err);
        }
        let buff;
        try {
            buff = await this.transformBuffer(publication, link, data);
        }
        catch (err) {
            return Promise.reject(err);
        }
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