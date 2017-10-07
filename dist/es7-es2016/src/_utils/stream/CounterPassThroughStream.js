"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class CounterPassThroughStream extends stream_1.Transform {
    constructor(id) {
        super();
        this.id = id;
        this.bytesReceived = 0;
    }
    _transform(chunk, _encoding, callback) {
        this.bytesReceived += chunk.length;
        this.push(chunk);
        this.emit("progress");
        callback();
    }
}
exports.CounterPassThroughStream = CounterPassThroughStream;
//# sourceMappingURL=CounterPassThroughStream.js.map