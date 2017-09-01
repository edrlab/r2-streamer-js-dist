"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BufferUtils_1 = require("../../../es8-es2017/src/_utils/stream/BufferUtils");
var TransformerObfAdobe = (function () {
    function TransformerObfAdobe() {
    }
    TransformerObfAdobe.prototype.supports = function (_publication, link) {
        return link.Properties.Encrypted.Algorithm === "http://ns.adobe.com/pdf/enc#RC";
    };
    TransformerObfAdobe.prototype.getDecryptedSizeStream = function (publication, link, stream) {
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
    TransformerObfAdobe.prototype.getDecryptedSizeBuffer = function (publication, link, data) {
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
    TransformerObfAdobe.prototype.transformStream = function (publication, link, stream, _isPartialByteRangeRequest, _partialByteBegin, _partialByteEnd) {
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
    TransformerObfAdobe.prototype.transformBuffer = function (publication, _link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var pubID, key, i, byteHex, byteNumer, prefixLength, zipDataPrefix, i, zipDataRemainder;
            return tslib_1.__generator(this, function (_a) {
                pubID = publication.Metadata.Identifier;
                pubID = pubID.replace("urn:uuid:", "");
                pubID = pubID.replace(/-/g, "");
                pubID = pubID.replace(/\s/g, "");
                key = [];
                for (i = 0; i < 16; i++) {
                    byteHex = pubID.substr(i * 2, 2);
                    byteNumer = parseInt(byteHex, 16);
                    key.push(byteNumer);
                }
                prefixLength = 1024;
                zipDataPrefix = data.slice(0, prefixLength);
                for (i = 0; i < prefixLength; i++) {
                    zipDataPrefix[i] = zipDataPrefix[i] ^ (key[i % key.length]);
                }
                zipDataRemainder = data.slice(prefixLength);
                return [2, Promise.resolve(Buffer.concat([zipDataPrefix, zipDataRemainder]))];
            });
        });
    };
    return TransformerObfAdobe;
}());
exports.TransformerObfAdobe = TransformerObfAdobe;
//# sourceMappingURL=transformer-obf-adobe.js.map