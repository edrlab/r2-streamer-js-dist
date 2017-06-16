"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var TransformerObfIDPF = (function () {
    function TransformerObfIDPF() {
    }
    TransformerObfIDPF.prototype.supports = function (_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding";
    };
    TransformerObfIDPF.prototype.transform = function (publication, _link, data) {
        var pubID = publication.Metadata.Identifier;
        pubID = pubID.replace(/\s/g, "");
        var checkSum = crypto.createHash("sha1");
        checkSum.update(pubID);
        var key = checkSum.digest();
        var prefixLength = 1040;
        var zipDataPrefix = data.slice(0, prefixLength);
        for (var i = 0; i < prefixLength; i++) {
            zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
        }
        var zipDataRemainder = data.slice(prefixLength);
        return Buffer.concat([zipDataPrefix, zipDataRemainder]);
    };
    return TransformerObfIDPF;
}());
exports.TransformerObfIDPF = TransformerObfIDPF;
//# sourceMappingURL=transformer-obf-idpf.js.map