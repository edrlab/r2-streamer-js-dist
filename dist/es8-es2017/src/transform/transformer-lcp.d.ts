import { Publication } from "../models/publication";
import { Link } from "../models/publication-link";
import { IStreamAndLength } from "../_utils/zip/zip";
import { ITransformer } from "./transformer";
export declare class TransformerLCP implements ITransformer {
    private contentKey;
    supports(publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    private getDecryptedSizeStream(_publication, _link, stream);
    private innerDecrypt(data, padding);
    private getDecryptedSizeBuffer_(totalByteLength, buff);
    private UpdateLCP(publication, lcpPassHash);
}
