import { OPDSFacet } from "./opds2-facet";
import { OPDSGroup } from "./opds2-group";
import { OPDSLink } from "./opds2-link";
import { OPDSMetadata } from "./opds2-metadata";
import { OPDSPublication } from "./opds2-publication";
export declare class OPDSFeed {
    Context: string[];
    Metadata: OPDSMetadata;
    Links: OPDSLink[];
    Publications: OPDSPublication[];
    Navigation: OPDSLink[];
    Facets: OPDSFacet[];
    Groups: OPDSGroup[];
    private _OnDeserialized();
}
