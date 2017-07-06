"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ta_json_1 = require("ta-json");
const lcp_encryption_1 = require("./lcp-encryption");
const lcp_link_1 = require("./lcp-link");
const lcp_rights_1 = require("./lcp-rights");
const lcp_signature_1 = require("./lcp-signature");
const lcp_user_1 = require("./lcp-user");
let LCP = class LCP {
};
tslib_1.__decorate([
    ta_json_1.JsonProperty("id"),
    tslib_1.__metadata("design:type", String)
], LCP.prototype, "ID", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("provider"),
    tslib_1.__metadata("design:type", String)
], LCP.prototype, "Provider", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("issued"),
    tslib_1.__metadata("design:type", Date)
], LCP.prototype, "Issued", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("updated"),
    tslib_1.__metadata("design:type", Date)
], LCP.prototype, "Updated", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("encryption"),
    tslib_1.__metadata("design:type", lcp_encryption_1.Encryption)
], LCP.prototype, "Encryption", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("rights"),
    tslib_1.__metadata("design:type", lcp_rights_1.Rights)
], LCP.prototype, "Rights", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("user"),
    tslib_1.__metadata("design:type", lcp_user_1.User)
], LCP.prototype, "User", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("signature"),
    tslib_1.__metadata("design:type", lcp_signature_1.Signature)
], LCP.prototype, "Signature", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(lcp_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], LCP.prototype, "Links", void 0);
LCP = tslib_1.__decorate([
    ta_json_1.JsonObject()
], LCP);
exports.LCP = LCP;
//# sourceMappingURL=lcp.js.map