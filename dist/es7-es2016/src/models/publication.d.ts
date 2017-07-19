import { LCP } from "../../../es8-es2017/src/parser/epub/lcp";
import { IInternal } from "./internal";
import { MediaOverlayNode } from "./media-overlay";
import { Metadata } from "./metadata";
import { Link } from "./publication-link";
export declare class Publication {
    Context: string[];
    Metadata: Metadata;
    Links: Link[];
    Spine: Link[];
    Resources: Link[];
    TOC: Link[];
    PageList: Link[];
    Landmarks: Link[];
    LOI: Link[];
    LOA: Link[];
    LOV: Link[];
    LOT: Link[];
    Images: Link[];
    LCP: LCP;
    Internal: IInternal[];
    freeDestroy(): void;
    UpdateLCP(lcpPassHash: string): string | undefined;
    findFromInternal(key: string): IInternal | undefined;
    AddToInternal(key: string, value: any): void;
    GetCover(): Link | undefined;
    GetNavDoc(): Link | undefined;
    searchLinkByRel(rel: string): Link | undefined;
    AddLink(typeLink: string, rel: string[], url: string, templated: boolean): void;
    FindAllMediaOverlay(): MediaOverlayNode[];
    FindMediaOverlayByHref(href: string): MediaOverlayNode[];
    GetPreFetchResources(): Link[];
    private _OnDeserialized();
}
