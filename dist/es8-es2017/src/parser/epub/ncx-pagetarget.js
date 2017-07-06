"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const ncx_content_1 = require("./ncx-content");
let PageTarget = class PageTarget {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("ncx:navLabel/ncx:text/text()"),
    tslib_1.__metadata("design:type", String)
], PageTarget.prototype, "Text", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@value"),
    tslib_1.__metadata("design:type", String)
], PageTarget.prototype, "Value", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@type"),
    tslib_1.__metadata("design:type", String)
], PageTarget.prototype, "Type", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@playOrder"),
    tslib_1.__metadata("design:type", Number)
], PageTarget.prototype, "PlayOrder", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id"),
    tslib_1.__metadata("design:type", String)
], PageTarget.prototype, "ID", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("ncx:content"),
    tslib_1.__metadata("design:type", ncx_content_1.Content)
], PageTarget.prototype, "Content", void 0);
PageTarget = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        ncx: "http://www.daisy.org/z3986/2005/ncx/",
    })
], PageTarget);
exports.PageTarget = PageTarget;
//# sourceMappingURL=ncx-pagetarget.js.map