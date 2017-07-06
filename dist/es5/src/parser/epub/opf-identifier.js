"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var Identifier = (function () {
    function Identifier() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("text()"),
        tslib_1.__metadata("design:type", String)
    ], Identifier.prototype, "Data", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@id"),
        tslib_1.__metadata("design:type", String)
    ], Identifier.prototype, "ID", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@scheme"),
        tslib_1.__metadata("design:type", String)
    ], Identifier.prototype, "Scheme", void 0);
    Identifier = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], Identifier);
    return Identifier;
}());
exports.Identifier = Identifier;
//# sourceMappingURL=opf-identifier.js.map