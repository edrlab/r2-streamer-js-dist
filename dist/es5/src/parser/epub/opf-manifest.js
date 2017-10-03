"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var Manifest = (function () {
    function Manifest() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@id"),
        tslib_1.__metadata("design:type", String)
    ], Manifest.prototype, "ID", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@href"),
        tslib_1.__metadata("design:type", String)
    ], Manifest.prototype, "Href", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@media-type"),
        tslib_1.__metadata("design:type", String)
    ], Manifest.prototype, "MediaType", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@media-fallback"),
        tslib_1.__metadata("design:type", String)
    ], Manifest.prototype, "Fallback", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@properties"),
        tslib_1.__metadata("design:type", String)
    ], Manifest.prototype, "Properties", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@media-overlay"),
        tslib_1.__metadata("design:type", String)
    ], Manifest.prototype, "MediaOverlay", void 0);
    Manifest = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], Manifest);
    return Manifest;
}());
exports.Manifest = Manifest;
//# sourceMappingURL=opf-manifest.js.map