"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ta_json_1 = require("ta-json");
class JsonDateConverter {
    serialize(property) {
        return property.toISOString();
    }
    deserialize(value) {
        return new Date(value);
    }
}
exports.JsonDateConverter = JsonDateConverter;
ta_json_1.propertyConverters.set(Date, new JsonDateConverter());
//# sourceMappingURL=ta-json-date-converter.js.map