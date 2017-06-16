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
var Signature = (function () {
    function Signature() {
    }
    return Signature;
}());
__decorate([
    ta_json_1.JsonProperty("algorithm"),
    __metadata("design:type", String)
], Signature.prototype, "Algorithm", void 0);
__decorate([
    ta_json_1.JsonProperty("certificate"),
    __metadata("design:type", String)
], Signature.prototype, "Certificate", void 0);
__decorate([
    ta_json_1.JsonProperty("value"),
    __metadata("design:type", String)
], Signature.prototype, "Value", void 0);
Signature = __decorate([
    ta_json_1.JsonObject()
], Signature);
exports.Signature = Signature;
//# sourceMappingURL=lcp-signature.js.map