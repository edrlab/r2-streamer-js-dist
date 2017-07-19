/// <reference types="node" />
import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
export interface ITransformer {
    supports(publication: Publication, link: Link): boolean;
    transform(publication: Publication, link: Link, data: Buffer): Buffer;
}
export declare class Transformers {
    static instance(): Transformers;
    static try(publication: Publication, link: Link, data: Buffer): Buffer | undefined;
    private static _instance;
    private transformers;
    constructor();
    add(transformer: ITransformer): void;
    private _try(publication, link, data);
}
