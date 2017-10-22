"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const encryption_data_1 = require("./encryption-data");
let Encryption = class Encryption {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("enc:EncryptedData"),
    xml_js_mapper_1.XmlItemType(encryption_data_1.EncryptedData),
    tslib_1.__metadata("design:type", Array)
], Encryption.prototype, "EncryptedData", void 0);
Encryption = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        ds: "http://www.w3.org/2000/09/xmldsig#",
        enc: "http://www.w3.org/2001/04/xmlenc#",
        encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
        ns: "http://www.idpf.org/2016/encryption#compression",
    })
], Encryption);
exports.Encryption = Encryption;
//# sourceMappingURL=encryption.js.map