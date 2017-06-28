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
var encryption_cypherreference_1 = require("./encryption-cypherreference");
var CipherData = (function () {
    function CipherData() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("enc:CipherReference"),
        __metadata("design:type", encryption_cypherreference_1.CipherReference)
    ], CipherData.prototype, "CipherReference", void 0);
    CipherData = __decorate([
        xml_js_mapper_1.XmlObject({
            ds: "http://www.w3.org/2000/09/xmldsig#",
            enc: "http://www.w3.org/2001/04/xmlenc#",
            encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
            ns: "http://www.idpf.org/2016/encryption#compression",
        })
    ], CipherData);
    return CipherData;
}());
exports.CipherData = CipherData;
//# sourceMappingURL=encryption-cypherdata.js.map