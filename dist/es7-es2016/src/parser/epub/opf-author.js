"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
let Author = class Author {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("text()"),
    tslib_1.__metadata("design:type", String)
], Author.prototype, "Data", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@file-as"),
    tslib_1.__metadata("design:type", String)
], Author.prototype, "FileAs", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@role"),
    tslib_1.__metadata("design:type", String)
], Author.prototype, "Role", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id"),
    tslib_1.__metadata("design:type", String)
], Author.prototype, "ID", void 0);
Author = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], Author);
exports.Author = Author;
//# sourceMappingURL=opf-author.js.map