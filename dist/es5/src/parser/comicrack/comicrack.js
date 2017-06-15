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
var comicrack_page_1 = require("./comicrack-page");
var ComicInfo = (function () {
    function ComicInfo() {
    }
    return ComicInfo;
}());
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Title"),
    __metadata("design:type", String)
], ComicInfo.prototype, "Title", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Series"),
    __metadata("design:type", String)
], ComicInfo.prototype, "Series", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Volume"),
    __metadata("design:type", Number)
], ComicInfo.prototype, "Volume", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Number"),
    __metadata("design:type", Number)
], ComicInfo.prototype, "Number", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Writer"),
    __metadata("design:type", String)
], ComicInfo.prototype, "Writer", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Penciller"),
    __metadata("design:type", String)
], ComicInfo.prototype, "Penciller", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Inker"),
    __metadata("design:type", String)
], ComicInfo.prototype, "Inker", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Colorist"),
    __metadata("design:type", String)
], ComicInfo.prototype, "Colorist", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("ScanInformation"),
    __metadata("design:type", String)
], ComicInfo.prototype, "ScanInformation", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Summary"),
    __metadata("design:type", String)
], ComicInfo.prototype, "Summary", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Year"),
    __metadata("design:type", Number)
], ComicInfo.prototype, "Year", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("PageCount"),
    __metadata("design:type", Number)
], ComicInfo.prototype, "PageCount", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("Pages/Page"),
    xml_js_mapper_1.XmlItemType(comicrack_page_1.Page),
    __metadata("design:type", Array)
], ComicInfo.prototype, "Pages", void 0);
ComicInfo = __decorate([
    xml_js_mapper_1.XmlObject({
        xsd: "http://www.w3.org/2001/XMLSchema",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
    })
], ComicInfo);
exports.ComicInfo = ComicInfo;
//# sourceMappingURL=comicrack.js.map