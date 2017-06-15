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
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var smil_body_1 = require("./smil-body");
var smil_par_1 = require("./smil-par");
var SMIL = (function () {
    function SMIL() {
    }
    return SMIL;
}());
__decorate([
    xml_js_mapper_1.XmlXPathSelector("smil:body"),
    __metadata("design:type", smil_body_1.Body)
], SMIL.prototype, "Body", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("dummy"),
    __metadata("design:type", smil_par_1.Par)
], SMIL.prototype, "Par", void 0);
SMIL = __decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    })
], SMIL);
exports.SMIL = SMIL;
//# sourceMappingURL=smil.js.map