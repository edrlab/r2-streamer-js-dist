"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DateConverter = (function () {
    function DateConverter() {
    }
    DateConverter.prototype.serialize = function (property) {
        return property.toISOString();
    };
    DateConverter.prototype.deserialize = function (value) {
        return new Date(value);
    };
    return DateConverter;
}());
exports.DateConverter = DateConverter;
//# sourceMappingURL=date-converter.js.map