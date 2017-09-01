"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const stream_1 = require("stream");
function bufferToStream(buffer) {
    const stream = new stream_1.PassThrough();
    setTimeout(() => {
        const maxBuffLength = 100 * 1024;
        let buff = buffer;
        let remaining = buff.length;
        let done = 0;
        console.log("bufferToStream BEFORE: " + remaining);
        while (remaining > 0) {
            if (done > 0) {
                buff = buffer.slice(done);
            }
            if (buff.length > maxBuffLength) {
                buff = buff.slice(0, maxBuffLength);
            }
            stream.write(buff);
            done += buff.length;
            remaining -= buff.length;
        }
        console.log("bufferToStream AFTER: " + done);
        stream.end();
    }, 20);
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