"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_1 = require("ta-json");
var Subject = (function () {
    function Subject() {
    }
    Subject.prototype._OnDeserialized = function () {
        if (!this.Name) {
            console.log("Subject.Name is not set!");
        }
    };
    tslib_1.__decorate([
        ta_json_1.JsonProperty("name"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "Name", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("sort_as"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "SortAs", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("scheme"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "Scheme", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("code"),
        tslib_1.__metadata("design:type", String)
    ], Subject.prototype, "Code", void 0);
    tslib_1.__decorate([
        ta_json_1.OnDeserialized(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", []),
        tslib_1.__metadata("design:returntype", void 0)
    ], Subject.prototype, "_OnDeserialized", null);
    Subject = tslib_1.__decorate([
        ta_json_1.JsonObject()
    ], Subject);
    return Subject;
}());
exports.Subject = Subject;
//# sourceMappingURL=metadata-subject.js.map