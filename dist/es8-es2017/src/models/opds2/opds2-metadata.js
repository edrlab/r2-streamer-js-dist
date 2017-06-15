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
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let OPDSMetadata = class OPDSMetadata {
    _OnDeserialized() {
        if (!this.Title) {
            console.log("OPDSMetadata.Title is not set!");
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("@type"),
    __metadata("design:type", String)
], OPDSMetadata.prototype, "RDFType", void 0);
__decorate([
    ta_json_1.JsonProperty("title"),
    __metadata("design:type", String)
], OPDSMetadata.prototype, "Title", void 0);
__decorate([
    ta_json_1.JsonProperty("numberOfItems"),
    __metadata("design:type", Number)
], OPDSMetadata.prototype, "NumberOfItems", void 0);
__decorate([
    ta_json_1.JsonProperty("modified"),
    ta_json_1.JsonConverter(xml_js_mapper_1.DateConverter),
    __metadata("design:type", Date)
], OPDSMetadata.prototype, "Modified", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSMetadata.prototype, "_OnDeserialized", null);
OPDSMetadata = __decorate([
    ta_json_1.JsonObject()
], OPDSMetadata);
exports.OPDSMetadata = OPDSMetadata;
//# sourceMappingURL=opds2-metadata.js.map