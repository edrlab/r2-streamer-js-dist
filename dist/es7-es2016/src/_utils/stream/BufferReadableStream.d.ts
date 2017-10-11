/// <reference types="node" />
import { Readable } from "stream";
export declare class BufferReadableStream extends Readable {
    readonly buffer: Buffer;
    private alreadyRead;
    constructor(buffer: Buffer);
    _read(size: number): void;
}
