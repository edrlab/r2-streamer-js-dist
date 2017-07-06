"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var Subject = (function () {
    function Subject() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("text()"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "Data", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@term"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "Term", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@authority"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "Authority", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@lang"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "Lang", void 0);
    Subject = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
        })
    ], Subject);
    return Subject;
}());
exports.Subject = Subject;
//# sourceMappingURL=opf-subject.js.map