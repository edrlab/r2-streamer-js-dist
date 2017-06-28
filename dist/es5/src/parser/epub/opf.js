"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var opf_manifest_1 = require("./opf-manifest");
var opf_metadata_1 = require("./opf-metadata");
var opf_reference_1 = require("./opf-reference");
var opf_spine_1 = require("./opf-spine");
var OPF = (function () {
    function OPF() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:metadata"),
        __metadata("design:type", opf_metadata_1.Metadata)
    ], OPF.prototype, "Metadata", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:manifest/opf:item"),
        xml_js_mapper_1.XmlItemType(opf_manifest_1.Manifest),
        __metadata("design:type", Array)
    ], OPF.prototype, "Manifest", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:spine"),
        __metadata("design:type", opf_spine_1.Spine)
    ], OPF.prototype, "Spine", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:guide/opf:reference"),
        xml_js_mapper_1.XmlItemType(opf_reference_1.Reference),
        __metadata("design:type", Array)
    ], OPF.prototype, "Guide", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@unique-identifier"),
        __metadata("design:type", String)
    ], OPF.prototype, "UniqueIdentifier", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@dir"),
        __metadata("design:type", String)
    ], OPF.prototype, "Dir", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@version"),
        __metadata("design:type", String)
    ], OPF.prototype, "Version", void 0);
    OPF = __decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], OPF);
    return OPF;
}());
exports.OPF = OPF;
//# sourceMappingURL=opf.js.map