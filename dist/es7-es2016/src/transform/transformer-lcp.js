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
            if (i.Name === "lcp_content_key") {
                return true;
            }
            return false;
        });
        const contentKey = lcpPass ? lcpPass.Value : undefined;
        if (contentKey) {
            this.contentKey = publication.UpdateLCP(contentKey);
        }
        if (!this.contentKey) {
            debug("LCP missing key.");
            return false;
        }
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
            && link.Properties.Encrypted.OriginalLength !== data.length) {
            debug(`LENGTH NOT MATCH ${link.Properties.Encrypted.OriginalLength} !== ${data.length}`);
        }
        return transformedData;
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map