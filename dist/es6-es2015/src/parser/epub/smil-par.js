"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const smil_audio_1 = require("./smil-audio");
const smil_seq_or_par_1 = require("./smil-seq-or-par");
const smil_text_1 = require("./smil-text");
let Par = class Par extends smil_seq_or_par_1.SeqOrPar {
};
__decorate([
    xml_js_mapper_1.XmlXPathSelector("smil:text"),
    __metadata("design:type", smil_text_1.Text)
], Par.prototype, "Text", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("smil:audio"),
    __metadata("design:type", smil_audio_1.Audio)
], Par.prototype, "Audio", void 0);
Par = __decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    }),
    xml_js_mapper_1.XmlDiscriminatorValue("par")
], Par);
exports.Par = Par;
//# sourceMappingURL=smil-par.js.map