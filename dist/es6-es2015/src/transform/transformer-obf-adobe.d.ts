import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { IStreamAndLength } from "../../../es8-es2017/src/_utils/zip/zip";
import { ITransformer } from "./transformer";
export declare class TransformerObfAdobe implements ITransformer {
    supports(_publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, _isPartialByteRangeRequest: boolean, _partialByteBegin: number, _partialByteEnd: number): Promise<IStreamAndLength>;
    private transformBuffer(publication, _link, data);
}
