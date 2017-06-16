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
const ta_json_date_converter_1 = require("../../_utils/ta-json-date-converter");
const ta_json_1 = require("ta-json");
let Rights = class Rights {
};
__decorate([
    ta_json_1.JsonProperty("print"),
    __metadata("design:type", Number)
], Rights.prototype, "Print", void 0);
__decorate([
    ta_json_1.JsonProperty("copy"),
    __metadata("design:type", Number)
], Rights.prototype, "Copy", void 0);
__decorate([
    ta_json_1.JsonProperty("start"),
    ta_json_1.JsonConverter(ta_json_date_converter_1.JsonDateConverter),
    __metadata("design:type", Date)
], Rights.prototype, "Start", void 0);
__decorate([
    ta_json_1.JsonProperty("end"),
    ta_json_1.JsonConverter(ta_json_date_converter_1.JsonDateConverter),
    __metadata("design:type", Date)
], Rights.prototype, "End", void 0);
Rights = __decorate([
    ta_json_1.JsonObject()
], Rights);
exports.Rights = Rights;
//# sourceMappingURL=lcp-rights.js.map