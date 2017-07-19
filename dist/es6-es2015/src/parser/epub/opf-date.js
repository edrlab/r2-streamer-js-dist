"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
let MetaDate = class MetaDate {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("text()"),
    tslib_1.__metadata("design:type", String)
], MetaDate.prototype, "Data", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@event"),
    tslib_1.__metadata("design:type", String)
], MetaDate.prototype, "Event", void 0);
MetaDate = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], MetaDate);
exports.MetaDate = MetaDate;
//# sourceMappingURL=opf-date.js.map