/// <reference types="node" />
import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { IStreamAndLength } from "../../../es8-es2017/src/_utils/zip/zip";
import { TransformerLCP } from "./transformer-lcp";
export declare class TransformerLCPAlt extends TransformerLCP {
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    protected innerDecrypt(publication: Publication, _link: Link, data: Buffer, padding: boolean): Buffer;
}
