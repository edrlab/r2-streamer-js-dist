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
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const ncx_pagetarget_1 = require("./ncx-pagetarget");
let PageList = class PageList {
};
__decorate([
    xml_js_mapper_1.XmlXPathSelector("ncx:pageTarget"),
    xml_js_mapper_1.XmlItemType(ncx_pagetarget_1.PageTarget),
    __metadata("design:type", Array)
], PageList.prototype, "PageTarget", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@class"),
    __metadata("design:type", String)
], PageList.prototype, "Class", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id"),
    __metadata("design:type", String)
], PageList.prototype, "ID", void 0);
PageList = __decorate([
    xml_js_mapper_1.XmlObject({
        ncx: "http://www.daisy.org/z3986/2005/ncx/",
    })
], PageList);
exports.PageList = PageList;
//# sourceMappingURL=ncx-pagelist.js.map