/// <reference types="node" />
import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { IStreamAndLength } from "../../../es8-es2017/src/_utils/zip/zip";
import { ITransformer } from "./transformer";
export declare class TransformerLCP implements ITransformer {
    private contentKey;
    supports(publication: Publication, link: Link): boolean;
    getDecryptedSizeStream(_publication: Publication, _link: Link, stream: IStreamAndLength): Promise<number>;
    getDecryptedSizeBuffer(_publication: Publication, _link: Link, data: Buffer): Promise<number>;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    transformStream_(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    innerDecrypt(data: Buffer): Buffer;
    transformBuffer(_publication: Publication, link: Link, data: Buffer): Promise<Buffer>;
    private UpdateLCP(publication, lcpPassHash);
}
