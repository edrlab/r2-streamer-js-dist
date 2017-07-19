"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
var debug_ = require("debug");
var request = require("request");
var requestPromise = require("request-promise-native");
var BufferUtils_1 = require("../../../../es8-es2017/src/_utils/stream/BufferUtils");
var debug = debug_("r2:httpStream");
var HttpReadableStream = (function (_super) {
    tslib_1.__extends(HttpReadableStream, _super);
    function HttpReadableStream(url, byteLength, byteStart, byteEnd) {
        var _this = _super.call(this) || this;
        _this.url = url;
        _this.byteLength = byteLength;
        _this.byteStart = byteStart;
        _this.byteEnd = byteEnd;
        _this.alreadyRead = 0;
        return _this;
    }
    HttpReadableStream.prototype._read = function (_size) {
        var _this = this;
        var length = this.byteEnd - this.byteStart;
        if (this.alreadyRead >= length) {
            this.push(null);
            return;
        }
        var failure = function (err) {
            debug(err);
            _this.push(null);
        };
        var success = function (res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var buffer, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, BufferUtils_1.streamToBufferPromise(res)];
                    case 1:
                        buffer = _a.sent();
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        failure(err_1);
                        return [2];
                    case 3:
                        this.alreadyRead += buffer.length;
                        this.push(buffer);
                        return [2];
                }
            });
        }); };
        console.log("HTTP GET " + this.url + ": " + this.byteStart + "-" + this.byteEnd + " (" + (this.byteEnd - this.byteStart) + ")");
        var lastByteIndex = this.byteEnd - 1;
        var range = this.byteStart + "-" + lastByteIndex;
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
                        case 3:
                            res = res;
                            return [4, success(res)];
                        case 4:
                            _a.sent();
                            return [2];
                    }
                });
            }); })();
        }
    };
    return HttpReadableStream;
}(stream_1.Readable));
exports.HttpReadableStream = HttpReadableStream;
//# sourceMappingURL=HttpReadableStream.js.map