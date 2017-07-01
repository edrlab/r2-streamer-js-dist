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
const metadata_belongsto_1 = require("./metadata-belongsto");
const metadata_contributor_1 = require("./metadata-contributor");
const metadata_properties_1 = require("./metadata-properties");
const metadata_subject_1 = require("./metadata-subject");
let Metadata = class Metadata {
    _OnDeserialized() {
        if (!this.Title) {
            console.log("Metadata.Title is not set!");
        }
        if (!this.Identifier) {
            console.log("Metadata.Identifier is not set!");
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("@type"),
    __metadata("design:type", String)
], Metadata.prototype, "RDFType", void 0);
__decorate([
    ta_json_1.JsonProperty("title"),
    __metadata("design:type", Object)
], Metadata.prototype, "Title", void 0);
__decorate([
    ta_json_1.JsonProperty("identifier"),
    __metadata("design:type", String)
], Metadata.prototype, "Identifier", void 0);
__decorate([
    ta_json_1.JsonProperty("author"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Author", void 0);
__decorate([
    ta_json_1.JsonProperty("translator"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Translator", void 0);
__decorate([
    ta_json_1.JsonProperty("editor"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Editor", void 0);
__decorate([
    ta_json_1.JsonProperty("artist"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Artist", void 0);
__decorate([
    ta_json_1.JsonProperty("illustrator"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Illustrator", void 0);
__decorate([
    ta_json_1.JsonProperty("letterer"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Letterer", void 0);
__decorate([
    ta_json_1.JsonProperty("penciler"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Penciler", void 0);
__decorate([
    ta_json_1.JsonProperty("colorist"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Colorist", void 0);
__decorate([
    ta_json_1.JsonProperty("inker"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Inker", void 0);
__decorate([
    ta_json_1.JsonProperty("narrator"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Narrator", void 0);
__decorate([
    ta_json_1.JsonProperty("contributor"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Contributor", void 0);
__decorate([
    ta_json_1.JsonProperty("publisher"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Publisher", void 0);
__decorate([
    ta_json_1.JsonProperty("imprint"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    __metadata("design:type", Array)
], Metadata.prototype, "Imprint", void 0);
__decorate([
    ta_json_1.JsonProperty("language"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Array)
], Metadata.prototype, "Language", void 0);
__decorate([
    ta_json_1.JsonProperty("modified"),
    __metadata("design:type", Date)
], Metadata.prototype, "Modified", void 0);
__decorate([
    ta_json_1.JsonProperty("published"),
    __metadata("design:type", Date)
], Metadata.prototype, "PublicationDate", void 0);
__decorate([
    ta_json_1.JsonProperty("description"),
    __metadata("design:type", String)
], Metadata.prototype, "Description", void 0);
__decorate([
    ta_json_1.JsonProperty("direction"),
    __metadata("design:type", String)
], Metadata.prototype, "Direction", void 0);
__decorate([
    ta_json_1.JsonProperty("rendition"),
    __metadata("design:type", metadata_properties_1.Properties)
], Metadata.prototype, "Rendition", void 0);
__decorate([
    ta_json_1.JsonProperty("source"),
    __metadata("design:type", String)
], Metadata.prototype, "Source", void 0);
__decorate([
    ta_json_1.JsonProperty("epub-type"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Array)
], Metadata.prototype, "EpubType", void 0);
__decorate([
    ta_json_1.JsonProperty("rights"),
    __metadata("design:type", String)
], Metadata.prototype, "Rights", void 0);
__decorate([
    ta_json_1.JsonProperty("subject"),
    ta_json_1.JsonElementType(metadata_subject_1.Subject),
    __metadata("design:type", Array)
], Metadata.prototype, "Subject", void 0);
__decorate([
    ta_json_1.JsonProperty("belongs_to"),
    __metadata("design:type", metadata_belongsto_1.BelongsTo)
], Metadata.prototype, "BelongsTo", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Metadata.prototype, "_OnDeserialized", null);
Metadata = __decorate([
    ta_json_1.JsonObject()
], Metadata);
exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map