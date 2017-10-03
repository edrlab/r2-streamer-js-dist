"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_1 = require("ta-json");
var Collection = (function () {
    function Collection() {
    }
    Collection.prototype._OnDeserialized = function () {
        if (!this.Name) {
            console.log("Collection.Name is not set!");
        }
    };
    tslib_1.__decorate([
        ta_json_1.JsonProperty("name"),
        tslib_1.__metadata("design:type", String)
    ], Collection.prototype, "Name", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("sort_as"),
        tslib_1.__metadata("design:type", String)
    ], Collection.prototype, "SortAs", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("identifier"),
        tslib_1.__metadata("design:type", String)
    ], Collection.prototype, "Identifier", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("position"),
        tslib_1.__metadata("design:type", Number)
    ], Collection.prototype, "Position", void 0);
    tslib_1.__decorate([
        ta_json_1.OnDeserialized(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", []),
        tslib_1.__metadata("design:returntype", void 0)
    ], Collection.prototype, "_OnDeserialized", null);
    Collection = tslib_1.__decorate([
        ta_json_1.JsonObject()
    ], Collection);
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=metadata-collection.js.map