"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var smil_body_1 = require("./smil-body");
var smil_par_1 = require("./smil-par");
var SMIL = (function () {
    function SMIL() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("smil:body"),
        tslib_1.__metadata("design:type", smil_body_1.Body)
    ], SMIL.prototype, "Body", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dummy"),
        tslib_1.__metadata("design:type", smil_par_1.Par)
    ], SMIL.prototype, "Par", void 0);
    SMIL = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
        })
    ], SMIL);
    return SMIL;
}());
exports.SMIL = SMIL;
//# sourceMappingURL=smil.js.map