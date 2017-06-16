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
const ta_json_1 = require("ta-json");
let OPDSIndirectAcquisition = OPDSIndirectAcquisition_1 = class OPDSIndirectAcquisition {
    _OnDeserialized() {
        if (!this.TypeAcquisition) {
            console.log("OPDSIndirectAcquisition.TypeAcquisition is not set!");
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("type"),
    __metadata("design:type", String)
], OPDSIndirectAcquisition.prototype, "TypeAcquisition", void 0);
__decorate([
    ta_json_1.JsonProperty("child"),
    ta_json_1.JsonElementType(OPDSIndirectAcquisition_1),
    __metadata("design:type", Array)
], OPDSIndirectAcquisition.prototype, "Children", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSIndirectAcquisition.prototype, "_OnDeserialized", null);
OPDSIndirectAcquisition = OPDSIndirectAcquisition_1 = __decorate([
    ta_json_1.JsonObject()
], OPDSIndirectAcquisition);
exports.OPDSIndirectAcquisition = OPDSIndirectAcquisition;
var OPDSIndirectAcquisition_1;
//# sourceMappingURL=opds2-indirectAcquisition.js.map