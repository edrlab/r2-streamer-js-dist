"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var SeqOrPar = (function () {
    function SeqOrPar() {
    }
    SeqOrPar = __decorate([
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