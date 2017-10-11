"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ta_json_1 = require("ta-json");
let Collection = class Collection {
    _OnDeserialized() {
        if (!this.Name) {
            console.log("Collection.Name is not set!");
        }
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
exports.Collection = Collection;
//# sourceMappingURL=metadata-collection.js.map