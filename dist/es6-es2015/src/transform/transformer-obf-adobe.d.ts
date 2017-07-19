/// <reference types="node" />
import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
import { ITransformer } from "./transformer";
export declare class TransformerObfAdobe implements ITransformer {
    supports(_publication: Publication, link: Link): boolean;
    transform(publication: Publication, _link: Link, data: Buffer): Buffer;
}
