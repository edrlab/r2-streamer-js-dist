import { Publication } from "../../../es8-es2017/src/models/publication";
import { Link } from "../../../es8-es2017/src/models/publication-link";
export declare const mediaOverlayURLPath = "media-overlay.json";
export declare const mediaOverlayURLParam = "resource";
export declare const addCoverDimensions: (publication: Publication, coverLink: Link) => Promise<void>;
export declare function EpubParsePromise(filePath: string): Promise<Publication>;
