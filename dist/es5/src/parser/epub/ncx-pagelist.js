"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var ncx_pagetarget_1 = require("./ncx-pagetarget");
var PageList = (function () {
    function PageList() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("ncx:pageTarget"),
        xml_js_mapper_1.XmlItemType(ncx_pagetarget_1.PageTarget),
        tslib_1.__metadata("design:type", Array)
    ], PageList.prototype, "PageTarget", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@class"),
        tslib_1.__metadata("design:type", String)
    ], PageList.prototype, "Class", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@id"),
        tslib_1.__metadata("design:type", String)
    ], PageList.prototype, "ID", void 0);
    PageList = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            ncx: "http://www.daisy.org/z3986/2005/ncx/",
        })
    ], PageList);
    return PageList;
}());
exports.PageList = PageList;
//# sourceMappingURL=ncx-pagelist.js.map