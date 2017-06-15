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
let Title = class Title {
};
__decorate([
    xml_js_mapper_1.XmlXPathSelector("text()"),
    __metadata("design:type", String)
], Title.prototype, "Data", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id"),
    __metadata("design:type", String)
], Title.prototype, "ID", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@lang"),
    __metadata("design:type", String)
], Title.prototype, "Lang", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@dir"),
    __metadata("design:type", String)
], Title.prototype, "Dir", void 0);
Title = __decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], Title);
exports.Title = Title;
//# sourceMappingURL=opf-title.js.map