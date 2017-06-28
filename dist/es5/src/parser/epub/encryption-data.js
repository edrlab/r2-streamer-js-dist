"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var encryption_cypherdata_1 = require("./encryption-cypherdata");
var encryption_keyinfo_1 = require("./encryption-keyinfo");
var encryption_method_1 = require("./encryption-method");
var encryption_property_1 = require("./encryption-property");
var EncryptedData = (function () {
    function EncryptedData() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("enc:EncryptionMethod"),
        __metadata("design:type", encryption_method_1.EncryptionMethod)
    ], EncryptedData.prototype, "EncryptionMethod", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("ds:KeyInfo"),
        __metadata("design:type", encryption_keyinfo_1.KeyInfo)
    ], EncryptedData.prototype, "KeyInfo", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("enc:CipherData"),
        __metadata("design:type", encryption_cypherdata_1.CipherData)
    ], EncryptedData.prototype, "CipherData", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("enc:EncryptionProperties/enc:EncryptionProperty"),
        xml_js_mapper_1.XmlItemType(encryption_property_1.EncryptionProperty),
        __metadata("design:type", Array)
    ], EncryptedData.prototype, "EncryptionProperties", void 0);
    EncryptedData = __decorate([
        xml_js_mapper_1.XmlObject({
            ds: "http://www.w3.org/2000/09/xmldsig#",
            enc: "http://www.w3.org/2001/04/xmlenc#",
            encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
            ns: "http://www.idpf.org/2016/encryption#compression",
        })
    ], EncryptedData);
    return EncryptedData;
}());
exports.EncryptedData = EncryptedData;
//# sourceMappingURL=encryption-data.js.map