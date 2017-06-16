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
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var RangeStream = (function (_super) {
    __extends(RangeStream, _super);
    function RangeStream(streamBegin, streamEnd, streamLength) {
        var _this = _super.call(this) || this;
        _this.streamBegin = streamBegin;
        _this.streamEnd = streamEnd;
        _this.streamLength = streamLength;
        _this.bytesReceived = 0;
        _this.finished = false;
        _this.closed = false;
        _this.on("end", function () {
        });
        _this.on("finish", function () {
        });
        return _this;
    }
    RangeStream.prototype._transform = function (chunk, _encoding, callback) {
        this.bytesReceived += chunk.length;
        if (this.finished) {
            if (!this.closed) {
                this.closed = true;
                this.push(null);
            }
            else {
                this.end();
            }
        }
        else {
            if (this.bytesReceived > this.streamBegin) {
                var chunkBegin = 0;
                var chunkEnd = chunk.length - 1;
                chunkBegin = this.streamBegin - (this.bytesReceived - chunk.length);
                if (chunkBegin < 0) {
                    chunkBegin = 0;
                }
                if (this.bytesReceived > this.streamEnd) {
                    this.finished = true;
                    chunkEnd = chunk.length - (this.bytesReceived - this.streamEnd);
                }
                this.push(chunk.slice(chunkBegin, chunkEnd + 1));
            }
            else {
            }
        }
        callback();
    };
    return RangeStream;
}(stream_1.Transform));
exports.RangeStream = RangeStream;
//# sourceMappingURL=RangeStream.js.map