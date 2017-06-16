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
var opds2_publicationMetadata_1 = require("./opds2-publicationMetadata");
var OPDSPublication = (function () {
    function OPDSPublication() {
    }
    OPDSPublication.prototype._OnDeserialized = function () {
        if (!this.Metadata) {
            console.log("OPDSPublication.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("OPDSPublication.Links is not set!");
        }
        if (!this.Images) {
            console.log("OPDSPublication.Images is not set!");
        }
    };
    return OPDSPublication;
}());
__decorate([
    ta_json_1.JsonProperty("metadata"),
    __metadata("design:type", opds2_publicationMetadata_1.OPDSPublicationMetadata)
], OPDSPublication.prototype, "Metadata", void 0);
__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
    __metadata("design:type", Array)
], OPDSPublication.prototype, "Links", void 0);
__decorate([
    ta_json_1.JsonProperty("images"),
    ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
    __metadata("design:type", Array)
], OPDSPublication.prototype, "Images", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSPublication.prototype, "_OnDeserialized", null);
OPDSPublication = __decorate([
    ta_json_1.JsonObject()
], OPDSPublication);
exports.OPDSPublication = OPDSPublication;
//# sourceMappingURL=opds2-publication.js.map