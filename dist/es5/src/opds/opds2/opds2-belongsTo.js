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
var opds2_collection_1 = require("./opds2-collection");
var OPDSBelongsTo = (function () {
    function OPDSBelongsTo() {
    }
    return OPDSBelongsTo;
}());
__decorate([
    ta_json_1.JsonProperty("series"),
    ta_json_1.JsonElementType(opds2_collection_1.OPDSCollection),
    __metadata("design:type", Array)
], OPDSBelongsTo.prototype, "Series", void 0);
__decorate([
    ta_json_1.JsonProperty("collection"),
    ta_json_1.JsonElementType(opds2_collection_1.OPDSCollection),
    __metadata("design:type", Array)
], OPDSBelongsTo.prototype, "Collection", void 0);
OPDSBelongsTo = __decorate([
    ta_json_1.JsonObject()
], OPDSBelongsTo);
exports.OPDSBelongsTo = OPDSBelongsTo;
//# sourceMappingURL=opds2-belongsTo.js.map