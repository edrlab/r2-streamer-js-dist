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
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var ncx_content_1 = require("./ncx-content");
var PageTarget = (function () {
    function PageTarget() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("ncx:navLabel/ncx:text/text()"),
        __metadata("design:type", String)
    ], PageTarget.prototype, "Text", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@value"),
        __metadata("design:type", String)
    ], PageTarget.prototype, "Value", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@type"),
        __metadata("design:type", String)
    ], PageTarget.prototype, "Type", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@playOrder"),
        __metadata("design:type", Number)
    ], PageTarget.prototype, "PlayOrder", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@id"),
        __metadata("design:type", String)
    ], PageTarget.prototype, "ID", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("ncx:content"),
        __metadata("design:type", ncx_content_1.Content)
    ], PageTarget.prototype, "Content", void 0);
    PageTarget = __decorate([
        xml_js_mapper_1.XmlObject({
            ncx: "http://www.daisy.org/z3986/2005/ncx/",
        })
    ], PageTarget);
    return PageTarget;
}());
exports.PageTarget = PageTarget;
//# sourceMappingURL=ncx-pagetarget.js.map