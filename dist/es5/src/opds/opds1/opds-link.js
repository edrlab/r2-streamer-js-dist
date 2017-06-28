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
var opds_indirectAcquisition_1 = require("./opds-indirectAcquisition");
var Link = (function () {
    function Link() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opds:price/text()"),
        __metadata("design:type", Number)
    ], Link.prototype, "OpdsPrice", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opds:price/@currencycode"),
        __metadata("design:type", String)
    ], Link.prototype, "OpdsPriceCurrencyCode", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opds:indirectAcquisition"),
        xml_js_mapper_1.XmlItemType(opds_indirectAcquisition_1.IndirectAcquisition),
        __metadata("design:type", Array)
    ], Link.prototype, "OpdsIndirectAcquisitions", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@type"),
        __metadata("design:type", String)
    ], Link.prototype, "Type", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@thr:count"),
        __metadata("design:type", Number)
    ], Link.prototype, "ThrCount", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@opds:facetGroup"),
        __metadata("design:type", String)
    ], Link.prototype, "FacetGroup", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@href"),
        __metadata("design:type", String)
    ], Link.prototype, "Href", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@rel"),
        __metadata("design:type", String)
    ], Link.prototype, "Rel", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@title"),
        __metadata("design:type", String)
    ], Link.prototype, "Title", void 0);
    Link = __decorate([
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
    ], Link);
    return Link;
}());
exports.Link = Link;
//# sourceMappingURL=opds-link.js.map