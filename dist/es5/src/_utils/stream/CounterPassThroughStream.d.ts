/// <reference types="node" />
import { Transform } from "stream";
export declare class CounterPassThroughStream extends Transform {
    bytesReceived: number;
    readonly id: number;
    constructor(id: number);
    _transform(chunk: Buffer, _encoding: string, callback: () => void): void;
}
