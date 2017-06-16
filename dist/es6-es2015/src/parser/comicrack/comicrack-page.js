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
let Page = class Page {
};
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Image"),
    __metadata("design:type", Number)
], Page.prototype, "Image", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Bookmark"),
    __metadata("design:type", String)
], Page.prototype, "Bookmark", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Type"),
    __metadata("design:type", String)
], Page.prototype, "Type", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@ImageSize"),
    __metadata("design:type", Number)
], Page.prototype, "ImageSize", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@ImageWidth"),
    __metadata("design:type", Number)
], Page.prototype, "ImageWidth", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@ImageHeight"),
    __metadata("design:type", Number)
], Page.prototype, "ImageHeight", void 0);
Page = __decorate([
    xml_js_mapper_1.XmlObject({
        xsd: "http://www.w3.org/2001/XMLSchema",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
    })
], Page);
exports.Page = Page;
//# sourceMappingURL=comicrack-page.js.map