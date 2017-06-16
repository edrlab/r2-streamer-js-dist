"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ta_json_1 = require("ta-json");
var JsonDateConverter = (function () {
    function JsonDateConverter() {
    }
    JsonDateConverter.prototype.serialize = function (property) {
        return property.toISOString();
    };
    JsonDateConverter.prototype.deserialize = function (value) {
        return new Date(value);
    };
    return JsonDateConverter;
}());
exports.JsonDateConverter = JsonDateConverter;
ta_json_1.propertyConverters.set(Date, new JsonDateConverter());
//# sourceMappingURL=ta-json-date-converter.js.map