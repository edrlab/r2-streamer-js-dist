import { IStreamAndLength } from "r2-utils-js/dist/es5/src/_utils/zip/zip";
import { ITransformer } from "r2-shared-js/dist/es5/src/transform/transformer";
import { Publication } from "r2-shared-js/dist/es5/src/models/publication";
import { Link } from "r2-shared-js/dist/es5/src/models/publication-link";
export declare class TransformerLCPRaw implements ITransformer {
    supports(publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, url: string | undefined, stream: IStreamAndLength, isPartialByteRangeRequest: boolean, partialByteBegin: number, partialByteEnd: number, sessionInfo: string | undefined): Promise<IStreamAndLength>;
}
