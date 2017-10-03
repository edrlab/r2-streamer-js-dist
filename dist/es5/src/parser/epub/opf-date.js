"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var MetaDate = (function () {
    function MetaDate() {
    }
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
    return MetaDate;
}());
exports.MetaDate = MetaDate;
//# sourceMappingURL=opf-date.js.map