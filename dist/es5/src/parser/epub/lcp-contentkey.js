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
var ContentKey = (function () {
    function ContentKey() {
    }
    __decorate([
        ta_json_1.JsonProperty("encrypted_value"),
        __metadata("design:type", String)
    ], ContentKey.prototype, "EncryptedValue", void 0);
    __decorate([
        ta_json_1.JsonProperty("algorithm"),
        __metadata("design:type", String)
    ], ContentKey.prototype, "Algorithm", void 0);
    ContentKey = __decorate([
        ta_json_1.JsonObject()
    ], ContentKey);
    return ContentKey;
}());
exports.ContentKey = ContentKey;
//# sourceMappingURL=lcp-contentkey.js.map