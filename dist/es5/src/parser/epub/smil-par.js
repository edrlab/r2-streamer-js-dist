"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var smil_audio_1 = require("./smil-audio");
var smil_seq_or_par_1 = require("./smil-seq-or-par");
var smil_text_1 = require("./smil-text");
var Par = (function (_super) {
    tslib_1.__extends(Par, _super);
    function Par() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("smil:text"),
        tslib_1.__metadata("design:type", smil_text_1.Text)
    ], Par.prototype, "Text", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("smil:audio"),
        tslib_1.__metadata("design:type", smil_audio_1.Audio)
    ], Par.prototype, "Audio", void 0);
    Par = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
        }),
        xml_js_mapper_1.XmlDiscriminatorValue("par")
    ], Par);
    return Par;
}(smil_seq_or_par_1.SeqOrPar));
exports.Par = Par;
//# sourceMappingURL=smil-par.js.map