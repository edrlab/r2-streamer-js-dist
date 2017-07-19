"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var Compression = (function () {
    function Compression() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@Method"),
        tslib_1.__metadata("design:type", String)
    ], Compression.prototype, "Method", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@OriginalLength"),
        tslib_1.__metadata("design:type", String)
    ], Compression.prototype, "OriginalLength", void 0);
    Compression = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            ds: "http://www.w3.org/2000/09/xmldsig#",
            enc: "http://www.w3.org/2001/04/xmlenc#",
            encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
            ns: "http://www.idpf.org/2016/encryption#compression",
        })
    ], Compression);
    return Compression;
}());
exports.Compression = Compression;
//# sourceMappingURL=encryption-compression.js.map