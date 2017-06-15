import { Author } from "./opf-author";
import { MetaDate } from "./opf-date";
import { Identifier } from "./opf-identifier";
import { Metafield } from "./opf-metafield";
import { Subject } from "./opf-subject";
import { Title } from "./opf-title";
export declare class Metadata {
    Title: Title[];
    Language: string[];
    Identifier: Identifier[];
    Creator: Author[];
    Subject: Subject[];
    Description: string[];
    Publisher: string[];
    Contributor: Author[];
    Date: MetaDate[];
    Type: string[];
    Format: string[];
    Source: string[];
    Relation: string[];
    Coverage: string[];
    Rights: string[];
    Meta: Metafield[];
}
