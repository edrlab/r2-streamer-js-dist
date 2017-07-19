"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var SpineItem = (function () {
    function SpineItem() {
    }
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
    return SpineItem;
}());
exports.SpineItem = SpineItem;
//# sourceMappingURL=opf-spineitem.js.map