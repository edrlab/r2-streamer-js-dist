/// <reference types="node" />
import { PassThrough } from "stream";
export interface RandomAccessReader {
    _readStreamForRange(start: number, end: number): void;
}
export declare class HttpZipReader implements RandomAccessReader {
    readonly url: string;
    readonly byteLength: number;
    private firstBuffer;
    private firstBufferStart;
    private firstBufferEnd;
    constructor(url: string, byteLength: number);
    _readStreamForRange(start: number, end: number): NodeJS.ReadableStream | PassThrough;
}
