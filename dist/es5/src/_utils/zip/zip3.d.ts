import { IStreamAndLength, IZip, Zip } from "./zip";
export declare class Zip3 extends Zip {
    readonly filePath: string;
    readonly zip: any;
    static loadPromise(filePath: string): Promise<IZip>;
    private static loadPromiseHTTP(filePath);
    private entries;
    private constructor(filePath, zip);
    entriesCount(): number;
    hasEntries(): boolean;
    hasEntry(entryPath: string): boolean;
    forEachEntry(callback: (entryName: string) => void): void;
    entryStreamPromise(entryPath: string): Promise<IStreamAndLength>;
}
