"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const selfsigned = require("selfsigned");
const uuid = require("uuid");
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
            const rand = uuid.v4();
            const attributes = [{ name: "commonName", value: "R2 insecure server " + rand }];
            selfsigned.generate(attributes, opts, (err, keys) => {
                if (err) {
                    reject(err);
                    return;
                }
                keys.trustKey = uuid.v4();
                keys.trustVal = rand;
                resolve(keys);
            });
        });
    });
}
exports.generateSelfSignedData = generateSelfSignedData;
//# sourceMappingURL=self-signed.js.map