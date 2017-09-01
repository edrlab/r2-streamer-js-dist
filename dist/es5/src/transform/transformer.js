"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var transformer_lcp_1 = require("./transformer-lcp");
var transformer_obf_adobe_1 = require("./transformer-obf-adobe");
var transformer_obf_idpf_1 = require("./transformer-obf-idpf");
var Transformers = (function () {
    function Transformers() {
        this.transformers = [];
    }
    Transformers.instance = function () {
        return Transformers._instance;
    };
    Transformers.tryBuffer = function (publication, link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2, Transformers.instance()._tryBuffer(publication, link, data)];
            });
        });
    };
    Transformers.tryStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2, Transformers.instance()._tryStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd)];
            });
        });
    };
    Transformers.prototype.add = function (transformer) {
        if (this.transformers.indexOf(transformer) < 0) {
            this.transformers.push(transformer);
        }
    };
    Transformers.prototype._tryBuffer = function (publication, link, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transformedData, transformer;
            return tslib_1.__generator(this, function (_a) {
                transformer = this.transformers.find(function (t) {
                    if (!t.supports(publication, link)) {
                        return false;
                    }
                    transformedData = t.transformBuffer(publication, link, data);
                    if (transformedData) {
                        return true;
                    }
                    return false;
                });
                if (transformer && transformedData) {
                    return [2, transformedData];
                }
                return [2, Promise.reject("transformers fail (buffer)")];
            });
        });
    };
    Transformers.prototype._tryStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transformedData, transformer;
            return tslib_1.__generator(this, function (_a) {
                transformer = this.transformers.find(function (t) {
                    if (!t.supports(publication, link)) {
                        return false;
                    }
                    transformedData = t.transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
                    if (transformedData) {
                        return true;
                    }
                    return false;
                });
                if (transformer && transformedData) {
                    return [2, transformedData];
                }
                return [2, Promise.reject("transformers fail (stream)")];
            });
        });
    };
    Transformers._instance = new Transformers();
    return Transformers;
}());
exports.Transformers = Transformers;
Transformers.instance().add(new transformer_lcp_1.TransformerLCP());
Transformers.instance().add(new transformer_obf_adobe_1.TransformerObfAdobe());
Transformers.instance().add(new transformer_obf_idpf_1.TransformerObfIDPF());
//# sourceMappingURL=transformer.js.map