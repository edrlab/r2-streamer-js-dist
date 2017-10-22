"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let Rootfile = class Rootfile {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@full-path"),
    tslib_1.__metadata("design:type", String)
], Rootfile.prototype, "Path", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@media-type"),
    tslib_1.__metadata("design:type", String)
], Rootfile.prototype, "Type", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@version"),
    tslib_1.__metadata("design:type", String)
], Rootfile.prototype, "Version", void 0);
Rootfile = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject()
], Rootfile);
exports.Rootfile = Rootfile;
//# sourceMappingURL=container-rootfile.js.map