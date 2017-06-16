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
var OPDSPrice = (function () {
    function OPDSPrice() {
    }
    OPDSPrice.prototype._OnDeserialized = function () {
        if (!this.Currency) {
            console.log("OPDSPrice.Currency is not set!");
        }
        if (!this.Value) {
            console.log("OPDSPrice.Value is not set!");
        }
    };
    return OPDSPrice;
}());
__decorate([
    ta_json_1.JsonProperty("currency"),
    __metadata("design:type", String)
], OPDSPrice.prototype, "Currency", void 0);
__decorate([
    ta_json_1.JsonProperty("value"),
    __metadata("design:type", Number)
], OPDSPrice.prototype, "Value", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSPrice.prototype, "_OnDeserialized", null);
OPDSPrice = __decorate([
    ta_json_1.JsonObject()
], OPDSPrice);
exports.OPDSPrice = OPDSPrice;
//# sourceMappingURL=opds2-price.js.map