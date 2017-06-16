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
let Link = class Link {
};
__decorate([
    ta_json_1.JsonProperty("length"),
    __metadata("design:type", Number)
], Link.prototype, "Length", void 0);
__decorate([
    ta_json_1.JsonProperty("rel"),
    __metadata("design:type", String)
], Link.prototype, "Rel", void 0);
__decorate([
    ta_json_1.JsonProperty("href"),
    __metadata("design:type", String)
], Link.prototype, "Href", void 0);
__decorate([
    ta_json_1.JsonProperty("title"),
    __metadata("design:type", String)
], Link.prototype, "Title", void 0);
__decorate([
    ta_json_1.JsonProperty("type"),
    __metadata("design:type", String)
], Link.prototype, "Type", void 0);
__decorate([
    ta_json_1.JsonProperty("templated"),
    __metadata("design:type", String)
], Link.prototype, "Templated", void 0);
__decorate([
    ta_json_1.JsonProperty("profile"),
    __metadata("design:type", String)
], Link.prototype, "Profile", void 0);
__decorate([
    ta_json_1.JsonProperty("hash"),
    __metadata("design:type", String)
], Link.prototype, "Hash", void 0);
Link = __decorate([
    ta_json_1.JsonObject()
], Link);
exports.Link = Link;
//# sourceMappingURL=lcp-link.js.map