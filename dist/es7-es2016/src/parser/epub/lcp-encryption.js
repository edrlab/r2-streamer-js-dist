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
const lcp_contentkey_1 = require("./lcp-contentkey");
const lcp_userkey_1 = require("./lcp-userkey");
let Encryption = class Encryption {
};
__decorate([
    ta_json_1.JsonProperty("profile"),
    __metadata("design:type", String)
], Encryption.prototype, "Profile", void 0);
__decorate([
    ta_json_1.JsonProperty("content_key"),
    __metadata("design:type", lcp_contentkey_1.ContentKey)
], Encryption.prototype, "ContentKey", void 0);
__decorate([
    ta_json_1.JsonProperty("user_key"),
    __metadata("design:type", lcp_userkey_1.UserKey)
], Encryption.prototype, "UserKey", void 0);
Encryption = __decorate([
    ta_json_1.JsonObject()
], Encryption);
exports.Encryption = Encryption;
//# sourceMappingURL=lcp-encryption.js.map