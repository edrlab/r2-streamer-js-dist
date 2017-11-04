"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
tslib_1.__decorate([
    ta_json_1.JsonProperty("@type"),
    tslib_1.__metadata("design:type", String)
], Metadata.prototype, "RDFType", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("title"),
    tslib_1.__metadata("design:type", Object)
], Metadata.prototype, "Title", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("identifier"),
    tslib_1.__metadata("design:type", String)
], Metadata.prototype, "Identifier", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("author"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Author", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("translator"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Translator", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("editor"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Editor", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("artist"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Artist", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("illustrator"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Illustrator", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("letterer"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Letterer", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("penciler"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Penciler", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("colorist"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Colorist", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("inker"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Inker", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("narrator"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Narrator", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("contributor"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Contributor", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("publisher"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Publisher", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("imprint"),
    ta_json_1.JsonElementType(metadata_contributor_1.Contributor),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Imprint", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("language"),
    ta_json_1.JsonElementType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Language", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("modified"),
    tslib_1.__metadata("design:type", Date)
], Metadata.prototype, "Modified", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("published"),
    tslib_1.__metadata("design:type", Date)
], Metadata.prototype, "PublicationDate", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("description"),
    tslib_1.__metadata("design:type", String)
], Metadata.prototype, "Description", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("direction"),
    tslib_1.__metadata("design:type", String)
], Metadata.prototype, "Direction", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("rendition"),
    tslib_1.__metadata("design:type", metadata_properties_1.Properties)
], Metadata.prototype, "Rendition", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("source"),
    tslib_1.__metadata("design:type", String)
], Metadata.prototype, "Source", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("epub-type"),
    ta_json_1.JsonElementType(String),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "EpubType", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("rights"),
    tslib_1.__metadata("design:type", String)
], Metadata.prototype, "Rights", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("subject"),
    ta_json_1.JsonElementType(metadata_subject_1.Subject),
    tslib_1.__metadata("design:type", Array)
], Metadata.prototype, "Subject", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("belongs_to"),
    tslib_1.__metadata("design:type", metadata_belongsto_1.BelongsTo)
], Metadata.prototype, "BelongsTo", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("duration"),
    tslib_1.__metadata("design:type", Number)
], Metadata.prototype, "Duration", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("mediaActiveClass"),
    tslib_1.__metadata("design:type", String)
], Metadata.prototype, "MediaActiveClass", void 0);
tslib_1.__decorate([
    ta_json_1.OnDeserialized(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], Metadata.prototype, "_OnDeserialized", null);
Metadata = tslib_1.__decorate([
    ta_json_1.JsonObject()
], Metadata);
exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map