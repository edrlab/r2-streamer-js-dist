"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
const encryption_compression_1 = require("./encryption-compression");
let EncryptionProperty = class EncryptionProperty {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("ns:Compression"),
    tslib_1.__metadata("design:type", encryption_compression_1.Compression)
], EncryptionProperty.prototype, "Compression", void 0);
EncryptionProperty = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        ds: "http://www.w3.org/2000/09/xmldsig#",
        enc: "http://www.w3.org/2001/04/xmlenc#",
        encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
        ns: "http://www.idpf.org/2016/encryption#compression",
    })
], EncryptionProperty);
exports.EncryptionProperty = EncryptionProperty;
//# sourceMappingURL=encryption-property.js.map