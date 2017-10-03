"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_1 = require("ta-json");
var metadata_encrypted_1 = require("./metadata-encrypted");
var Properties = (function () {
    function Properties() {
    }
    tslib_1.__decorate([
        ta_json_1.JsonProperty("contains"),
        ta_json_1.JsonElementType(String),
        tslib_1.__metadata("design:type", Array)
    ], Properties.prototype, "Contains", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("layout"),
        tslib_1.__metadata("design:type", String)
    ], Properties.prototype, "Layout", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("media-overlay"),
        tslib_1.__metadata("design:type", String)
    ], Properties.prototype, "MediaOverlay", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("orientation"),
        tslib_1.__metadata("design:type", String)
    ], Properties.prototype, "Orientation", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("overflow"),
        tslib_1.__metadata("design:type", String)
    ], Properties.prototype, "Overflow", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("page"),
        tslib_1.__metadata("design:type", String)
    ], Properties.prototype, "Page", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("spread"),
        tslib_1.__metadata("design:type", String)
    ], Properties.prototype, "Spread", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("encrypted"),
        tslib_1.__metadata("design:type", metadata_encrypted_1.Encrypted)
    ], Properties.prototype, "Encrypted", void 0);
    Properties = tslib_1.__decorate([
        ta_json_1.JsonObject()
    ], Properties);
    return Properties;
}());
exports.Properties = Properties;
//# sourceMappingURL=metadata-properties.js.map