"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var Content = (function () {
    function Content() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@src"),
        tslib_1.__metadata("design:type", String)
    ], Content.prototype, "Src", void 0);
    Content = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            ncx: "http://www.daisy.org/z3986/2005/ncx/",
        })
    ], Content);
    return Content;
}());
exports.Content = Content;
//# sourceMappingURL=ncx-content.js.map