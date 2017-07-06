"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let SpineItem = class SpineItem {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@idref"),
    tslib_1.__metadata("design:type", String)
], SpineItem.prototype, "IDref", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@linear"),
    tslib_1.__metadata("design:type", String)
], SpineItem.prototype, "Linear", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id"),
    tslib_1.__metadata("design:type", String)
], SpineItem.prototype, "ID", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@properties"),
    tslib_1.__metadata("design:type", String)
], SpineItem.prototype, "Properties", void 0);
SpineItem = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], SpineItem);
exports.SpineItem = SpineItem;
//# sourceMappingURL=opf-spineitem.js.map