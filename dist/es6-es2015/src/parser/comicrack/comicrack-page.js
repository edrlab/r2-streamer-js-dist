"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
let Page = class Page {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Image"),
    tslib_1.__metadata("design:type", Number)
], Page.prototype, "Image", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Bookmark"),
    tslib_1.__metadata("design:type", String)
], Page.prototype, "Bookmark", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Type"),
    tslib_1.__metadata("design:type", String)
], Page.prototype, "Type", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@ImageSize"),
    tslib_1.__metadata("design:type", Number)
], Page.prototype, "ImageSize", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@ImageWidth"),
    tslib_1.__metadata("design:type", Number)
], Page.prototype, "ImageWidth", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@ImageHeight"),
    tslib_1.__metadata("design:type", Number)
], Page.prototype, "ImageHeight", void 0);
Page = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        xsd: "http://www.w3.org/2001/XMLSchema",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
    })
], Page);
exports.Page = Page;
//# sourceMappingURL=comicrack-page.js.map