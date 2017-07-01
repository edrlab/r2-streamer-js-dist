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
var ta_json_string_converter_1 = require("../_utils/ta-json-string-converter");
var ta_json_1 = require("ta-json");
var metadata_properties_1 = require("./metadata-properties");
var Link = (function () {
    function Link() {
    }
    Link_1 = Link;
    Link.prototype.AddRels = function (rels) {
        var _this = this;
        rels.forEach(function (rel) {
            _this.AddRel(rel);
        });
    };
    Link.prototype.AddRel = function (rel) {
        if (this.HasRel(rel)) {
            return;
        }
        if (!this.Rel) {
            this.Rel = [rel];
        }
        else {
            this.Rel.push(rel);
        }
    };
    Link.prototype.HasRel = function (rel) {
        return this.Rel && this.Rel.indexOf(rel) >= 0;
    };
    Link.prototype._OnDeserialized = function () {
        if (!this.Href) {
            console.log("Link.Href is not set!");
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
        ta_json_1.JsonConverter(ta_json_string_converter_1.JsonStringConverter),
        ta_json_1.JsonElementType(String),
        __metadata("design:type", Array)
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
    return Link;
    var Link_1;
}());
exports.Link = Link;
//# sourceMappingURL=publication-link.js.map