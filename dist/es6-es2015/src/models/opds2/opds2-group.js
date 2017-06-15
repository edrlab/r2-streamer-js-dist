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
const publication_1 = require("../publication");
const publication_link_1 = require("../publication-link");
const opds2_metadata_1 = require("./opds2-metadata");
let OPDSGroup = class OPDSGroup {
    _OnDeserialized() {
        if (!this.Metadata) {
            console.log("OPDSGroup.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("OPDSGroup.Links is not set!");
        }
        if (!this.Publications) {
            console.log("OPDSGroup.Publications is not set!");
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("metadata"),
    __metadata("design:type", opds2_metadata_1.OPDSMetadata)
], OPDSGroup.prototype, "Metadata", void 0);
__decorate([
    ta_json_1.JsonProperty("publications"),
    ta_json_1.JsonElementType(publication_1.Publication),
    __metadata("design:type", Array)
], OPDSGroup.prototype, "Publications", void 0);
__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], OPDSGroup.prototype, "Links", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSGroup.prototype, "_OnDeserialized", null);
OPDSGroup = __decorate([
    ta_json_1.JsonObject()
], OPDSGroup);
exports.OPDSGroup = OPDSGroup;
//# sourceMappingURL=opds2-group.js.map