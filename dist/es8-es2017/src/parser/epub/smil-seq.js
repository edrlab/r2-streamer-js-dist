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
const smil_seq_or_par_1 = require("./smil-seq-or-par");
let Seq = class Seq extends smil_seq_or_par_1.SeqOrPar {
};
__decorate([
    xml_js_mapper_1.XmlXPathSelector("smil:par|smil:seq"),
    xml_js_mapper_1.XmlItemType(smil_seq_or_par_1.SeqOrPar),
    __metadata("design:type", Array)
], Seq.prototype, "Children", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@epub:textref"),
    __metadata("design:type", String)
], Seq.prototype, "TextRef", void 0);
Seq = __decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    }),
    xml_js_mapper_1.XmlDiscriminatorValue("seq")
], Seq);
exports.Seq = Seq;
//# sourceMappingURL=smil-seq.js.map