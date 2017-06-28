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
var opds2_link_1 = require("./opds2-link");
var opds2_metadata_1 = require("./opds2-metadata");
var opds2_publication_1 = require("./opds2-publication");
var OPDSGroup = (function () {
    function OPDSGroup() {
    }
    OPDSGroup.prototype._OnDeserialized = function () {
        if (!this.Metadata) {
            console.log("OPDSGroup.Metadata is not set!");
        }
    };
    __decorate([
        ta_json_1.JsonProperty("metadata"),
        __metadata("design:type", opds2_metadata_1.OPDSMetadata)
    ], OPDSGroup.prototype, "Metadata", void 0);
    __decorate([
        ta_json_1.JsonProperty("publications"),
        ta_json_1.JsonElementType(opds2_publication_1.OPDSPublication),
        __metadata("design:type", Array)
    ], OPDSGroup.prototype, "Publications", void 0);
    __decorate([
        ta_json_1.JsonProperty("links"),
        ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
        __metadata("design:type", Array)
    ], OPDSGroup.prototype, "Links", void 0);
    __decorate([
        ta_json_1.JsonProperty("navigation"),
        ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
        __metadata("design:type", Array)
    ], OPDSGroup.prototype, "Navigation", void 0);
    __decorate([
        ta_json_1.OnDeserialized(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], OPDSGroup.prototype, "_OnDeserialized", null);
    OPDSGroup = __decorate([
        ta_json_1.JsonObject()
    ], OPDSGroup);
    return OPDSGroup;
}());
exports.OPDSGroup = OPDSGroup;
//# sourceMappingURL=opds2-group.js.map