"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var smil_seq_1 = require("./smil-seq");
var Body = (function (_super) {
    tslib_1.__extends(Body, _super);
    function Body() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isBody = true;
        return _this;
    }
    Body = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
        })
    ], Body);
    return Body;
}(smil_seq_1.Seq));
exports.Body = Body;
//# sourceMappingURL=smil-body.js.map