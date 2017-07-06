"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var Rootfile = (function () {
    function Rootfile() {
    }
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
    return Rootfile;
}());
exports.Rootfile = Rootfile;
//# sourceMappingURL=container-rootfile.js.map