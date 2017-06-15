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
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let Audio = class Audio {
};
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@src"),
    __metadata("design:type", String)
], Audio.prototype, "Src", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@clipBegin"),
    __metadata("design:type", String)
], Audio.prototype, "ClipBegin", void 0);
__decorate([
    xml_js_mapper_1.XmlXPathSelector("@clipEnd"),
    __metadata("design:type", String)
], Audio.prototype, "ClipEnd", void 0);
Audio = __decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    })
], Audio);
exports.Audio = Audio;
//# sourceMappingURL=smil-audio.js.map