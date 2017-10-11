/// <reference types="node" />
import { Readable } from "stream";
export declare class HttpReadableStream extends Readable {
    readonly url: string;
    readonly byteLength: number;
    readonly byteStart: number;
    readonly byteEnd: number;
    private alreadyRead;
    constructor(url: string, byteLength: number, byteStart: number, byteEnd: number);
    _read(_size: number): void;
}
