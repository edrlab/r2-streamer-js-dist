"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("stream");
var CounterPassThroughStream = (function (_super) {
    tslib_1.__extends(CounterPassThroughStream, _super);
    function CounterPassThroughStream(id) {
        var _this = _super.call(this) || this;
        _this.id = id;
        _this.bytesReceived = 0;
        return _this;
    }
    CounterPassThroughStream.prototype._transform = function (chunk, _encoding, callback) {
        this.bytesReceived += chunk.length;
        this.push(chunk);
        this.emit("progress");
        callback();
    };
    return CounterPassThroughStream;
}(stream_1.Transform));
exports.CounterPassThroughStream = CounterPassThroughStream;
//# sourceMappingURL=CounterPassThroughStream.js.map