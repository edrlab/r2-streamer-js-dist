import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { IStreamAndLength } from "../../../es8-es2017/src/_utils/zip/zip";
export interface ITransformer {
    supports(publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
}
export declare class Transformers {
    static instance(): Transformers;
    static tryStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    private static _instance;
    private transformers;
    constructor();
    add(transformer: ITransformer): void;
    private _tryStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
}
