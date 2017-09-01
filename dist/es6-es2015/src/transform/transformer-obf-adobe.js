"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const BufferUtils_1 = require("../../../es8-es2017/src/_utils/stream/BufferUtils");
class TransformerObfAdobe {
    supports(_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC";
    }
    getDecryptedSizeStream(publication, link, stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let sal;
            try {
                sal = yield this.transformStream(publication, link, stream, false, 0, 0);
            }
            catch (err) {
                console.log(err);
                return Promise.reject("WTF?");
            }
            return Promise.resolve(sal.length);
        });
    }
    getDecryptedSizeBuffer(publication, link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let buff;
            try {
                buff = yield this.transformBuffer(publication, link, data);
            }
            catch (err) {
                console.log(err);
                return Promise.reject("WTF?");
            }
            return Promise.resolve(buff.length);
        });
    }
    transformStream(publication, link, stream, _isPartialByteRangeRequest, _partialByteBegin, _partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield BufferUtils_1.streamToBufferPromise(stream.stream);
            const buff = yield this.transformBuffer(publication, link, data);
            const sal = {
                length: buff.length,
                reset: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return Promise.resolve(sal);
                }),
                stream: BufferUtils_1.bufferToStream(buff),
            };
            return Promise.resolve(sal);
        });
    }
    transformBuffer(publication, _link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.TransformerObfAdobe = TransformerObfAdobe;
//# sourceMappingURL=transformer-obf-adobe.js.map