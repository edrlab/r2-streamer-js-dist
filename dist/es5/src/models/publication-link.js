"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_string_converter_1 = require("../../../es8-es2017/src/_utils/ta-json-string-converter");
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
    tslib_1.__decorate([
        ta_json_1.JsonProperty("href"),
        tslib_1.__metadata("design:type", String)
    ], Link.prototype, "Href", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("type"),
        tslib_1.__metadata("design:type", String)
    ], Link.prototype, "TypeLink", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("height"),
        tslib_1.__metadata("design:type", Number)
    ], Link.prototype, "Height", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("width"),
        tslib_1.__metadata("design:type", Number)
    ], Link.prototype, "Width", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("title"),
        tslib_1.__metadata("design:type", String)
    ], Link.prototype, "Title", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("properties"),
        tslib_1.__metadata("design:type", metadata_properties_1.Properties)
    ], Link.prototype, "Properties", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("duration"),
        tslib_1.__metadata("design:type", Number)
    ], Link.prototype, "Duration", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("bitrate"),
        tslib_1.__metadata("design:type", Number)
    ], Link.prototype, "Bitrate", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("templated"),
        tslib_1.__metadata("design:type", Boolean)
    ], Link.prototype, "Templated", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("children"),
        ta_json_1.JsonElementType(Link_1),
        tslib_1.__metadata("design:type", Array)
    ], Link.prototype, "Children", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("rel"),
        ta_json_1.JsonConverter(ta_json_string_converter_1.JsonStringConverter),
        ta_json_1.JsonElementType(String),
        tslib_1.__metadata("design:type", Array)
    ], Link.prototype, "Rel", void 0);
    tslib_1.__decorate([
        ta_json_1.OnDeserialized(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", []),
        tslib_1.__metadata("design:returntype", void 0)
    ], Link.prototype, "_OnDeserialized", null);
    Link = Link_1 = tslib_1.__decorate([
        ta_json_1.JsonObject()
    ], Link);
    return Link;
    var Link_1;
}());
exports.Link = Link;
//# sourceMappingURL=publication-link.js.map