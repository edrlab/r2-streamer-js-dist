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
var opf_author_1 = require("./opf-author");
var opf_date_1 = require("./opf-date");
var opf_identifier_1 = require("./opf-identifier");
var opf_metafield_1 = require("./opf-metafield");
var opf_subject_1 = require("./opf-subject");
var opf_title_1 = require("./opf-title");
var Metadata = (function () {
    function Metadata() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:title"),
        xml_js_mapper_1.XmlItemType(opf_title_1.Title),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Title", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:language/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Language", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:identifier"),
        xml_js_mapper_1.XmlItemType(opf_identifier_1.Identifier),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Identifier", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:creator"),
        xml_js_mapper_1.XmlItemType(opf_author_1.Author),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Creator", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:subject"),
        xml_js_mapper_1.XmlItemType(opf_subject_1.Subject),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Subject", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:description/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Description", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:publisher/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Publisher", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:contributor"),
        xml_js_mapper_1.XmlItemType(opf_author_1.Author),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Contributor", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:date"),
        xml_js_mapper_1.XmlItemType(opf_date_1.MetaDate),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Date", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:type/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Type", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:format/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Format", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:source/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Source", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:relation/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Relation", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:coverage/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Coverage", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:rights/text()"),
        xml_js_mapper_1.XmlItemType(String),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Rights", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("opf:meta"),
        xml_js_mapper_1.XmlItemType(opf_metafield_1.Metafield),
        __metadata("design:type", Array)
    ], Metadata.prototype, "Meta", void 0);
    Metadata = __decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], Metadata);
    return Metadata;
}());
exports.Metadata = Metadata;
//# sourceMappingURL=opf-metadata.js.map