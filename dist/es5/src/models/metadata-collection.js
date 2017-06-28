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
var Collection = (function () {
    function Collection() {
    }
    Collection.prototype._OnDeserialized = function () {
        if (!this.Name) {
            console.log("Collection.Name is not set!");
        }
    };
    __decorate([
        ta_json_1.JsonProperty("name"),
        __metadata("design:type", String)
    ], Collection.prototype, "Name", void 0);
    __decorate([
        ta_json_1.JsonProperty("sort_as"),
        __metadata("design:type", String)
    ], Collection.prototype, "SortAs", void 0);
    __decorate([
        ta_json_1.JsonProperty("identifier"),
        __metadata("design:type", String)
    ], Collection.prototype, "Identifier", void 0);
    __decorate([
        ta_json_1.JsonProperty("position"),
        __metadata("design:type", Number)
    ], Collection.prototype, "Position", void 0);
    __decorate([
        ta_json_1.OnDeserialized(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Collection.prototype, "_OnDeserialized", null);
    Collection = __decorate([
        ta_json_1.JsonObject()
    ], Collection);
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=metadata-collection.js.map