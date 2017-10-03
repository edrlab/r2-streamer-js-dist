"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonDateConverter = (function () {
    function JsonDateConverter() {
    }
    JsonDateConverter.prototype.serialize = function (property) {
        return property.toISOString();
    };
    JsonDateConverter.prototype.deserialize = function (value) {
        return new Date(value);
    };
    JsonDateConverter.prototype.collapseArrayWithSingleItem = function () {
        return false;
    };
    return JsonDateConverter;
}());
exports.JsonDateConverter = JsonDateConverter;
//# sourceMappingURL=ta-json-date-converter.js.map