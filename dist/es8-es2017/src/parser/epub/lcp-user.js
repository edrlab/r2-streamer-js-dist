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
let User = class User {
};
__decorate([
    ta_json_1.JsonProperty("id"),
    __metadata("design:type", String)
], User.prototype, "ID", void 0);
__decorate([
    ta_json_1.JsonProperty("email"),
    __metadata("design:type", String)
], User.prototype, "Email", void 0);
__decorate([
    ta_json_1.JsonProperty("name"),
    __metadata("design:type", String)
], User.prototype, "Name", void 0);
__decorate([
    ta_json_1.JsonProperty("encrypted"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Array)
], User.prototype, "Encrypted", void 0);
User = __decorate([
    ta_json_1.JsonObject()
], User);
exports.User = User;
//# sourceMappingURL=lcp-user.js.map