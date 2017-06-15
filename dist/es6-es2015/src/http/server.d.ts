/// <reference types="express" />
import { OPDSFeed } from "../models/opds2/opds2";
import { Publication } from "../models/publication";
import * as express from "express";
export declare class Server {
    readonly lcpBeginToken: string;
    readonly lcpEndToken: string;
    private readonly publications;
    private publicationsOPDSfeed;
    private readonly pathPublicationMap;
    private creatingPublicationsOPDS;
    private readonly opdsJsonFilePath;
    constructor();
    setResponseCORS(res: express.Response): void;
    addPublications(pubs: string[]): void;
    getPublications(): string[];
    isPublicationCached(filePath: string): boolean;
    cachedPublication(filePath: string): Publication | undefined;
    cachePublication(filePath: string, pub: Publication): void;
    publicationsOPDS(): OPDSFeed | undefined;
}
