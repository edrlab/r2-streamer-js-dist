"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const smil_seq_1 = require("./smil-seq");
let Body = class Body extends smil_seq_1.Seq {
    constructor() {
        super(...arguments);
        this.isBody = true;
    }
};
Body = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
    })
], Body);
exports.Body = Body;
//# sourceMappingURL=smil-body.js.map