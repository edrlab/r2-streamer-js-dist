"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zlib = require("zlib");
var debug_ = require("debug");
var forge = require("node-forge");
var debug = debug_("r2:transformer:lcp");
var TransformerLCP = (function () {
    function TransformerLCP() {
    }
    TransformerLCP.prototype.supports = function (publication, link) {
        var check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
            && link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile"
            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            return false;
        }
        var lcpPass = publication.Internal.find(function (i) {
            if (i.Name === "lcp_content_key") {
                return true;
            }
            return false;
        });
        var contentKey = lcpPass ? lcpPass.Value : undefined;
        if (contentKey) {
            this.contentKey = publication.UpdateLCP(contentKey);
        }
        if (!this.contentKey) {
            debug("LCP missing key.");
            return false;
        }
        return true;
    };
    TransformerLCP.prototype.transform = function (_publication, link, data) {
        var AES_BLOCK_SIZE = 16;
        var iv = data.slice(0, AES_BLOCK_SIZE).toString("binary");
        var toDecrypt = forge.util.createBuffer(data.slice(AES_BLOCK_SIZE).toString("binary"), "binary");
        var aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", this.contentKey);
        aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        aesCbcDecipher.finish();
        var decryptedZipData = aesCbcDecipher.output.bytes();
        var transformedData = new Buffer(decryptedZipData, "binary");
        if (link.Properties.Encrypted.Compression === "deflate") {
            transformedData = zlib.inflateRawSync(transformedData);
        }
        if (link.Properties.Encrypted.OriginalLength
            && link.Properties.Encrypted.OriginalLength !== data.length) {
            debug("LENGTH NOT MATCH " + link.Properties.Encrypted.OriginalLength + " !== " + data.length);
        }
        return transformedData;
    };
    return TransformerLCP;
}());
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map