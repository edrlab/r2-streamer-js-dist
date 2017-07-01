export interface IRange {
    begin: number;
    end: number;
}
export declare function parseRangeHeader(rangeHeader: undefined | string | string[]): IRange[];
export declare function combineRanges(ranges: IRange[]): IRange[];
