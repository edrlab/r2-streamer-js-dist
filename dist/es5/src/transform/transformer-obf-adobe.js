"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TransformerObfAdobe = (function () {
    function TransformerObfAdobe() {
    }
    TransformerObfAdobe.prototype.supports = function (_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC";
    };
    TransformerObfAdobe.prototype.transform = function (publication, _link, data) {
        var pubID = publication.Metadata.Identifier;
        pubID = pubID.replace("urn:uuid:", "");
        pubID = pubID.replace(/-/g, "");
        pubID = pubID.replace(/\s/g, "");
        var key = [];
        for (var i = 0; i < 16; i++) {
            var byteHex = pubID.substr(i * 2, 2);
            var byteNumer = parseInt(byteHex, 16);
            key.push(byteNumer);
        }
        var prefixLength = 1024;
        var zipDataPrefix = data.slice(0, prefixLength);
        for (var i = 0; i < prefixLength; i++) {
            zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
        }
        var zipDataRemainder = data.slice(prefixLength);
        return Buffer.concat([zipDataPrefix, zipDataRemainder]);
    };
    return TransformerObfAdobe;
}());
exports.TransformerObfAdobe = TransformerObfAdobe;
//# sourceMappingURL=transformer-obf-adobe.js.map