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
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const opds_author_1 = require("./opds-author");
const opds_category_1 = require("./opds-category");
const opds_link_1 = require("./opds-link");
let Entry = class Entry {
};
__decorate([
    xml_js_mapper_1.XmlXPathSelector("schema:Rating/@schema:ratingValue"),
    __metadata("design:type", String)
], Entry.prototype, "SchemaRatingValue", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("schema:Rating/@schema:additionalType"),
    __metadata("design:type", String)
], Entry.prototype, "SchemaRatingAdditionalType", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@schema:additionalType"),
    __metadata("design:type", String)
], Entry.prototype, "SchemaAdditionalType", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:title/text()"),
    __metadata("design:type", String)
], Entry.prototype, "Title", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:author"),
    xml_js_mapper_1.XmlItemType(opds_author_1.Author),
    __metadata("design:type", Array)
], Entry.prototype, "Authors", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:id/text()"),
    __metadata("design:type", String)
], Entry.prototype, "Id", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:summary/text()"),
    __metadata("design:type", String)
], Entry.prototype, "Summary", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:summary/@type"),
    __metadata("design:type", String)
], Entry.prototype, "SummaryType", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("dcterms:language/text()"),
    __metadata("design:type", String)
], Entry.prototype, "DcLanguage", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("dcterms:extent/text()"),
    __metadata("design:type", String)
], Entry.prototype, "DcExtent", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("dcterms:publisher/text()"),
    __metadata("design:type", String)
], Entry.prototype, "DcPublisher", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("dcterms:issued/text()"),
    __metadata("design:type", String)
], Entry.prototype, "DcIssued", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("dcterms:identifier/text()"),
    __metadata("design:type", String)
], Entry.prototype, "DcIdentifier", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("dcterms:identifier/@xsi:type"),
    __metadata("design:type", String)
], Entry.prototype, "DcIdentifierType", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("bibframe:distribution/@bibframe:ProviderName"),
    __metadata("design:type", String)
], Entry.prototype, "BibFrameDistributionProviderName", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:category"),
    xml_js_mapper_1.XmlItemType(opds_category_1.Category),
    __metadata("design:type", Array)
], Entry.prototype, "Categories", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:content/text()"),
    __metadata("design:type", String)
], Entry.prototype, "Content", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:content/@type"),
    __metadata("design:type", String)
], Entry.prototype, "ContentType", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:updated/text()"),
    xml_js_mapper_1.XmlConverter(xml_js_mapper_1.DateConverter),
    __metadata("design:type", Date)
], Entry.prototype, "Updated", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:published/text()"),
    xml_js_mapper_1.XmlConverter(xml_js_mapper_1.DateConverter),
    __metadata("design:type", Date)
], Entry.prototype, "Published", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:link"),
    xml_js_mapper_1.XmlItemType(opds_link_1.Link),
    __metadata("design:type", Array)
], Entry.prototype, "Links", void 0);
Entry = __decorate([
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
], Entry);
exports.Entry = Entry;
//# sourceMappingURL=opds-entry.js.map