"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var BufferUtils_1 = require("../../../es8-es2017/src/_utils/stream/BufferUtils");
var TransformerObfIDPF = (function () {
    function TransformerObfIDPF() {
    }
    TransformerObfIDPF.prototype.supports = function (_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://www.idpf.org/2008/embedding";
    };
    TransformerObfIDPF.prototype.getDecryptedSizeStream = function (publication, link, stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var sal, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.transformStream(publication, link, stream, false, 0, 0)];
                    case 1:
                        sal = _a.sent();
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [2, Promise.reject("WTF?")];
                    case 3: return [2, Promise.resolve(sal.length)];
                }
            });
        });
    };
    TransformerObfIDPF.prototype.getDecryptedSizeBuffer = function (publication, link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var buff, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.transformBuffer(publication, link, data)];
                    case 1:
                        buff = _a.sent();
                        return [3, 3];
                    case 2:
                        err_2 = _a.sent();
                        console.log(err_2);
                        return [2, Promise.reject("WTF?")];
                    case 3: return [2, Promise.resolve(buff.length)];
                }
            });
        });
    };
    TransformerObfIDPF.prototype.transformStream = function (publication, link, stream, _isPartialByteRangeRequest, _partialByteBegin, _partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var data, buff, sal;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, BufferUtils_1.streamToBufferPromise(stream.stream)];
                    case 1:
                        data = _a.sent();
                        return [4, this.transformBuffer(publication, link, data)];
                    case 2:
                        buff = _a.sent();
                        sal = {
                            length: buff.length,
                            reset: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    return [2, Promise.resolve(sal)];
                                });
                            }); },
                            stream: BufferUtils_1.bufferToStream(buff),
                        };
                        return [2, Promise.resolve(sal)];
                }
            });
        });
    };
    TransformerObfIDPF.prototype.transformBuffer = function (publication, _link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var pubID, checkSum, key, prefixLength, zipDataPrefix, i, zipDataRemainder;
            return tslib_1.__generator(this, function (_a) {
                pubID = publication.Metadata.Identifier;
                pubID = pubID.replace(/\s/g, "");
                checkSum = crypto.createHash("sha1");
                checkSum.update(pubID);
                key = checkSum.digest();
                prefixLength = 1040;
                zipDataPrefix = data.slice(0, prefixLength);
                for (i = 0; i < prefixLength; i++) {
                    zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
                }
                zipDataRemainder = data.slice(prefixLength);
                return [2, Promise.resolve(Buffer.concat([zipDataPrefix, zipDataRemainder]))];
            });
        });
    };
    return TransformerObfIDPF;
}());
exports.TransformerObfIDPF = TransformerObfIDPF;
//# sourceMappingURL=transformer-obf-idpf.js.map