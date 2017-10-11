import { Manifest } from "./opf-manifest";
import { Metadata } from "./opf-metadata";
import { Reference } from "./opf-reference";
import { Spine } from "./opf-spine";
export declare class OPF {
    Metadata: Metadata;
    Manifest: Manifest[];
    Spine: Spine;
    Guide: Reference[];
    UniqueIdentifier: string;
    Dir: string;
    Version: string;
    ZipPath: string;
}
