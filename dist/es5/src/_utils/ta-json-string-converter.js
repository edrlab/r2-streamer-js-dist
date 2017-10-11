"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsonStringConverter = (function () {
    function JsonStringConverter() {
    }
    JsonStringConverter.prototype.serialize = function (property) {
        return property;
    };
    JsonStringConverter.prototype.deserialize = function (value) {
        return value;
    };
    JsonStringConverter.prototype.collapseArrayWithSingleItem = function () {
        return true;
    };
    return JsonStringConverter;
}());
exports.JsonStringConverter = JsonStringConverter;
//# sourceMappingURL=ta-json-string-converter.js.map