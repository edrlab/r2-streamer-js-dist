"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BufferConverter {
    constructor() {
        this.encoding = "utf8";
    }
    serialize(property) {
        return property.toString(this.encoding);
    }
    deserialize(value) {
        return Buffer.from(value, this.encoding);
    }
}
exports.BufferConverter = BufferConverter;
//# sourceMappingURL=buffer-converter.js.map