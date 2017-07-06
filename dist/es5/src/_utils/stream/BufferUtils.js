"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
function bufferToStream(buffer) {
    var stream = new stream_1.PassThrough();
    stream.write(buffer);
    stream.end();
    return stream;
}
exports.bufferToStream = bufferToStream;
function streamToBufferPromise(readStream) {
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
exports.streamToBufferPromise = streamToBufferPromise;
//# sourceMappingURL=BufferUtils.js.map