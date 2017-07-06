"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var RangeStream_1 = require("../stream/RangeStream");
var Zip = (function () {
    function Zip() {
    }
    Zip.prototype.entryStreamRangePromise = function (entryPath, begin, end) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var streamAndLength, err_1, b, e, stream, sal;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.entryStreamPromise(entryPath)];
                    case 1:
                        streamAndLength = _a.sent();
                        return [3, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.log(err_1);
                        throw err_1;
                    case 3:
                        streamAndLength = streamAndLength;
                        b = begin < 0 ? 0 : begin;
                        e = end < 0 ? (streamAndLength.length - 1) : end;
                        stream = new RangeStream_1.RangeStream(b, e, streamAndLength.length);
                        streamAndLength.stream.pipe(stream);
                        sal = {
                            length: streamAndLength.length,
                            stream: stream,
                        };
                        return [2, sal];
                }
            });
        });
    };
    return Zip;
}());
exports.Zip = Zip;
//# sourceMappingURL=zip.js.map