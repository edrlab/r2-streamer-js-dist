"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformer_lcp_1 = require("./transformer-lcp");
const transformer_obf_adobe_1 = require("./transformer-obf-adobe");
const transformer_obf_idpf_1 = require("./transformer-obf-idpf");
class Transformers {
    constructor() {
        this.transformers = [];
    }
    static instance() {
        return Transformers._instance;
    }
    static try(publication, link, data) {
        return Transformers.instance()._try(publication, link, data);
    }
    add(transformer) {
        if (this.transformers.indexOf(transformer) < 0) {
            this.transformers.push(transformer);
        }
    }
    _try(publication, link, data) {
        let transformedData;
        const transformer = this.transformers.find((t) => {
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
    }
}
Transformers._instance = new Transformers();
exports.Transformers = Transformers;
Transformers.instance().add(new transformer_lcp_1.TransformerLCP());
Transformers.instance().add(new transformer_obf_adobe_1.TransformerObfAdobe());
Transformers.instance().add(new transformer_obf_idpf_1.TransformerObfIDPF());
//# sourceMappingURL=transformer.js.map