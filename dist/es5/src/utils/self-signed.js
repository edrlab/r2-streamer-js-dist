"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var selfsigned = require("selfsigned");
var uuid = require("uuid");
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
                    var rand = uuid.v4();
                    var attributes = [{ name: "commonName", value: "R2 insecure server " + rand }];
                    selfsigned.generate(attributes, opts, function (err, keys) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        var password = uuid.v4();
                        var salt = crypto.randomBytes(16).toString("hex");
                        var hash = crypto.pbkdf2Sync(password, salt, 1000, 32, "sha256").toString("hex");
                        keys.trustKey = new Buffer(hash, "hex");
                        keys.trustCheck = uuid.v4();
                        var AES_BLOCK_SIZE = 16;
                        var ivBuff = new Buffer(uuid.v4());
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