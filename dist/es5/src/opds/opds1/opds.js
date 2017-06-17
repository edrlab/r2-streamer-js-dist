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
var opds_author_1 = require("./opds-author");
var opds_entry_1 = require("./opds-entry");
var opds_link_1 = require("./opds-link");
var OPDS = (function () {
    function OPDS() {
    }
    return OPDS;
}());
__decorate([
    xml_js_mapper_1.XmlXPathSelector("opensearch:totalResults/text()"),
    __metadata("design:type", Number)
], OPDS.prototype, "OpensearchTotalResults", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("opensearch:itemsPerPage/text()"),
    __metadata("design:type", Number)
], OPDS.prototype, "OpensearchItemsPerPage", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:id/text()"),
    __metadata("design:type", String)
], OPDS.prototype, "Id", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:title/text()"),
    __metadata("design:type", String)
], OPDS.prototype, "Title", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:subtitle/text()"),
    __metadata("design:type", String)
], OPDS.prototype, "SubTitle", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:updated/text()"),
    xml_js_mapper_1.XmlConverter(xml_js_mapper_1.DateConverter),
    __metadata("design:type", Date)
], OPDS.prototype, "Updated", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:icon/text()"),
    __metadata("design:type", String)
], OPDS.prototype, "Icon", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:author"),
    xml_js_mapper_1.XmlItemType(opds_author_1.Author),
    __metadata("design:type", Array)
], OPDS.prototype, "Authors", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@lang"),
    __metadata("design:type", String)
], OPDS.prototype, "Lang", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:link"),
    xml_js_mapper_1.XmlItemType(opds_link_1.Link),
    __metadata("design:type", Array)
], OPDS.prototype, "Links", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:entry"),
    xml_js_mapper_1.XmlItemType(opds_entry_1.Entry),
    __metadata("design:type", Array)
], OPDS.prototype, "Entries", void 0);
OPDS = __decorate([
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
], OPDS);
exports.OPDS = OPDS;
//# sourceMappingURL=opds.js.map