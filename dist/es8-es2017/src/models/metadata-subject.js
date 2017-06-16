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
let Subject = class Subject {
    _OnDeserialized() {
        if (!this.Name) {
            console.log("Subject.Name is not set!");
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("name"),
    __metadata("design:type", String)
], Subject.prototype, "Name", void 0);
__decorate([
    ta_json_1.JsonProperty("sort_as"),
    __metadata("design:type", String)
], Subject.prototype, "SortAs", void 0);
__decorate([
    ta_json_1.JsonProperty("scheme"),
    __metadata("design:type", String)
], Subject.prototype, "Scheme", void 0);
__decorate([
    ta_json_1.JsonProperty("code"),
    __metadata("design:type", String)
], Subject.prototype, "Code", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Subject.prototype, "_OnDeserialized", null);
Subject = __decorate([
    ta_json_1.JsonObject()
], Subject);
exports.Subject = Subject;
//# sourceMappingURL=metadata-subject.js.map