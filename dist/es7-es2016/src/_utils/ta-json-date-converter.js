"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonDateConverter {
    serialize(property) {
        return property.toISOString();
    }
    deserialize(value) {
        return new Date(value);
    }
    collapseArrayWithSingleItem() {
        return false;
    }
}
exports.JsonDateConverter = JsonDateConverter;
//# sourceMappingURL=ta-json-date-converter.js.map