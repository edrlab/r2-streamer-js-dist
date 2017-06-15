"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RangeStream_1 = require("../stream/RangeStream");
class Zip {
    entryStreamRangePromise(entryPath, begin, end) {
        return __awaiter(this, void 0, void 0, function* () {
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
                stream,
            };
            return sal;
        });
    }
}
exports.Zip = Zip;
//# sourceMappingURL=zip.js.map