"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let Audio = class Audio {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@src"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "Src", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@clipBegin"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "ClipBegin", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@clipEnd"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "ClipEnd", void 0);
Audio = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    })
], Audio);
exports.Audio = Audio;
//# sourceMappingURL=smil-audio.js.map