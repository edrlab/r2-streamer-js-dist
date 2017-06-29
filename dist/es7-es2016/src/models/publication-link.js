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
const metadata_properties_1 = require("./metadata-properties");
let Link = Link_1 = class Link {
    AddRels(rels) {
        rels.forEach((rel) => {
            this.AddRel(rel);
        });
    }
    AddRel(rel) {
        if (this.HasRel(rel)) {
            return;
        }
        if (!this.Rel) {
            this.Rel = rel;
        }
        else {
            if (this.Rel instanceof Array) {
                this.Rel.push(rel);
            }
            else {
                const otherRel = this.Rel;
                this.Rel = [];
                this.Rel.push(otherRel);
                this.Rel.push(rel);
            }
        }
    }
    HasRel(rel) {
        if (this.Rel) {
            if (this.Rel instanceof Array) {
                if (this.Rel.indexOf(rel) >= 0) {
                    return true;
                }
            }
            else {
                if (this.Rel === rel) {
                    return true;
                }
            }
        }
        return false;
    }
    _OnDeserialized() {
        if (!this.Href) {
            console.log("Link.Href is not set!");
        }
        if (this.Rel && this.Rel instanceof Array && this.Rel.length === 1) {
            this.Rel = this.Rel[0];
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("href"),
    __metadata("design:type", String)
], Link.prototype, "Href", void 0);
__decorate([
    ta_json_1.JsonProperty("type"),
    __metadata("design:type", String)
], Link.prototype, "TypeLink", void 0);
__decorate([
    ta_json_1.JsonProperty("height"),
    __metadata("design:type", Number)
], Link.prototype, "Height", void 0);
__decorate([
    ta_json_1.JsonProperty("width"),
    __metadata("design:type", Number)
], Link.prototype, "Width", void 0);
__decorate([
    ta_json_1.JsonProperty("title"),
    __metadata("design:type", String)
], Link.prototype, "Title", void 0);
__decorate([
    ta_json_1.JsonProperty("properties"),
    __metadata("design:type", metadata_properties_1.Properties)
], Link.prototype, "Properties", void 0);
__decorate([
    ta_json_1.JsonProperty("duration"),
    __metadata("design:type", Number)
], Link.prototype, "Duration", void 0);
__decorate([
    ta_json_1.JsonProperty("templated"),
    __metadata("design:type", Boolean)
], Link.prototype, "Templated", void 0);
__decorate([
    ta_json_1.JsonProperty("children"),
    ta_json_1.JsonElementType(Link_1),
    __metadata("design:type", Array)
], Link.prototype, "Children", void 0);
__decorate([
    ta_json_1.JsonProperty("rel"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Object)
], Link.prototype, "Rel", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Link.prototype, "_OnDeserialized", null);
Link = Link_1 = __decorate([
    ta_json_1.JsonObject()
], Link);
exports.Link = Link;
var Link_1;
//# sourceMappingURL=publication-link.js.map