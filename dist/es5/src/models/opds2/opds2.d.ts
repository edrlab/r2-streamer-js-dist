import { Publication } from "../publication";
import { Link } from "../publication-link";
import { OPDSFacet } from "./opds2-facet";
import { OPDSGroup } from "./opds2-group";
import { OPDSMetadata } from "./opds2-metadata";
export declare class OPDSFeed {
    Context: string[];
    Metadata: OPDSMetadata;
    Links: Link[];
    Publications: Publication[];
    Navigation: Link[];
    Facets: OPDSFacet[];
    Groups: OPDSGroup[];
    private _OnDeserialized();
}
