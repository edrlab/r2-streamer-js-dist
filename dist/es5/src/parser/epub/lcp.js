"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var bind = require("bindings");
var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
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
        this._usesNativeNodePlugin = undefined;
    }
    LCP.prototype.isNativeNodePlugin = function () {
        this.init();
        return this._usesNativeNodePlugin;
    };
    LCP.prototype.init = function () {
        this.ContentKey = undefined;
        this._lcpContext = undefined;
        if (typeof this._usesNativeNodePlugin !== "undefined") {
            return;
        }
        var lcpNodeFilePath = path.join(process.cwd(), "LCP/lcp.node");
        console.log(lcpNodeFilePath);
        if (fs.existsSync(lcpNodeFilePath)) {
            console.log("LCP _usesNativeNodePlugin");
            this._usesNativeNodePlugin = true;
            this._lcpNative = bind({
                bindings: "lcp.node",
                try: [[
                        "module_root",
                        "LCP",
                        "bindings",
                    ]],
            });
        }
        else {
            console.log("LCP JS impl");
            this._usesNativeNodePlugin = false;
            this._lcpNative = undefined;
        }
    };
    LCP.prototype.setUserPassphrase = function (pass) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var check, userKey, keyCheck, encryptedLicenseID, iv, encrypted, decrypteds, decryptStream, buff1, buff2, decrypted, nPaddingBytes, size, decryptedOut, encryptedContentKey, iv2, encrypted2, decrypteds2, decryptStream2, buff1_, buff2_, decrypted2, nPaddingBytes2, size2;
            return tslib_1.__generator(this, function (_a) {
                this.init();
                this.userPassphraseHex = pass;
                debug(this.userPassphraseHex);
                if (!this.userPassphraseHex) {
                    return [2, false];
                }
                check = this.Encryption.Profile === "http://readium.org/lcp/basic-profile"
                    && this.Encryption.UserKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#sha256"
                    && this.Encryption.ContentKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
                if (!check) {
                    debug("Incorrect LCP fields.");
                    debug(this.Encryption.Profile);
                    debug(this.Encryption.ContentKey.Algorithm);
                    debug(this.Encryption.UserKey.Algorithm);
                    return [2, false];
                }
                if (this._usesNativeNodePlugin) {
                    return [2, new Promise(function (resolve, _reject) {
                            _this._lcpNative.findOneValidPassphrase(_this.JsonSource, [_this.userPassphraseHex], function (err, validHashedPassphrase) {
                                if (err) {
                                    debug(err);
                                    resolve(false);
                                }
                                else {
                                    debug(validHashedPassphrase);
                                    _this._lcpNative.createContext(_this.JsonSource, validHashedPassphrase, lcp_certificate_1.DUMMY_CRL, function (erro, context) {
                                        if (erro) {
                                            debug(erro);
                                            resolve(false);
                                            return;
                                        }
                                        var userKey = new Buffer(_this.userPassphraseHex, "hex");
                                        var buff = new Buffer(context.encryptedContentKey, "hex");
                                        var iv = buff.slice(0, AES_BLOCK_SIZE);
                                        var encrypted = buff.slice(AES_BLOCK_SIZE);
                                        var decryptStream = crypto.createDecipheriv("aes-256-cbc", userKey, iv);
                                        decryptStream.setAutoPadding(false);
                                        var decryptedContent = decryptStream.update(encrypted);
                                        var nPadding = decryptedContent[decryptedContent.length - 1];
                                        var size = decryptedContent.length - nPadding;
                                        _this.ContentKey = decryptedContent.slice(0, size);
                                        resolve(true);
                                    });
                                }
                            });
                        })];
                }
                else {
                    userKey = new Buffer(this.userPassphraseHex, "hex");
                    keyCheck = new Buffer(this.Encryption.UserKey.KeyCheck, "base64");
                    encryptedLicenseID = keyCheck;
                    iv = encryptedLicenseID.slice(0, AES_BLOCK_SIZE);
                    encrypted = encryptedLicenseID.slice(AES_BLOCK_SIZE);
                    decrypteds = [];
                    decryptStream = crypto.createDecipheriv("aes-256-cbc", userKey, iv);
                    decryptStream.setAutoPadding(false);
                    buff1 = decryptStream.update(encrypted);
                    if (buff1) {
                        decrypteds.push(buff1);
                    }
                    buff2 = decryptStream.final();
                    if (buff2) {
                        decrypteds.push(buff2);
                    }
                    decrypted = Buffer.concat(decrypteds);
                    nPaddingBytes = decrypted[decrypted.length - 1];
                    size = encrypted.length - nPaddingBytes;
                    decryptedOut = decrypted.slice(0, size).toString("utf8");
                    if (this.ID !== decryptedOut) {
                        debug("Failed LCP ID check.");
                        return [2, false];
                    }
                    encryptedContentKey = new Buffer(this.Encryption.ContentKey.EncryptedValue, "base64");
                    iv2 = encryptedContentKey.slice(0, AES_BLOCK_SIZE);
                    encrypted2 = encryptedContentKey.slice(AES_BLOCK_SIZE);
                    decrypteds2 = [];
                    decryptStream2 = crypto.createDecipheriv("aes-256-cbc", userKey, iv2);
                    decryptStream2.setAutoPadding(false);
                    buff1_ = decryptStream2.update(encrypted2);
                    if (buff1_) {
                        decrypteds2.push(buff1_);
                    }
                    buff2_ = decryptStream2.final();
                    if (buff2_) {
                        decrypteds2.push(buff2_);
                    }
                    decrypted2 = Buffer.concat(decrypteds2);
                    nPaddingBytes2 = decrypted2[decrypted2.length - 1];
                    size2 = encrypted2.length - nPaddingBytes2;
                    this.ContentKey = decrypted2.slice(0, size2);
                }
                return [2, true];
            });
        });
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