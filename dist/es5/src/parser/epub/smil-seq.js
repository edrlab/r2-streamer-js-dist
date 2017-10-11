"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var smil_seq_or_par_1 = require("./smil-seq-or-par");
var Seq = (function (_super) {
    tslib_1.__extends(Seq, _super);
    function Seq() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
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
    return Seq;
}(smil_seq_or_par_1.SeqOrPar));
exports.Seq = Seq;
//# sourceMappingURL=smil-seq.js.map