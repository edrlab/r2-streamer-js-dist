"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
class TransformerObfIDPF {
    supports(_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding";
    }
    transform(publication, _link, data) {
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
        return Buffer.concat([zipDataPrefix, zipDataRemainder]);
    }
}
exports.TransformerObfIDPF = TransformerObfIDPF;
//# sourceMappingURL=transformer-obf-idpf.js.map