/// <reference types="node" />
export declare function injectStreamInZip(destPathTMP: string, destPathFINAL: string, stream: NodeJS.ReadableStream, zipEntryPath: string, zipError: (e: any) => void, doneCallback: () => void): void;
export declare function injectBufferInZip(destPathTMP: string, destPathFINAL: string, buffer: Buffer, zipEntryPath: string, zipError: (e: any) => void, doneCallback: () => void): void;
export declare function injectFileInZip(destPathTMP: string, destPathFINAL: string, filePath: string, zipEntryPath: string, zipError: (e: any) => void, doneCallback: () => void): void;
