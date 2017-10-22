"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var SeqOrPar = (function () {
    function SeqOrPar() {
    }
    SeqOrPar = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
        }),
        xml_js_mapper_1.XmlDiscriminatorProperty("localName")
    ], SeqOrPar);
    return SeqOrPar;
}());
exports.SeqOrPar = SeqOrPar;
//# sourceMappingURL=smil-seq-or-par.js.map