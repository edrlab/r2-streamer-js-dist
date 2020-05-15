"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSelfSignedData = void 0;
var tslib_1 = require("tslib");
var crypto = require("crypto");
var selfsigned = require("selfsigned");
var uuid_1 = require("uuid");
function generateSelfSignedData() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2, new Promise(function (resolve, reject) {
                    var opts = {
                        algorithm: "sha256",
                        days: 30,
                        extensions: [{
                                altNames: [{
                                        type: 2,
                                        value: "localhost",
                                    }],
                                name: "subjectAltName",
                            }],
                    };
                    var rand = uuid_1.v4();
                    var attributes = [{ name: "commonName", value: "R2 insecure server " + rand }];
                    selfsigned.generate(attributes, opts, function (err, keys) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        var password = uuid_1.v4();
                        var salt = crypto.randomBytes(16).toString("hex");
                        var hash = crypto.pbkdf2Sync(password, salt, 1000, 32, "sha256").toString("hex");
                        keys.trustKey = Buffer.from(hash, "hex");
                        keys.trustCheck = uuid_1.v4();
                        var AES_BLOCK_SIZE = 16;
                        var ivBuff = Buffer.from(uuid_1.v4());
                        var iv = ivBuff.slice(0, AES_BLOCK_SIZE);
                        keys.trustCheckIV = iv;
                        resolve(keys);
                    });
                })];
        });
    });
}
exports.generateSelfSignedData = generateSelfSignedData;
//# sourceMappingURL=self-signed.js.map