import { IStreamAndLength, IZip, Zip } from "./zip";
export declare class Zip1 extends Zip {
    readonly filePath: string;
    readonly zip: any;
    static loadPromise(filePath: string): Promise<IZip>;
    private constructor(filePath, zip);
    entriesCount(): number;
    hasEntries(): boolean;
    hasEntry(entryPath: string): boolean;
    forEachEntry(callback: (entryName: string) => void): void;
    entryStreamPromise(entryPath: string): Promise<IStreamAndLength>;
}
