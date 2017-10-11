"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var opds_author_1 = require("./opds-author");
var opds_entry_1 = require("./opds-entry");
var opds_link_1 = require("./opds-link");
var OPDS = (function () {
    function OPDS() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("opensearch:totalResults/text()"),
        tslib_1.__metadata("design:type", Number)
    ], OPDS.prototype, "OpensearchTotalResults", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("opensearch:itemsPerPage/text()"),
        tslib_1.__metadata("design:type", Number)
    ], OPDS.prototype, "OpensearchItemsPerPage", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:id/text()"),
        tslib_1.__metadata("design:type", String)
    ], OPDS.prototype, "Id", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:title/text()"),
        tslib_1.__metadata("design:type", String)
    ], OPDS.prototype, "Title", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:subtitle/text()"),
        tslib_1.__metadata("design:type", String)
    ], OPDS.prototype, "SubTitle", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:updated/text()"),
        tslib_1.__metadata("design:type", Date)
    ], OPDS.prototype, "Updated", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:icon/text()"),
        tslib_1.__metadata("design:type", String)
    ], OPDS.prototype, "Icon", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:author"),
        xml_js_mapper_1.XmlItemType(opds_author_1.Author),
        tslib_1.__metadata("design:type", Array)
    ], OPDS.prototype, "Authors", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@lang"),
        tslib_1.__metadata("design:type", String)
    ], OPDS.prototype, "Lang", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:link"),
        xml_js_mapper_1.XmlItemType(opds_link_1.Link),
        tslib_1.__metadata("design:type", Array)
    ], OPDS.prototype, "Links", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("atom:entry"),
        xml_js_mapper_1.XmlItemType(opds_entry_1.Entry),
        tslib_1.__metadata("design:type", Array)
    ], OPDS.prototype, "Entries", void 0);
    OPDS = tslib_1.__decorate([
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
    return OPDS;
}());
exports.OPDS = OPDS;
//# sourceMappingURL=opds.js.map