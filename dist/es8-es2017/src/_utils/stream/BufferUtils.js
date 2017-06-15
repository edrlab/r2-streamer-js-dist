"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
function bufferToStream(buffer) {
    const stream = new stream_1.PassThrough();
    stream.write(buffer);
    stream.end();
    return stream;
}
exports.bufferToStream = bufferToStream;
async function streamToBufferPromise(readStream) {
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
}
exports.streamToBufferPromise = streamToBufferPromise;
//# sourceMappingURL=BufferUtils.js.map