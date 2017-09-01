/// <reference types="node" />
import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { IStreamAndLength } from "../../../es8-es2017/src/_utils/zip/zip";
export interface ITransformer {
    supports(publication: Publication, link: Link): boolean;
    transformBuffer(publication: Publication, link: Link, data: Buffer): Promise<Buffer>;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    getDecryptedSizeStream(publication: Publication, link: Link, stream: IStreamAndLength): Promise<number>;
    getDecryptedSizeBuffer(publication: Publication, link: Link, data: Buffer): Promise<number>;
}
export declare class Transformers {
    static instance(): Transformers;
    static tryBuffer(publication: Publication, link: Link, data: Buffer): Promise<Buffer>;
    static tryStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    private static _instance;
    private transformers;
    constructor();
    add(transformer: ITransformer): void;
    private _tryBuffer(publication, link, data);
    private _tryStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
}
