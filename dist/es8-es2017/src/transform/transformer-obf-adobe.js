"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BufferUtils_1 = require("../_utils/stream/BufferUtils");
class TransformerObfAdobe {
    supports(_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC";
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
        pubID = pubID.replace("urn:uuid:", "");
        pubID = pubID.replace(/-/g, "");
        pubID = pubID.replace(/\s/g, "");
        const key = [];
        for (let i = 0; i < 16; i++) {
            const byteHex = pubID.substr(i * 2, 2);
            const byteNumer = parseInt(byteHex, 16);
            key.push(byteNumer);
        }
        const prefixLength = 1024;
        const zipDataPrefix = data.slice(0, prefixLength);
        for (let i = 0; i < prefixLength; i++) {
            zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
        }
        const zipDataRemainder = data.slice(prefixLength);
        return Promise.resolve(Buffer.concat([zipDataPrefix, zipDataRemainder]));
    }
}
exports.TransformerObfAdobe = TransformerObfAdobe;
//# sourceMappingURL=transformer-obf-adobe.js.map