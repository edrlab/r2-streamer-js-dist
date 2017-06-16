"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    Transformers.try = function (publication, link, data) {
        return Transformers.instance()._try(publication, link, data);
    };
    Transformers.prototype.add = function (transformer) {
        if (this.transformers.indexOf(transformer) < 0) {
            this.transformers.push(transformer);
        }
    };
    Transformers.prototype._try = function (publication, link, data) {
        var transformedData;
        var transformer = this.transformers.find(function (t) {
            if (!t.supports(publication, link)) {
                return false;
            }
            transformedData = t.transform(publication, link, data);
            if (transformedData) {
                return true;
            }
            return false;
        });
        if (transformer && transformedData) {
            return transformedData;
        }
        return undefined;
    };
    return Transformers;
}());
Transformers._instance = new Transformers();
exports.Transformers = Transformers;
Transformers.instance().add(new transformer_lcp_1.TransformerLCP());
Transformers.instance().add(new transformer_obf_adobe_1.TransformerObfAdobe());
Transformers.instance().add(new transformer_obf_idpf_1.TransformerObfIDPF());
//# sourceMappingURL=transformer.js.map