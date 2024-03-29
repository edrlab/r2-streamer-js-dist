"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSelfSignedData = void 0;
const tslib_1 = require("tslib");
const crypto = require("crypto");
const selfsigned = require("selfsigned");
const uuid_1 = require("uuid");
function generateSelfSignedData() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const opts = {
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
            const rand = (0, uuid_1.v4)();
            const attributes = [{ name: "commonName", value: "R2 insecure server " + rand }];
            selfsigned.generate(attributes, opts, (err, keys) => {
                if (err) {
                    reject(err);
                    return;
                }
                const password = (0, uuid_1.v4)();
                const salt = crypto.randomBytes(16).toString("hex");
                const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, "sha256").toString("hex");
                keys.trustKey = Buffer.from(hash, "hex");
                keys.trustCheck = (0, uuid_1.v4)();
                const AES_BLOCK_SIZE = 16;
                const ivBuff = Buffer.from((0, uuid_1.v4)());
                const iv = ivBuff.slice(0, AES_BLOCK_SIZE);
                keys.trustCheckIV = iv;
                resolve(keys);
            });
        });
    });
}
exports.generateSelfSignedData = generateSelfSignedData;
//# sourceMappingURL=self-signed.js.map