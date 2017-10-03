"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var ncx_navpoint_1 = require("./ncx-navpoint");
var ncx_pagelist_1 = require("./ncx-pagelist");
var NCX = (function () {
    function NCX() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("ncx:navMap/ncx:navPoint"),
        xml_js_mapper_1.XmlItemType(ncx_navpoint_1.NavPoint),
        tslib_1.__metadata("design:type", Array)
    ], NCX.prototype, "Points", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("ncx:pageList"),
        tslib_1.__metadata("design:type", ncx_pagelist_1.PageList)
    ], NCX.prototype, "PageList", void 0);
    NCX = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            ncx: "http://www.daisy.org/z3986/2005/ncx/",
        })
    ], NCX);
    return NCX;
}());
exports.NCX = NCX;
//# sourceMappingURL=ncx.js.map