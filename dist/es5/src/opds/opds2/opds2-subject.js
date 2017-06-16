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
var ta_json_1 = require("ta-json");
var OPDSSubject = (function () {
    function OPDSSubject() {
    }
    OPDSSubject.prototype._OnDeserialized = function () {
        if (!this.Name) {
            console.log("OPDSSubject.Name is not set!");
        }
    };
    return OPDSSubject;
}());
__decorate([
    ta_json_1.JsonProperty("name"),
    __metadata("design:type", String)
], OPDSSubject.prototype, "Name", void 0);
__decorate([
    ta_json_1.JsonProperty("sort_as"),
    __metadata("design:type", String)
], OPDSSubject.prototype, "SortAs", void 0);
__decorate([
    ta_json_1.JsonProperty("scheme"),
    __metadata("design:type", String)
], OPDSSubject.prototype, "Scheme", void 0);
__decorate([
    ta_json_1.JsonProperty("code"),
    __metadata("design:type", String)
], OPDSSubject.prototype, "Code", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSSubject.prototype, "_OnDeserialized", null);
OPDSSubject = __decorate([
    ta_json_1.JsonObject()
], OPDSSubject);
exports.OPDSSubject = OPDSSubject;
//# sourceMappingURL=opds2-subject.js.map