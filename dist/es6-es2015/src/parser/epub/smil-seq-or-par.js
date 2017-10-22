"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let SeqOrPar = class SeqOrPar {
};
SeqOrPar = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    }),
    xml_js_mapper_1.XmlDiscriminatorProperty("localName")
], SeqOrPar);
exports.SeqOrPar = SeqOrPar;
//# sourceMappingURL=smil-seq-or-par.js.map