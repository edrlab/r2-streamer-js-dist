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
    AddLink(href: string, rel: string, typeLink: string, templated: boolean): void;
    AddNavigation(title: string, href: string, rel: string, typeLink: string): void;
    AddPagination(numberItems: number, itemsPerPage: number, currentPage: number, nextLink: string, prevLink: string, firstLink: string, lastLink: string): void;
    AddFacet(link: OPDSLink, group: string): void;
    AddPublicationInGroup(publication: OPDSPublication, collLink: OPDSLink): void;
    AddNavigationInGroup(link: OPDSLink, collLink: OPDSLink): void;
    private _OnDeserialized();
}
