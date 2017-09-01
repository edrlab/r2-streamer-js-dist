"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
function bufferToStream(buffer) {
    var stream = new stream_1.PassThrough();
    setTimeout(function () {
        var maxBuffLength = 100 * 1024;
        var buff = buffer;
        var remaining = buff.length;
        var done = 0;
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