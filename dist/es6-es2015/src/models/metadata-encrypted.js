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
let Encrypted = class Encrypted {
};
__decorate([
    ta_json_1.JsonProperty("scheme"),
    __metadata("design:type", String)
], Encrypted.prototype, "Scheme", void 0);
__decorate([
    ta_json_1.JsonProperty("profile"),
    __metadata("design:type", String)
], Encrypted.prototype, "Profile", void 0);
__decorate([
    ta_json_1.JsonProperty("algorithm"),
    __metadata("design:type", String)
], Encrypted.prototype, "Algorithm", void 0);
__decorate([
    ta_json_1.JsonProperty("compression"),
    __metadata("design:type", String)
], Encrypted.prototype, "Compression", void 0);
__decorate([
    ta_json_1.JsonProperty("original-length"),
    __metadata("design:type", Number)
], Encrypted.prototype, "OriginalLength", void 0);
Encrypted = __decorate([
    ta_json_1.JsonObject()
], Encrypted);
exports.Encrypted = Encrypted;
//# sourceMappingURL=metadata-encrypted.js.map