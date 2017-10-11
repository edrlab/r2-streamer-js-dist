"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var BufferReadableStream_1 = require("../../../../es8-es2017/src/_utils/stream/BufferReadableStream");
function bufferToStream(buffer) {
    return new BufferReadableStream_1.BufferReadableStream(buffer);
}
exports.bufferToStream = bufferToStream;
function streamToBufferPromise(readStream) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2, new Promise(function (resolve, reject) {
                    var buffers = [];
                    readStream.on("error", reject);
                    readStream.on("readable", function () {
                        var chunk;
                        do {
                            chunk = readStream.read();
                            if (chunk) {
                                buffers.push(chunk);
                            }
                        } while (chunk);
                    });
                    readStream.on("end", function () {
                        resolve(Buffer.concat(buffers));
                    });
                })];
        });
    });
}
exports.streamToBufferPromise = streamToBufferPromise;
function streamToBufferPromise2(readStream) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2, new Promise(function (resolve, reject) {
                    var buffers = [];
                    readStream.on("error", reject);
                    readStream.on("data", function (data) {
                        buffers.push(data);
                    });
                    readStream.on("end", function () {
                        resolve(Buffer.concat(buffers));
                    });
                })];
        });
    });
}
exports.streamToBufferPromise2 = streamToBufferPromise2;
//# sourceMappingURL=BufferUtils.js.map