"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const stream_1 = require("stream");
function bufferToStream(buffer) {
    const stream = new stream_1.PassThrough();
    stream.write(buffer);
    stream.end();
    return stream;
}
exports.bufferToStream = bufferToStream;
function streamToBufferPromise(readStream) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const buffers = [];
            readStream.on("error", reject);
            readStream.on("data", (data) => {
                buffers.push(data);
            });
            readStream.on("end", () => {
                resolve(Buffer.concat(buffers));
            });
        });
    });
}
exports.streamToBufferPromise = streamToBufferPromise;
//# sourceMappingURL=BufferUtils.js.map