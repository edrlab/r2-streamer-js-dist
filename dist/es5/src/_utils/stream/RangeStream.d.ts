/// <reference types="node" />
import { Transform } from "stream";
export declare class RangeStream extends Transform {
    readonly streamBegin: number;
    readonly streamEnd: number;
    readonly streamLength: number;
    private bytesReceived;
    private finished;
    private closed;
    constructor(streamBegin: number, streamEnd: number, streamLength: number);
    _flush(callback: () => void): void;
    _transform(chunk: Buffer, _encoding: string, callback: () => void): void;
}
