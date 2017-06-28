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
var Metafield = (function () {
    function Metafield() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("text()"),
        __metadata("design:type", String)
    ], Metafield.prototype, "Data", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@name"),
        __metadata("design:type", String)
    ], Metafield.prototype, "Name", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@content"),
        __metadata("design:type", String)
    ], Metafield.prototype, "Content", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@refines"),
        __metadata("design:type", String)
    ], Metafield.prototype, "Refine", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@property"),
        __metadata("design:type", String)
    ], Metafield.prototype, "Property", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@id"),
        __metadata("design:type", String)
    ], Metafield.prototype, "ID", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@lang"),
        __metadata("design:type", String)
    ], Metafield.prototype, "Lang", void 0);
    Metafield = __decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], Metafield);
    return Metafield;
}());
exports.Metafield = Metafield;
//# sourceMappingURL=opf-metafield.js.map