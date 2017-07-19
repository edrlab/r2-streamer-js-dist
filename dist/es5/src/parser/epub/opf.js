"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var opf_manifest_1 = require("./opf-manifest");
var opf_metadata_1 = require("./opf-metadata");
var opf_reference_1 = require("./opf-reference");
var opf_spine_1 = require("./opf-spine");
var OPF = (function () {
    function OPF() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:metadata"),
        tslib_1.__metadata("design:type", opf_metadata_1.Metadata)
    ], OPF.prototype, "Metadata", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:manifest/opf:item"),
        xml_js_mapper_1.XmlItemType(opf_manifest_1.Manifest),
        tslib_1.__metadata("design:type", Array)
    ], OPF.prototype, "Manifest", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:spine"),
        tslib_1.__metadata("design:type", opf_spine_1.Spine)
    ], OPF.prototype, "Spine", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:guide/opf:reference"),
        xml_js_mapper_1.XmlItemType(opf_reference_1.Reference),
        tslib_1.__metadata("design:type", Array)
    ], OPF.prototype, "Guide", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@unique-identifier"),
        tslib_1.__metadata("design:type", String)
    ], OPF.prototype, "UniqueIdentifier", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@dir"),
        tslib_1.__metadata("design:type", String)
    ], OPF.prototype, "Dir", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@version"),
        tslib_1.__metadata("design:type", String)
    ], OPF.prototype, "Version", void 0);
    OPF = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], OPF);
    return OPF;
}());
exports.OPF = OPF;
//# sourceMappingURL=opf.js.map