/// <reference types="express" />
import { Publication } from "../models/publication";
import { OPDSFeed } from "../opds/opds2/opds2";
import * as express from "express";
export interface IServerOptions {
    disableReaders: boolean;
}
export declare class Server {
    readonly disableReaders: boolean;
    readonly lcpBeginToken: string;
    readonly lcpEndToken: string;
    private readonly publications;
    private publicationsOPDSfeed;
    private publicationsOPDSfeedNeedsUpdate;
    private readonly pathPublicationMap;
    private creatingPublicationsOPDS;
    private readonly opdsJsonFilePath;
    private readonly expressApp;
    private httpServer;
    private started;
    constructor(options?: IServerOptions);
    start(port: number): string;
    stop(): void;
    url(): string | undefined;
    setResponseCORS(res: express.Response): void;
    addPublications(pubs: string[]): string[];
    removePublications(pubs: string[]): string[];
    getPublications(): string[];
    isPublicationCached(filePath: string): boolean;
    cachedPublication(filePath: string): Publication | undefined;
    cachePublication(filePath: string, pub: Publication): void;
    uncachePublication(filePath: string): void;
    uncachePublications(): void;
    publicationsOPDS(): OPDSFeed | undefined;
}
