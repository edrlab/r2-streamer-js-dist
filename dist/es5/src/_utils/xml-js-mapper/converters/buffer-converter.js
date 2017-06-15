"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BufferConverter = (function () {
    function BufferConverter() {
        this.encoding = "utf8";
    }
    BufferConverter.prototype.serialize = function (property) {
        return property.toString(this.encoding);
    };
    BufferConverter.prototype.deserialize = function (value) {
        return Buffer.from(value, this.encoding);
    };
    return BufferConverter;
}());
exports.BufferConverter = BufferConverter;
//# sourceMappingURL=buffer-converter.js.map