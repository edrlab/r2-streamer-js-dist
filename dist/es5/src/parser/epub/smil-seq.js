"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var smil_seq_or_par_1 = require("./smil-seq-or-par");
var Seq = (function (_super) {
    __extends(Seq, _super);
    function Seq() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Seq;
}(smil_seq_or_par_1.SeqOrPar));
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