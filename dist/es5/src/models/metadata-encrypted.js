"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_1 = require("ta-json");
var Encrypted = (function () {
    function Encrypted() {
    }
    tslib_1.__decorate([
        ta_json_1.JsonProperty("scheme"),
        tslib_1.__metadata("design:type", String)
    ], Encrypted.prototype, "Scheme", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("profile"),
        tslib_1.__metadata("design:type", String)
    ], Encrypted.prototype, "Profile", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("algorithm"),
        tslib_1.__metadata("design:type", String)
    ], Encrypted.prototype, "Algorithm", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("compression"),
        tslib_1.__metadata("design:type", String)
    ], Encrypted.prototype, "Compression", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("original-length"),
        tslib_1.__metadata("design:type", Number)
    ], Encrypted.prototype, "OriginalLength", void 0);
    Encrypted = tslib_1.__decorate([
        ta_json_1.JsonObject()
    ], Encrypted);
    return Encrypted;
}());
exports.Encrypted = Encrypted;
//# sourceMappingURL=metadata-encrypted.js.map