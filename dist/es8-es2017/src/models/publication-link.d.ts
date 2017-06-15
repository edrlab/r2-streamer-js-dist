import { MediaOverlayNode } from "./media-overlay";
import { Properties } from "./metadata-properties";
export declare class Link {
    Href: string;
    TypeLink: string;
    Rel: string[];
    Height: number;
    Width: number;
    Title: string;
    Properties: Properties;
    Duration: number;
    Templated: boolean;
    Children: Link[];
    MediaOverlays: MediaOverlayNode[];
    AddRel(rel: string): void;
    private _OnDeserialized();
}
