export interface IRange {
    begin: number;
    end: number;
}
export declare function parseRangeHeader(rangeHeader: string): IRange[];
export declare function combineRanges(ranges: IRange[]): IRange[];
