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
const opds2_facet_1 = require("./opds2-facet");
const opds2_group_1 = require("./opds2-group");
const opds2_metadata_1 = require("./opds2-metadata");
let OPDSFeed = class OPDSFeed {
    _OnDeserialized() {
        if (!this.Metadata) {
            console.log("OPDS2Feed.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("OPDS2Feed.Links is not set!");
        }
        if (!this.Context) {
            console.log("OPDS2Feed.Context is not set!");
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("@context"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Context", void 0);
__decorate([
    ta_json_1.JsonProperty("metadata"),
    __metadata("design:type", opds2_metadata_1.OPDSMetadata)
], OPDSFeed.prototype, "Metadata", void 0);
__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Links", void 0);
__decorate([
    ta_json_1.JsonProperty("publications"),
    ta_json_1.JsonElementType(publication_1.Publication),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Publications", void 0);
__decorate([
    ta_json_1.JsonProperty("navigation"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Navigation", void 0);
__decorate([
    ta_json_1.JsonProperty("facets"),
    ta_json_1.JsonElementType(opds2_facet_1.OPDSFacet),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Facets", void 0);
__decorate([
    ta_json_1.JsonProperty("groups"),
    ta_json_1.JsonElementType(opds2_group_1.OPDSGroup),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Groups", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSFeed.prototype, "_OnDeserialized", null);
OPDSFeed = __decorate([
    ta_json_1.JsonObject()
], OPDSFeed);
exports.OPDSFeed = OPDSFeed;
//# sourceMappingURL=opds2.js.map