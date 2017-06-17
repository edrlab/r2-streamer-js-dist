import { OPDSLink } from "./opds2-link";
import { OPDSPublicationMetadata } from "./opds2-publicationMetadata";
export declare class OPDSPublication {
    Metadata: OPDSPublicationMetadata;
    Links: OPDSLink[];
    Images: OPDSLink[];
    findFirstLinkByRel(rel: string): OPDSLink | undefined;
    private _OnDeserialized();
}
