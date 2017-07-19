"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const stream_1 = require("stream");
const debug_ = require("debug");
const request = require("request");
const requestPromise = require("request-promise-native");
const BufferUtils_1 = require("../../../../es8-es2017/src/_utils/stream/BufferUtils");
const debug = debug_("r2:httpStream");
class HttpReadableStream extends stream_1.Readable {
    constructor(url, byteLength, byteStart, byteEnd) {
        super();
        this.url = url;
        this.byteLength = byteLength;
        this.byteStart = byteStart;
        this.byteEnd = byteEnd;
        this.alreadyRead = 0;
    }
    _read(_size) {
        const length = this.byteEnd - this.byteStart;
        if (this.alreadyRead >= length) {
            this.push(null);
            return;
        }
        const failure = (err) => {
            debug(err);
            this.push(null);
        };
        const success = (res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let buffer;
            try {
                buffer = yield BufferUtils_1.streamToBufferPromise(res);
            }
            catch (err) {
                failure(err);
                return;
            }
            this.alreadyRead += buffer.length;
            this.push(buffer);
        });
        console.log(`HTTP GET ${this.url}: ${this.byteStart}-${this.byteEnd} (${this.byteEnd - this.byteStart})`);
        const lastByteIndex = this.byteEnd - 1;
        const range = `${this.byteStart}-${lastByteIndex}`;
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
    }
}
exports.HttpReadableStream = HttpReadableStream;
//# sourceMappingURL=HttpReadableStream.js.map