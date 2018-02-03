"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const selfsigned = require("selfsigned");
const uuid = require("uuid");
async function generateSelfSignedData() {
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
        const rand = uuid.v4();
        const attributes = [{ name: "commonName", value: "R2 insecure server " + rand }];
        selfsigned.generate(attributes, opts, (err, keys) => {
            if (err) {
                reject(err);
                return;
            }
            const checkSum = crypto.createHash("sha256");
            checkSum.update(uuid.v4());
            const key = checkSum.digest("hex").toUpperCase();
            keys.trustKey = new Buffer(key, "hex");
            const AES_BLOCK_SIZE = 16;
            const ck = uuid.v4();
            keys.trustCheck = ck;
            const ivBuff = new Buffer(ck);
            const iv = ivBuff.slice(0, AES_BLOCK_SIZE);
            keys.trustCheckIV = iv;
            resolve(keys);
        });
    });
}
exports.generateSelfSignedData = generateSelfSignedData;
//# sourceMappingURL=self-signed.js.map