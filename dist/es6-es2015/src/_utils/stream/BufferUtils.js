"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const BufferReadableStream_1 = require("../../../../es8-es2017/src/_utils/stream/BufferReadableStream");
function bufferToStream(buffer) {
    return new BufferReadableStream_1.BufferReadableStream(buffer);
}
exports.bufferToStream = bufferToStream;
function streamToBufferPromise_READABLE(readStream) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const buffers = [];
            readStream.on("error", reject);
            readStream.on("readable", () => {
                let chunk;
                do {
                    chunk = readStream.read();
                    if (chunk) {
                        buffers.push(chunk);
                    }
                } while (chunk);
            });
            readStream.on("end", () => {
                resolve(Buffer.concat(buffers));
            });
        });
    });
}
exports.streamToBufferPromise_READABLE = streamToBufferPromise_READABLE;
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