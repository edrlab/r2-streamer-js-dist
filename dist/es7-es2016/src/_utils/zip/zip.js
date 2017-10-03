"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const RangeStream_1 = require("../stream/RangeStream");
class Zip {
    entryStreamRangePromise(entryPath, begin, end) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let streamAndLength;
            try {
                streamAndLength = yield this.entryStreamPromise(entryPath);
            }
            catch (err) {
                console.log(err);
                throw err;
            }
            streamAndLength = streamAndLength;
            const b = begin < 0 ? 0 : begin;
            const e = end < 0 ? (streamAndLength.length - 1) : end;
            const stream = new RangeStream_1.RangeStream(b, e, streamAndLength.length);
            streamAndLength.stream.pipe(stream);
            const sal = {
                length: streamAndLength.length,
                reset: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return this.entryStreamRangePromise(entryPath, begin, end);
                }),
                stream,
            };
            return sal;
        });
    }
}
exports.Zip = Zip;
//# sourceMappingURL=zip.js.map