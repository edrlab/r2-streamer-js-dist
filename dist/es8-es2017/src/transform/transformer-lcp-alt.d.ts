/// <reference types="node" />
import { Publication } from "../models/publication";
import { Link } from "../models/publication-link";
import { IStreamAndLength } from "../_utils/zip/zip";
import { TransformerLCP } from "./transformer-lcp";
export declare class TransformerLCPAlt extends TransformerLCP {
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    protected innerDecrypt(publication: Publication, _link: Link, data: Buffer, padding: boolean): Buffer;
}
