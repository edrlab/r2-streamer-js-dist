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
var IndirectAcquisition = IndirectAcquisition_1 = (function () {
    function IndirectAcquisition() {
    }
    return IndirectAcquisition;
}());
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@type"),
    __metadata("design:type", String)
], IndirectAcquisition.prototype, "OpdsIndirectAcquisitionType", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("opds:indirectAcquisition"),
    xml_js_mapper_1.XmlItemType(IndirectAcquisition_1),
    __metadata("design:type", Array)
], IndirectAcquisition.prototype, "OpdsIndirectAcquisitions", void 0);
IndirectAcquisition = IndirectAcquisition_1 = __decorate([
    xml_js_mapper_1.XmlObject({
        app: "http://www.w3.org/2007/app",
        atom: "http://www.w3.org/2005/Atom",
        bibframe: "http://bibframe.org/vocab/",
        dcterms: "http://purl.org/dc/terms/",
        odl: "http://opds-spec.org/odl",
        opds: "http://opds-spec.org/2010/catalog",
        opensearch: "http://a9.com/-/spec/opensearch/1.1/",
        relevance: "http://a9.com/-/opensearch/extensions/relevance/1.0/",
        schema: "http://schema.org",
        thr: "http://purl.org/syndication/thread/1.0",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
    })
], IndirectAcquisition);
exports.IndirectAcquisition = IndirectAcquisition;
var IndirectAcquisition_1;
//# sourceMappingURL=opds-indirectAcquisition.js.map