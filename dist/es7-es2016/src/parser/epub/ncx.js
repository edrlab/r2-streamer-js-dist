"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const ncx_navpoint_1 = require("./ncx-navpoint");
const ncx_pagelist_1 = require("./ncx-pagelist");
let NCX = class NCX {
};
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
exports.NCX = NCX;
//# sourceMappingURL=ncx.js.map