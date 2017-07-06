"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const comicrack_page_1 = require("./comicrack-page");
let ComicInfo = class ComicInfo {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Title"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "Title", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Series"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "Series", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Volume"),
    tslib_1.__metadata("design:type", Number)
], ComicInfo.prototype, "Volume", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Number"),
    tslib_1.__metadata("design:type", Number)
], ComicInfo.prototype, "Number", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Writer"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "Writer", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Penciller"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "Penciller", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Inker"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "Inker", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Colorist"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "Colorist", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("ScanInformation"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "ScanInformation", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Summary"),
    tslib_1.__metadata("design:type", String)
], ComicInfo.prototype, "Summary", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Year"),
    tslib_1.__metadata("design:type", Number)
], ComicInfo.prototype, "Year", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("PageCount"),
    tslib_1.__metadata("design:type", Number)
], ComicInfo.prototype, "PageCount", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("Pages/Page"),
    xml_js_mapper_1.XmlItemType(comicrack_page_1.Page),
    tslib_1.__metadata("design:type", Array)
], ComicInfo.prototype, "Pages", void 0);
ComicInfo = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        xsd: "http://www.w3.org/2001/XMLSchema",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
    })
], ComicInfo);
exports.ComicInfo = ComicInfo;
//# sourceMappingURL=comicrack.js.map