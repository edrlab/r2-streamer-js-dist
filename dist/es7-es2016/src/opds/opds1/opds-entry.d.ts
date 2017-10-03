import { Author } from "./opds-author";
import { Category } from "./opds-category";
import { Link } from "./opds-link";
import { Serie } from "./opds-serie";
export declare class Entry {
    SchemaRatingValue: string;
    SchemaRatingAdditionalType: string;
    SchemaAdditionalType: string;
    Title: string;
    Authors: Author[];
    Id: string;
    Summary: string;
    SummaryType: string;
    DcLanguage: string;
    DcExtent: string;
    DcPublisher: string;
    DcRights: string;
    DcIssued: string;
    DcIdentifier: string;
    DcIdentifierType: string;
    BibFrameDistributionProviderName: string;
    Categories: Category[];
    Content: string;
    ContentType: string;
    Updated: Date;
    Published: Date;
    Links: Link[];
    Series: Serie[];
}
