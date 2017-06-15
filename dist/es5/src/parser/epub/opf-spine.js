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
var opf_spineitem_1 = require("./opf-spineitem");
var Spine = (function () {
    function Spine() {
    }
    return Spine;
}());
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id"),
    __metadata("design:type", String)
], Spine.prototype, "ID", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@toc"),
    __metadata("design:type", String)
], Spine.prototype, "Toc", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@page-progression-direction"),
    __metadata("design:type", String)
], Spine.prototype, "PageProgression", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("opf:itemref"),
    xml_js_mapper_1.XmlItemType(opf_spineitem_1.SpineItem),
    __metadata("design:type", Array)
], Spine.prototype, "Items", void 0);
Spine = __decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], Spine);
exports.Spine = Spine;
//# sourceMappingURL=opf-spine.js.map