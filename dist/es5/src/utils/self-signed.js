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
                        var checkSum = crypto.createHash("sha256");
                        checkSum.update(uuid.v4());
                        var key = checkSum.digest("hex").toUpperCase();
                        keys.trustKey = key;
                        keys.trustCheck = uuid.v4();
                        resolve(keys);
                    });
                })];
        });
    });
}
exports.generateSelfSignedData = generateSelfSignedData;
//# sourceMappingURL=self-signed.js.map