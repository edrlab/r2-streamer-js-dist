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
const opds2_link_1 = require("./opds2-link");
let OPDSContributor = class OPDSContributor {
};
__decorate([
    ta_json_1.JsonProperty("name"),
    __metadata("design:type", Object)
], OPDSContributor.prototype, "Name", void 0);
__decorate([
    ta_json_1.JsonProperty("sort_as"),
    __metadata("design:type", String)
], OPDSContributor.prototype, "SortAs", void 0);
__decorate([
    ta_json_1.JsonProperty("identifier"),
    __metadata("design:type", String)
], OPDSContributor.prototype, "Identifier", void 0);
__decorate([
    ta_json_1.JsonProperty("role"),
    __metadata("design:type", String)
], OPDSContributor.prototype, "Role", void 0);
__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
    __metadata("design:type", Array)
], OPDSContributor.prototype, "Links", void 0);
OPDSContributor = __decorate([
    ta_json_1.JsonObject()
], OPDSContributor);
exports.OPDSContributor = OPDSContributor;
//# sourceMappingURL=opds2-contributor.js.map