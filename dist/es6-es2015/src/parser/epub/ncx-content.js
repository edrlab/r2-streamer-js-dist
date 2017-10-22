"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let Content = class Content {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@src"),
    tslib_1.__metadata("design:type", String)
], Content.prototype, "Src", void 0);
Content = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        ncx: "http://www.daisy.org/z3986/2005/ncx/",
    })
], Content);
exports.Content = Content;
//# sourceMappingURL=ncx-content.js.map