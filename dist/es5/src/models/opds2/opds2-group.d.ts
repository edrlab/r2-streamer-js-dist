import { Publication } from "../publication";
import { Link } from "../publication-link";
import { OPDSMetadata } from "./opds2-metadata";
export declare class OPDSGroup {
    Metadata: OPDSMetadata;
    Publications: Publication[];
    Links: Link[];
    private _OnDeserialized();
}
