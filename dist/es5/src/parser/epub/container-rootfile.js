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
var Rootfile = (function () {
    function Rootfile() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@full-path"),
        __metadata("design:type", String)
    ], Rootfile.prototype, "Path", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@media-type"),
        __metadata("design:type", String)
    ], Rootfile.prototype, "Type", void 0);
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("@version"),
        __metadata("design:type", String)
    ], Rootfile.prototype, "Version", void 0);
    Rootfile = __decorate([
        xml_js_mapper_1.XmlObject()
    ], Rootfile);
    return Rootfile;
}());
exports.Rootfile = Rootfile;
//# sourceMappingURL=container-rootfile.js.map