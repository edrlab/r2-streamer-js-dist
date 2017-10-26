"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
var util = require("util");
var debug_ = require("debug");
var request = require("request");
var requestPromise = require("request-promise-native");
var yauzl = require("yauzl");
var BufferUtils_1 = require("../stream/BufferUtils");
var debug = debug_("r2:httpStream");
var HttpZipReader = (function () {
    function HttpZipReader(url, byteLength) {
        this.url = url;
        this.byteLength = byteLength;
        this.firstBuffer = undefined;
        this.firstBufferStart = 0;
        this.firstBufferEnd = 0;
        yauzl.RandomAccessReader.call(this);
    }
    HttpZipReader.prototype._readStreamForRange = function (start, end) {
        var _this = this;
        if (this.firstBuffer && start >= this.firstBufferStart && end <= this.firstBufferEnd) {
            var begin = start - this.firstBufferStart;
            var stop_1 = end - this.firstBufferStart;
            return BufferUtils_1.bufferToStream(this.firstBuffer.slice(begin, stop_1));
        }
        var stream = new stream_1.PassThrough();
        var lastByteIndex = end - 1;
        var range = start + "-" + lastByteIndex;
        var failure = function (err) {
            debug(err);
        };
        var success = function (res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var buffer, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                            failure("HTTP CODE " + res.statusCode);
                            return [2];
                        }
                        if (!this.firstBuffer) return [3, 1];
                        res.pipe(stream);
                        return [3, 6];
                    case 1:
                        buffer = void 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4, BufferUtils_1.streamToBufferPromise(res)];
                    case 3:
                        buffer = _a.sent();
                        return [3, 5];
                    case 4:
                        err_1 = _a.sent();
                        debug(err_1);
                        stream.end();
                        return [2];
                    case 5:
                        this.firstBuffer = buffer;
                        this.firstBufferStart = start;
                        this.firstBufferEnd = end;
                        stream.write(buffer);
                        stream.end();
                        _a.label = 6;
                    case 6: return [2];
                }
            });
        }); };
        var needsStreamingResponse = true;
        if (needsStreamingResponse) {
            request.get({
                headers: { Range: "bytes=" + range },
                method: "GET",
                uri: this.url,
            })
                .on("response", success)
                .on("error", failure);
        }
        else {
            (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var res, err_2;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, requestPromise({
                                    headers: { Range: "bytes=" + range },
                                    method: "GET",
                                    resolveWithFullResponse: true,
                                    uri: this.url,
                                })];
                        case 1:
                            res = _a.sent();
                            return [3, 3];
                        case 2:
                            err_2 = _a.sent();
                            failure(err_2);
                            return [2];
                        case 3: return [4, success(res)];
                        case 4:
                            _a.sent();
                            return [2];
                    }
                });
            }); })();
        }
        return stream;
    };
    return HttpZipReader;
}());
exports.HttpZipReader = HttpZipReader;
util.inherits(HttpZipReader, yauzl.RandomAccessReader);
//# sourceMappingURL=zip2RandomAccessReader_Http.js.map