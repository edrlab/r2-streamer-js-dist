import { Publication } from "../models/publication";
import { Link } from "../models/publication-link";
import { IStreamAndLength } from "../_utils/zip/zip";
import { ITransformer } from "./transformer";
export interface ICryptoInfo {
    length: number;
    padding: number;
}
export declare class TransformerLCP implements ITransformer {
    supports(publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    protected getDecryptedSizeStream(publication: Publication, _link: Link, stream: IStreamAndLength): Promise<ICryptoInfo>;
}
