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
var ta_json_1 = require("ta-json");
var metadata_encrypted_1 = require("./metadata-encrypted");
var Properties = (function () {
    function Properties() {
    }
    __decorate([
        ta_json_1.JsonProperty("contains"),
        ta_json_1.JsonElementType(String),
        __metadata("design:type", Array)
    ], Properties.prototype, "Contains", void 0);
    __decorate([
        ta_json_1.JsonProperty("layout"),
        __metadata("design:type", String)
    ], Properties.prototype, "Layout", void 0);
    __decorate([
        ta_json_1.JsonProperty("media-overlay"),
        __metadata("design:type", String)
    ], Properties.prototype, "MediaOverlay", void 0);
    __decorate([
        ta_json_1.JsonProperty("orientation"),
        __metadata("design:type", String)
    ], Properties.prototype, "Orientation", void 0);
    __decorate([
        ta_json_1.JsonProperty("overflow"),
        __metadata("design:type", String)
    ], Properties.prototype, "Overflow", void 0);
    __decorate([
        ta_json_1.JsonProperty("page"),
        __metadata("design:type", String)
    ], Properties.prototype, "Page", void 0);
    __decorate([
        ta_json_1.JsonProperty("spread"),
        __metadata("design:type", String)
    ], Properties.prototype, "Spread", void 0);
    __decorate([
        ta_json_1.JsonProperty("encrypted"),
        __metadata("design:type", metadata_encrypted_1.Encrypted)
    ], Properties.prototype, "Encrypted", void 0);
    Properties = __decorate([
        ta_json_1.JsonObject()
    ], Properties);
    return Properties;
}());
exports.Properties = Properties;
//# sourceMappingURL=metadata-properties.js.map