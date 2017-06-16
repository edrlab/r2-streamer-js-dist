/// <reference types="node" />
import { Publication } from "../models/publication";
import { Link } from "../models/publication-link";
import { ITransformer } from "./transformer";
export declare class TransformerObfIDPF implements ITransformer {
    supports(_publication: Publication, link: Link): boolean;
    transform(publication: Publication, _link: Link, data: Buffer): Buffer;
}
