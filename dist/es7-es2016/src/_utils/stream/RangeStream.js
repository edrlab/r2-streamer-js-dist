"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_ = require("debug");
const stream_1 = require("stream");
const debug = debug_("r2:RangeStream");
class RangeStream extends stream_1.Transform {
    constructor(streamBegin, streamEnd, streamLength) {
        super();
        this.streamBegin = streamBegin;
        this.streamEnd = streamEnd;
        this.streamLength = streamLength;
        this.bytesReceived = 0;
        this.finished = false;
        this.closed = false;
        this.on("end", () => {
        });
        this.on("finish", () => {
        });
    }
    _flush(callback) {
        debug("FLUSH");
        callback();
    }
    _transform(chunk, _encoding, callback) {
        this.bytesReceived += chunk.length;
        if (this.finished) {
            if (!this.closed) {
                debug("???? CLOSING...");
                this.closed = true;
                this.push(null);
            }
            else {
                debug("???? STILL PIPE CALLING _transform ??!");
                this.end();
            }
        }
        else {
            if (this.bytesReceived > this.streamBegin) {
                let chunkBegin = 0;
                let chunkEnd = chunk.length - 1;
                chunkBegin = this.streamBegin - (this.bytesReceived - chunk.length);
                if (chunkBegin < 0) {
                    chunkBegin = 0;
                }
                if (this.bytesReceived > this.streamEnd) {
                    this.finished = true;
                    chunkEnd = chunk.length - (this.bytesReceived - this.streamEnd);
                }
                this.push(chunk.slice(chunkBegin, chunkEnd + 1));
                if (this.finished) {
                    debug("FINISHING...");
                    this.closed = true;
                    this.push(null);
                    this.end();
                }
            }
            else {
            }
        }
        callback();
    }
}
exports.RangeStream = RangeStream;
//# sourceMappingURL=RangeStream.js.map