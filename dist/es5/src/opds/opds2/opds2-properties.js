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
var opds2_indirectAcquisition_1 = require("./opds2-indirectAcquisition");
var opds2_price_1 = require("./opds2-price");
var OPDSProperties = (function () {
    function OPDSProperties() {
    }
    __decorate([
        ta_json_1.JsonProperty("numberOfItems"),
        __metadata("design:type", Number)
    ], OPDSProperties.prototype, "NumberOfItems", void 0);
    __decorate([
        ta_json_1.JsonProperty("price"),
        __metadata("design:type", opds2_price_1.OPDSPrice)
    ], OPDSProperties.prototype, "Price", void 0);
    __decorate([
        ta_json_1.JsonProperty("indirectAcquisition"),
        ta_json_1.JsonElementType(opds2_indirectAcquisition_1.OPDSIndirectAcquisition),
        __metadata("design:type", Array)
    ], OPDSProperties.prototype, "IndirectAcquisitions", void 0);
    OPDSProperties = __decorate([
        ta_json_1.JsonObject()
    ], OPDSProperties);
    return OPDSProperties;
}());
exports.OPDSProperties = OPDSProperties;
//# sourceMappingURL=opds2-properties.js.map