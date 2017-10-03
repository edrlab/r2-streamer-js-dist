/// <reference types="node" />
export declare function bufferToStream(buffer: Buffer): NodeJS.ReadableStream;
export declare function streamToBufferPromise(readStream: NodeJS.ReadableStream): Promise<Buffer>;
