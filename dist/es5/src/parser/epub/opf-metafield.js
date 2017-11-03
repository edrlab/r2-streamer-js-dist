"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var Metafield = (function () {
    function Metafield() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("text()"),
        tslib_1.__metadata("design:type", String)
    ], Metafield.prototype, "Data", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@name"),
        tslib_1.__metadata("design:type", String)
    ], Metafield.prototype, "Name", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@content"),
        tslib_1.__metadata("design:type", String)
    ], Metafield.prototype, "Content", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@refines"),
        tslib_1.__metadata("design:type", String)
    ], Metafield.prototype, "Refine", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@property"),
        tslib_1.__metadata("design:type", String)
    ], Metafield.prototype, "Property", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@id | @xml:id"),
        tslib_1.__metadata("design:type", String)
    ], Metafield.prototype, "ID", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@lang | @xml:lang"),
        tslib_1.__metadata("design:type", String)
    ], Metafield.prototype, "Lang", void 0);
    Metafield = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
            xml: "http://www.w3.org/XML/1998/namespace",
        })
    ], Metafield);
    return Metafield;
}());
exports.Metafield = Metafield;
//# sourceMappingURL=opf-metafield.js.map