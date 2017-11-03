"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let Title = class Title {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("text()"),
    tslib_1.__metadata("design:type", String)
], Title.prototype, "Data", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id | @xml:id"),
    tslib_1.__metadata("design:type", String)
], Title.prototype, "ID", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@lang | @xml:lang"),
    tslib_1.__metadata("design:type", String)
], Title.prototype, "Lang", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@dir"),
    tslib_1.__metadata("design:type", String)
], Title.prototype, "Dir", void 0);
Title = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
        xml: "http://www.w3.org/XML/1998/namespace",
    })
], Title);
exports.Title = Title;
//# sourceMappingURL=opf-title.js.map