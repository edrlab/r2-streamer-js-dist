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
var ta_json_date_converter_1 = require("../../_utils/ta-json-date-converter");
var ta_json_1 = require("ta-json");
var opds2_belongsTo_1 = require("./opds2-belongsTo");
var opds2_contributor_1 = require("./opds2-contributor");
var opds2_subject_1 = require("./opds2-subject");
var OPDSPublicationMetadata = (function () {
    function OPDSPublicationMetadata() {
    }
    OPDSPublicationMetadata.prototype._OnDeserialized = function () {
        if (!this.Title) {
            console.log("OPDSPublicationMetadata.Title is not set!");
        }
        if (!this.Identifier) {
            console.log("OPDSPublicationMetadata.Identifier is not set!");
        }
    };
    return OPDSPublicationMetadata;
}());
__decorate([
    ta_json_1.JsonProperty("@type"),
    __metadata("design:type", String)
], OPDSPublicationMetadata.prototype, "RDFType", void 0);
__decorate([
    ta_json_1.JsonProperty("title"),
    __metadata("design:type", Object)
], OPDSPublicationMetadata.prototype, "Title", void 0);
__decorate([
    ta_json_1.JsonProperty("identifier"),
    __metadata("design:type", String)
], OPDSPublicationMetadata.prototype, "Identifier", void 0);
__decorate([
    ta_json_1.JsonProperty("author"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Author", void 0);
__decorate([
    ta_json_1.JsonProperty("translator"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Translator", void 0);
__decorate([
    ta_json_1.JsonProperty("editor"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Editor", void 0);
__decorate([
    ta_json_1.JsonProperty("artist"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Artist", void 0);
__decorate([
    ta_json_1.JsonProperty("illustrator"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Illustrator", void 0);
__decorate([
    ta_json_1.JsonProperty("letterer"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Letterer", void 0);
__decorate([
    ta_json_1.JsonProperty("penciler"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Penciler", void 0);
__decorate([
    ta_json_1.JsonProperty("colorist"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Colorist", void 0);
__decorate([
    ta_json_1.JsonProperty("inker"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Inker", void 0);
__decorate([
    ta_json_1.JsonProperty("narrator"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Narrator", void 0);
__decorate([
    ta_json_1.JsonProperty("contributor"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "OPDSContributor", void 0);
__decorate([
    ta_json_1.JsonProperty("publisher"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Publisher", void 0);
__decorate([
    ta_json_1.JsonProperty("imprint"),
    ta_json_1.JsonElementType(opds2_contributor_1.OPDSContributor),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Imprint", void 0);
__decorate([
    ta_json_1.JsonProperty("language"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Language", void 0);
__decorate([
    ta_json_1.JsonProperty("modified"),
    ta_json_1.JsonConverter(ta_json_date_converter_1.JsonDateConverter),
    __metadata("design:type", Date)
], OPDSPublicationMetadata.prototype, "Modified", void 0);
__decorate([
    ta_json_1.JsonProperty("published"),
    ta_json_1.JsonConverter(ta_json_date_converter_1.JsonDateConverter),
    __metadata("design:type", Date)
], OPDSPublicationMetadata.prototype, "PublicationDate", void 0);
__decorate([
    ta_json_1.JsonProperty("description"),
    __metadata("design:type", String)
], OPDSPublicationMetadata.prototype, "Description", void 0);
__decorate([
    ta_json_1.JsonProperty("source"),
    __metadata("design:type", String)
], OPDSPublicationMetadata.prototype, "Source", void 0);
__decorate([
    ta_json_1.JsonProperty("rights"),
    __metadata("design:type", String)
], OPDSPublicationMetadata.prototype, "Rights", void 0);
__decorate([
    ta_json_1.JsonProperty("subject"),
    ta_json_1.JsonElementType(opds2_subject_1.OPDSSubject),
    __metadata("design:type", Array)
], OPDSPublicationMetadata.prototype, "Subject", void 0);
__decorate([
    ta_json_1.JsonProperty("belongs_to"),
    __metadata("design:type", opds2_belongsTo_1.OPDSBelongsTo)
], OPDSPublicationMetadata.prototype, "BelongsTo", void 0);
__decorate([
    ta_json_1.JsonProperty("duration"),
    __metadata("design:type", Number)
], OPDSPublicationMetadata.prototype, "Duration", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSPublicationMetadata.prototype, "_OnDeserialized", null);
OPDSPublicationMetadata = __decorate([
    ta_json_1.JsonObject()
], OPDSPublicationMetadata);
exports.OPDSPublicationMetadata = OPDSPublicationMetadata;
//# sourceMappingURL=opds2-publicationMetadata.js.map