"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class BufferReadableStream extends stream_1.Readable {
    constructor(buffer) {
        super();
        this.buffer = buffer;
        this.alreadyRead = 0;
    }
    _read(size) {
        if (this.alreadyRead >= this.buffer.length) {
            this.push(null);
            return;
        }
        let chunk = this.alreadyRead ?
            this.buffer.slice(this.alreadyRead) :
            this.buffer;
        if (size) {
            let l = size;
            if (size > chunk.length) {
                l = chunk.length;
            }
            chunk = chunk.slice(0, l);
        }
        this.alreadyRead += chunk.length;
        this.push(chunk);
    }
}
exports.BufferReadableStream = BufferReadableStream;
//# sourceMappingURL=BufferReadableStream.js.map