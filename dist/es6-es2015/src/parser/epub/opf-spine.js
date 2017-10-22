"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const opf_spineitem_1 = require("./opf-spineitem");
let Spine = class Spine {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@id"),
    tslib_1.__metadata("design:type", String)
], Spine.prototype, "ID", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@toc"),
    tslib_1.__metadata("design:type", String)
], Spine.prototype, "Toc", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@page-progression-direction"),
    tslib_1.__metadata("design:type", String)
], Spine.prototype, "PageProgression", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("opf:itemref"),
    xml_js_mapper_1.XmlItemType(opf_spineitem_1.SpineItem),
    tslib_1.__metadata("design:type", Array)
], Spine.prototype, "Items", void 0);
Spine = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], Spine);
exports.Spine = Spine;
//# sourceMappingURL=opf-spine.js.map