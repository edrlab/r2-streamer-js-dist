"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
const opf_manifest_1 = require("./opf-manifest");
const opf_metadata_1 = require("./opf-metadata");
const opf_reference_1 = require("./opf-reference");
const opf_spine_1 = require("./opf-spine");
let OPF = class OPF {
};
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
exports.OPF = OPF;
//# sourceMappingURL=opf.js.map