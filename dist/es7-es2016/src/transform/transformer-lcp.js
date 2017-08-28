"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zlib = require("zlib");
const debug_ = require("debug");
const forge = require("node-forge");
const debug = debug_("r2:transformer:lcp");
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
    transform(_publication, link, data) {
        const AES_BLOCK_SIZE = 16;
        const iv = data.slice(0, AES_BLOCK_SIZE).toString("binary");
        const toDecrypt = forge.util.createBuffer(data.slice(AES_BLOCK_SIZE).toString("binary"), "binary");
        const aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", this.contentKey);
        aesCbcDecipher.start({ iv, additionalData_: "binary-encoded string" });
        aesCbcDecipher.update(toDecrypt);
        aesCbcDecipher.finish();
        const decryptedZipData = aesCbcDecipher.output.bytes();
        let transformedData = new Buffer(decryptedZipData, "binary");
        if (link.Properties.Encrypted.Compression === "deflate") {
            transformedData = zlib.inflateRawSync(transformedData);
        }
        if (link.Properties.Encrypted.OriginalLength
            && link.Properties.Encrypted.OriginalLength !== transformedData.length) {
            debug(`LENGTH NOT MATCH ${link.Properties.Encrypted.OriginalLength} !== ${transformedData.length}`);
        }
        return transformedData;
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
                const AES_BLOCK_SIZE = 16;
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