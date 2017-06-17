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
const opds2_properties_1 = require("./opds2-properties");
let OPDSLink = OPDSLink_1 = class OPDSLink {
    AddRel(rel) {
        if (!this.Rel || this.Rel.indexOf(rel) < 0) {
            if (!this.Rel) {
                this.Rel = [];
            }
            this.Rel.push(rel);
        }
    }
    _OnDeserialized() {
        if (!this.Href) {
            console.log("Link.Href is not set!");
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("href"),
    __metadata("design:type", String)
], OPDSLink.prototype, "Href", void 0);
__decorate([
    ta_json_1.JsonProperty("type"),
    __metadata("design:type", String)
], OPDSLink.prototype, "TypeLink", void 0);
__decorate([
    ta_json_1.JsonProperty("rel"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Array)
], OPDSLink.prototype, "Rel", void 0);
__decorate([
    ta_json_1.JsonProperty("height"),
    __metadata("design:type", Number)
], OPDSLink.prototype, "Height", void 0);
__decorate([
    ta_json_1.JsonProperty("width"),
    __metadata("design:type", Number)
], OPDSLink.prototype, "Width", void 0);
__decorate([
    ta_json_1.JsonProperty("title"),
    __metadata("design:type", String)
], OPDSLink.prototype, "Title", void 0);
__decorate([
    ta_json_1.JsonProperty("properties"),
    __metadata("design:type", opds2_properties_1.OPDSProperties)
], OPDSLink.prototype, "Properties", void 0);
__decorate([
    ta_json_1.JsonProperty("duration"),
    __metadata("design:type", Number)
], OPDSLink.prototype, "Duration", void 0);
__decorate([
    ta_json_1.JsonProperty("templated"),
    __metadata("design:type", Boolean)
], OPDSLink.prototype, "Templated", void 0);
__decorate([
    ta_json_1.JsonProperty("children"),
    ta_json_1.JsonElementType(OPDSLink_1),
    __metadata("design:type", Array)
], OPDSLink.prototype, "Children", void 0);
__decorate([
    ta_json_1.JsonProperty("bitrate"),
    __metadata("design:type", Number)
], OPDSLink.prototype, "Bitrate", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSLink.prototype, "_OnDeserialized", null);
OPDSLink = OPDSLink_1 = __decorate([
    ta_json_1.JsonObject()
], OPDSLink);
exports.OPDSLink = OPDSLink;
var OPDSLink_1;
//# sourceMappingURL=opds2-link.js.map