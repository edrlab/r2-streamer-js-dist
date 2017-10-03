"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonStringConverter {
    serialize(property) {
        return property;
    }
    deserialize(value) {
        return value;
    }
    collapseArrayWithSingleItem() {
        return true;
    }
}
exports.JsonStringConverter = JsonStringConverter;
//# sourceMappingURL=ta-json-string-converter.js.map