"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
var BufferReadableStream = (function (_super) {
    tslib_1.__extends(BufferReadableStream, _super);
    function BufferReadableStream(buffer) {
        var _this = _super.call(this) || this;
        _this.buffer = buffer;
        _this.alreadyRead = 0;
        return _this;
    }
    BufferReadableStream.prototype._read = function (size) {
        if (this.alreadyRead >= this.buffer.length) {
            this.push(null);
            return;
        }
        var chunk = this.alreadyRead ?
            this.buffer.slice(this.alreadyRead) :
            this.buffer;
        if (size) {
            var l = size;
            if (size > chunk.length) {
                l = chunk.length;
            }
            chunk = chunk.slice(0, l);
        }
        this.alreadyRead += chunk.length;
        this.push(chunk);
    };
    return BufferReadableStream;
}(stream_1.Readable));
exports.BufferReadableStream = BufferReadableStream;
//# sourceMappingURL=BufferReadableStream.js.map