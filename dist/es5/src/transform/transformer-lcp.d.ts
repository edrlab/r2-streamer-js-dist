import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { IStreamAndLength } from "../../../es8-es2017/src/_utils/zip/zip";
import { ITransformer } from "./transformer";
export interface ICryptoInfo {
    length: number;
    padding: number;
}
export declare class TransformerLCP implements ITransformer {
    private contentKey;
    supports(publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number): Promise<IStreamAndLength>;
    private getDecryptedSizeStream(_publication, _link, stream);
    private innerDecrypt(data, padding);
    private getDecryptedSizeBuffer_(totalByteLength, buff);
    private UpdateLCP(publication, lcpPassHash);
}
