"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const stream_1 = require("stream");
const util = require("util");
const debug_ = require("debug");
const request = require("request");
const requestPromise = require("request-promise-native");
const yauzl = require("yauzl");
const BufferUtils_1 = require("../stream/BufferUtils");
const debug = debug_("r2:httpStream");
class HttpZipReader {
    constructor(url, byteLength) {
        this.url = url;
        this.byteLength = byteLength;
        this.firstBuffer = undefined;
        this.firstBufferStart = 0;
        this.firstBufferEnd = 0;
        yauzl.RandomAccessReader.call(this);
    }
    _readStreamForRange(start, end) {
        if (this.firstBuffer && start >= this.firstBufferStart && end <= this.firstBufferEnd) {
            const begin = start - this.firstBufferStart;
            const stop = end - this.firstBufferStart;
            return BufferUtils_1.bufferToStream(this.firstBuffer.slice(begin, stop));
        }
        const stream = new stream_1.PassThrough();
        const lastByteIndex = end - 1;
        const range = `${start}-${lastByteIndex}`;
        const failure = (err) => {
            debug(err);
        };
        const success = (res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.firstBuffer) {
                res.pipe(stream);
            }
            else {
                let buffer;
                try {
                    buffer = yield BufferUtils_1.streamToBufferPromise(res);
                }
                catch (err) {
                    debug(err);
                    stream.end();
                    return;
                }
                this.firstBuffer = buffer;
                this.firstBufferStart = start;
                this.firstBufferEnd = end;
                stream.write(buffer);
                stream.end();
            }
        });
        const needsStreamingResponse = true;
        if (needsStreamingResponse) {
            request.get({
                headers: { Range: `bytes=${range}` },
                method: "GET",
                uri: this.url,
            })
                .on("response", success)
                .on("error", failure);
        }
        else {
            (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let res;
                try {
                    res = yield requestPromise({
                        headers: { Range: `bytes=${range}` },
                        method: "GET",
                        resolveWithFullResponse: true,
                        uri: this.url,
                    });
                }
                catch (err) {
                    failure(err);
                    return;
                }
                res = res;
                yield success(res);
            }))();
        }
        return stream;
    }
}
exports.HttpZipReader = HttpZipReader;
util.inherits(HttpZipReader, yauzl.RandomAccessReader);
//# sourceMappingURL=zip2RandomAccessReader_Http.js.map