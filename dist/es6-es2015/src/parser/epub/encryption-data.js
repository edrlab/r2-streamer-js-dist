"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
const encryption_cypherdata_1 = require("./encryption-cypherdata");
const encryption_keyinfo_1 = require("./encryption-keyinfo");
const encryption_method_1 = require("./encryption-method");
const encryption_property_1 = require("./encryption-property");
let EncryptedData = class EncryptedData {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("enc:EncryptionMethod"),
    tslib_1.__metadata("design:type", encryption_method_1.EncryptionMethod)
], EncryptedData.prototype, "EncryptionMethod", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("ds:KeyInfo"),
    tslib_1.__metadata("design:type", encryption_keyinfo_1.KeyInfo)
], EncryptedData.prototype, "KeyInfo", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("enc:CipherData"),
    tslib_1.__metadata("design:type", encryption_cypherdata_1.CipherData)
], EncryptedData.prototype, "CipherData", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("enc:EncryptionProperties/enc:EncryptionProperty"),
    xml_js_mapper_1.XmlItemType(encryption_property_1.EncryptionProperty),
    tslib_1.__metadata("design:type", Array)
], EncryptedData.prototype, "EncryptionProperties", void 0);
EncryptedData = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        ds: "http://www.w3.org/2000/09/xmldsig#",
        enc: "http://www.w3.org/2001/04/xmlenc#",
        encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
        ns: "http://www.idpf.org/2016/encryption#compression",
    })
], EncryptedData);
exports.EncryptedData = EncryptedData;
//# sourceMappingURL=encryption-data.js.map