"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var debug_ = require("debug");
var request = require("request");
var requestPromise = require("request-promise-native");
var BufferUtils_1 = require("../_utils/stream/BufferUtils");
var debug = debug_("r2:httpStream");
var HttpReadableStream = (function (_super) {
    __extends(HttpReadableStream, _super);
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
        var success = function (res) { return __awaiter(_this, void 0, void 0, function () {
            var buffer, err_1;
            return __generator(this, function (_a) {
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
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var res, err_2;
                return __generator(this, function (_a) {
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