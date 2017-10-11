"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
let RetrievalMethod = class RetrievalMethod {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@URI"),
    tslib_1.__metadata("design:type", String)
], RetrievalMethod.prototype, "URI", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Type"),
    tslib_1.__metadata("design:type", String)
], RetrievalMethod.prototype, "Type", void 0);
RetrievalMethod = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        ds: "http://www.w3.org/2000/09/xmldsig#",
        enc: "http://www.w3.org/2001/04/xmlenc#",
        encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
        ns: "http://www.idpf.org/2016/encryption#compression",
    })
], RetrievalMethod);
exports.RetrievalMethod = RetrievalMethod;
//# sourceMappingURL=encryption-retrievalmethod.js.map