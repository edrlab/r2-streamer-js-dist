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
var ta_json_date_converter_1 = require("../../_utils/ta-json-date-converter");
var ta_json_1 = require("ta-json");
var lcp_encryption_1 = require("./lcp-encryption");
var lcp_link_1 = require("./lcp-link");
var lcp_rights_1 = require("./lcp-rights");
var lcp_signature_1 = require("./lcp-signature");
var lcp_user_1 = require("./lcp-user");
var LCP = (function () {
    function LCP() {
    }
    return LCP;
}());
__decorate([
    ta_json_1.JsonProperty("id"),
    __metadata("design:type", String)
], LCP.prototype, "ID", void 0);
__decorate([
    ta_json_1.JsonProperty("provider"),
    __metadata("design:type", String)
], LCP.prototype, "Provider", void 0);
__decorate([
    ta_json_1.JsonProperty("issued"),
    ta_json_1.JsonConverter(ta_json_date_converter_1.JsonDateConverter),
    __metadata("design:type", Date)
], LCP.prototype, "Issued", void 0);
__decorate([
    ta_json_1.JsonProperty("updated"),
    ta_json_1.JsonConverter(ta_json_date_converter_1.JsonDateConverter),
    __metadata("design:type", Date)
], LCP.prototype, "Updated", void 0);
__decorate([
    ta_json_1.JsonProperty("encryption"),
    __metadata("design:type", lcp_encryption_1.Encryption)
], LCP.prototype, "Encryption", void 0);
__decorate([
    ta_json_1.JsonProperty("rights"),
    __metadata("design:type", lcp_rights_1.Rights)
], LCP.prototype, "Rights", void 0);
__decorate([
    ta_json_1.JsonProperty("user"),
    __metadata("design:type", lcp_user_1.User)
], LCP.prototype, "User", void 0);
__decorate([
    ta_json_1.JsonProperty("signature"),
    __metadata("design:type", lcp_signature_1.Signature)
], LCP.prototype, "Signature", void 0);
__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(lcp_link_1.Link),
    __metadata("design:type", Array)
], LCP.prototype, "Links", void 0);
LCP = __decorate([
    ta_json_1.JsonObject()
], LCP);
exports.LCP = LCP;
//# sourceMappingURL=lcp.js.map