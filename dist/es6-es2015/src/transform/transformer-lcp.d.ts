/// <reference types="node" />
import { Publication } from "../models/publication";
import { Link } from "../models/publication-link";
import { ITransformer } from "./transformer";
export declare class TransformerLCP implements ITransformer {
    private contentKey;
    supports(publication: Publication, link: Link): boolean;
    transform(_publication: Publication, link: Link, data: Buffer): Buffer;
}
