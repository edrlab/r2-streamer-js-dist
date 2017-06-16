"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateConverter {
    serialize(property) {
        return property.toISOString();
    }
    deserialize(value) {
        return new Date(value);
    }
}
exports.DateConverter = DateConverter;
//# sourceMappingURL=date-converter.js.map