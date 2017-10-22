"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const smil_seq_or_par_1 = require("./smil-seq-or-par");
let Seq = class Seq extends smil_seq_or_par_1.SeqOrPar {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("smil:par|smil:seq"),
    xml_js_mapper_1.XmlItemType(smil_seq_or_par_1.SeqOrPar),
    tslib_1.__metadata("design:type", Array)
], Seq.prototype, "Children", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@epub:textref"),
    tslib_1.__metadata("design:type", String)
], Seq.prototype, "TextRef", void 0);
Seq = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    }),
    xml_js_mapper_1.XmlDiscriminatorValue("seq")
], Seq);
exports.Seq = Seq;
//# sourceMappingURL=smil-seq.js.map