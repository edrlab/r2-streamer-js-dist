"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
const opf_author_1 = require("./opf-author");
const opf_date_1 = require("./opf-date");
const opf_identifier_1 = require("./opf-identifier");
const opf_metafield_1 = require("./opf-metafield");
const opf_subject_1 = require("./opf-subject");
const opf_title_1 = require("./opf-title");
let Metadata = class Metadata {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:title"),
    xml_js_mapper_1.XmlItemType(opf_title_1.Title),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Title", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:language/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Language", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:identifier"),
    xml_js_mapper_1.XmlItemType(opf_identifier_1.Identifier),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Identifier", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:creator"),
    xml_js_mapper_1.XmlItemType(opf_author_1.Author),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Creator", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:subject"),
    xml_js_mapper_1.XmlItemType(opf_subject_1.Subject),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Subject", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:description/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Description", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:publisher/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Publisher", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:contributor"),
    xml_js_mapper_1.XmlItemType(opf_author_1.Author),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Contributor", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:date"),
    xml_js_mapper_1.XmlItemType(opf_date_1.MetaDate),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Date", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:type/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Type", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:format/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Format", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:source/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Source", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:relation/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Relation", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:coverage/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Coverage", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("dc:rights/text()"),
    xml_js_mapper_1.XmlItemType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Rights", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("opf:meta"),
    xml_js_mapper_1.XmlItemType(opf_metafield_1.Metafield),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Meta", void 0);
Metadata = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], Metadata);
exports.Metadata = Metadata;
//# sourceMappingURL=opf-metadata.js.map