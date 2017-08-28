/// <reference types="node" />
import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { ITransformer } from "./transformer";
export declare class TransformerLCP implements ITransformer {
    private contentKey;
    supports(publication: Publication, link: Link): boolean;
    transform(_publication: Publication, link: Link, data: Buffer): Buffer;
    private UpdateLCP(publication, lcpPassHash);
}
