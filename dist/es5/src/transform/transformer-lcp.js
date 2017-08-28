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
            if (i.Name === "lcp_user_pass") {
                return true;
            }
            return false;
        });
        var lcpPassHash = lcpPass ? lcpPass.Value : undefined;
        if (!lcpPassHash) {
            debug("LCP missing key.");
            return false;
        }
        this.contentKey = this.UpdateLCP(publication, lcpPassHash);
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
            && link.Properties.Encrypted.OriginalLength !== transformedData.length) {
            debug("LENGTH NOT MATCH " + link.Properties.Encrypted.OriginalLength + " !== " + transformedData.length);
        }
        return transformedData;
    };
    TransformerLCP.prototype.UpdateLCP = function (publication, lcpPassHash) {
        if (!publication.LCP) {
            return undefined;
        }
        var userKey = forge.util.hexToBytes(lcpPassHash);
        if (userKey
            && publication.LCP.Encryption.UserKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#sha256"
            && publication.LCP.Encryption.Profile === "http://readium.org/lcp/basic-profile"
            && publication.LCP.Encryption.ContentKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc") {
            try {
                var keyCheck = new Buffer(publication.LCP.Encryption.UserKey.KeyCheck, "base64").toString("binary");
                var encryptedLicenseID = keyCheck;
                var AES_BLOCK_SIZE = 16;
                var iv = encryptedLicenseID.substring(0, AES_BLOCK_SIZE);
                var toDecrypt = forge.util.createBuffer(encryptedLicenseID.substring(AES_BLOCK_SIZE), "binary");
                var aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", userKey);
                aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
                aesCbcDecipher.update(toDecrypt);
                aesCbcDecipher.finish();
                if (publication.LCP.ID === aesCbcDecipher.output.toString()) {
                    var encryptedContentKey = new Buffer(publication.LCP.Encryption.ContentKey.EncryptedValue, "base64").toString("binary");
                    var iv2 = encryptedContentKey.substring(0, AES_BLOCK_SIZE);
                    var toDecrypt2 = forge.util.createBuffer(encryptedContentKey.substring(AES_BLOCK_SIZE), "binary");
                    var aesCbcDecipher2 = forge.cipher.createDecipher("AES-CBC", userKey);
                    aesCbcDecipher2.start({ iv: iv2, additionalData_: "binary-encoded string" });
                    aesCbcDecipher2.update(toDecrypt2);
                    aesCbcDecipher2.finish();
                    var contentKey = aesCbcDecipher2.output.bytes();
                    return contentKey;
                }
            }
            catch (err) {
                console.log("LCP error! " + err);
            }
        }
        return undefined;
    };
    return TransformerLCP;
}());
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map