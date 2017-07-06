"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var CipherReference = (function () {
    function CipherReference() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("@URI"),
        tslib_1.__metadata("design:type", String)
    ], CipherReference.prototype, "URI", void 0);
    CipherReference = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            ds: "http://www.w3.org/2000/09/xmldsig#",
            enc: "http://www.w3.org/2001/04/xmlenc#",
            encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
            ns: "http://www.idpf.org/2016/encryption#compression",
        })
    ], CipherReference);
    return CipherReference;
}());
exports.CipherReference = CipherReference;
//# sourceMappingURL=encryption-cypherreference.js.map