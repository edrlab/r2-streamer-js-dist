import { OPDSProperties } from "./opds2-properties";
export declare class OPDSLink {
    Href: string;
    TypeLink: string;
    Rel: string[];
    Height: number;
    Width: number;
    Title: string;
    Properties: OPDSProperties;
    Duration: number;
    Templated: boolean;
    Children: OPDSLink[];
    Bitrate: number;
    AddRel(rel: string): void;
    private _OnDeserialized();
}
