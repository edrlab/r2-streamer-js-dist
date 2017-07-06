"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let Reference = class Reference {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@href"),
    tslib_1.__metadata("design:type", String)
], Reference.prototype, "Href", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@title"),
    tslib_1.__metadata("design:type", String)
], Reference.prototype, "Title", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@type"),
    tslib_1.__metadata("design:type", String)
], Reference.prototype, "Type", void 0);
Reference = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], Reference);
exports.Reference = Reference;
//# sourceMappingURL=opf-reference.js.map