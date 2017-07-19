"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var opf_spineitem_1 = require("./opf-spineitem");
var Spine = (function () {
    function Spine() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@id"),
        tslib_1.__metadata("design:type", String)
    ], Spine.prototype, "ID", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@toc"),
        tslib_1.__metadata("design:type", String)
    ], Spine.prototype, "Toc", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@page-progression-direction"),
        tslib_1.__metadata("design:type", String)
    ], Spine.prototype, "PageProgression", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:itemref"),
        xml_js_mapper_1.XmlItemType(opf_spineitem_1.SpineItem),
        tslib_1.__metadata("design:type", Array)
    ], Spine.prototype, "Items", void 0);
    Spine = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], Spine);
    return Spine;
}());
exports.Spine = Spine;
//# sourceMappingURL=opf-spine.js.map