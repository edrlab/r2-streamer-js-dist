"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var debug_ = require("debug");
var ta_json_1 = require("ta-json");
var lcp_certificate_1 = require("./lcp-certificate");
var lcp_encryption_1 = require("./lcp-encryption");
var lcp_link_1 = require("./lcp-link");
var lcp_rights_1 = require("./lcp-rights");
var lcp_signature_1 = require("./lcp-signature");
var lcp_user_1 = require("./lcp-user");
var AES_BLOCK_SIZE = 16;
var debug = debug_("r2:publication:lcp");
var LCP = (function () {
    function LCP() {
    }
    LCP.prototype.setUserPassphrase = function (pass) {
        this.userPassphraseHex = pass;
        this.ContentKey = undefined;
        var check = this.Encryption.Profile === "http://readium.org/lcp/basic-profile"
            && this.Encryption.UserKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#sha256"
            && this.Encryption.ContentKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            debug("Incorrect LCP fields.");
            return false;
        }
        var userKey = new Buffer(this.userPassphraseHex, "hex");
        var keyCheck = new Buffer(this.Encryption.UserKey.KeyCheck, "base64");
        var encryptedLicenseID = keyCheck;
        var iv = encryptedLicenseID.slice(0, AES_BLOCK_SIZE);
        var encrypted = encryptedLicenseID.slice(AES_BLOCK_SIZE);
        var decrypteds = [];
        var decryptStream = crypto.createDecipheriv("aes-256-cbc", userKey, iv);
        decryptStream.setAutoPadding(false);
        var buff1 = decryptStream.update(encrypted);
        if (buff1) {
            decrypteds.push(buff1);
        }
        var buff2 = decryptStream.final();
        if (buff2) {
            decrypteds.push(buff2);
        }
        var decrypted = Buffer.concat(decrypteds);
        var nPaddingBytes = decrypted[decrypted.length - 1];
        var size = encrypted.length - nPaddingBytes;
        var decryptedOut = decrypted.slice(0, size).toString("utf8");
        if (this.ID !== decryptedOut) {
            debug("Failed LCP ID check.");
            return false;
        }
        var encryptedContentKey = new Buffer(this.Encryption.ContentKey.EncryptedValue, "base64");
        var iv2 = encryptedContentKey.slice(0, AES_BLOCK_SIZE);
        var encrypted2 = encryptedContentKey.slice(AES_BLOCK_SIZE);
        var decrypteds2 = [];
        var decryptStream2 = crypto.createDecipheriv("aes-256-cbc", userKey, iv2);
        decryptStream2.setAutoPadding(false);
        var buff1_ = decryptStream2.update(encrypted2);
        if (buff1_) {
            decrypteds2.push(buff1_);
        }
        var buff2_ = decryptStream2.final();
        if (buff2_) {
            decrypteds2.push(buff2_);
        }
        var decrypted2 = Buffer.concat(decrypteds2);
        var nPaddingBytes2 = decrypted2[decrypted2.length - 1];
        var size2 = encrypted2.length - nPaddingBytes2;
        this.ContentKey = decrypted2.slice(0, size2);
        return true;
    };
    LCP.prototype.checkCertificate = function () {
        debug(lcp_certificate_1.LCPBasicProfileCertificate);
    };
    tslib_1.__decorate([
        ta_json_1.JsonProperty("id"),
        tslib_1.__metadata("design:type", String)
    ], LCP.prototype, "ID", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("provider"),
        tslib_1.__metadata("design:type", String)
    ], LCP.prototype, "Provider", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("issued"),
        tslib_1.__metadata("design:type", Date)
    ], LCP.prototype, "Issued", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("updated"),
        tslib_1.__metadata("design:type", Date)
    ], LCP.prototype, "Updated", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("encryption"),
        tslib_1.__metadata("design:type", lcp_encryption_1.Encryption)
    ], LCP.prototype, "Encryption", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("rights"),
        tslib_1.__metadata("design:type", lcp_rights_1.Rights)
    ], LCP.prototype, "Rights", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("user"),
        tslib_1.__metadata("design:type", lcp_user_1.User)
    ], LCP.prototype, "User", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("signature"),
        tslib_1.__metadata("design:type", lcp_signature_1.Signature)
    ], LCP.prototype, "Signature", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("links"),
        ta_json_1.JsonElementType(lcp_link_1.Link),
        tslib_1.__metadata("design:type", Array)
    ], LCP.prototype, "Links", void 0);
    LCP = tslib_1.__decorate([
        ta_json_1.JsonObject()
    ], LCP);
    return LCP;
}());
exports.LCP = LCP;
//# sourceMappingURL=lcp.js.map