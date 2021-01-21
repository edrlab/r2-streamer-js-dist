import * as express from "express";
import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";
import { Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { CertificateData } from "../utils/self-signed";
import { IHTTPHeaderNameValue } from "./server-secure";
export interface ServerData extends CertificateData {
    urlScheme: string;
    urlHost: string;
    urlPort: number;
}
export interface IServerOptions {
    disableReaders?: boolean;
    disableDecryption?: boolean;
    disableRemotePubUrl?: boolean;
    disableOPDS?: boolean;
    maxPrefetchLinks?: number;
}
export declare const MAX_PREFETCH_LINKS = 10;
export declare class Server {
    readonly disableReaders: boolean;
    readonly disableDecryption: boolean;
    readonly disableRemotePubUrl: boolean;
    readonly disableOPDS: boolean;
    readonly maxPrefetchLinks: number;
    readonly lcpBeginToken = "*-";
    readonly lcpEndToken = "-*";
    private readonly publications;
    private publicationsOPDSfeed;
    private publicationsOPDSfeedNeedsUpdate;
    private readonly pathPublicationMap;
    private creatingPublicationsOPDS;
    private readonly opdsJsonFilePath;
    private readonly expressApp;
    private httpServer;
    private httpsServer;
    private serverData;
    constructor(options?: IServerOptions);
    preventRobots(): void;
    expressUse(pathf: string, func: express.Handler): void;
    expressGet(paths: string[], func: express.Handler): void;
    isStarted(): boolean;
    isSecured(): boolean;
    getSecureHTTPHeader(url: string): IHTTPHeaderNameValue | undefined;
    start(port: number, secure: boolean): Promise<ServerData>;
    stop(): void;
    serverInfo(): ServerData | undefined;
    serverUrl(): string | undefined;
    setResponseCacheHeaders(res: express.Response, enableCaching: boolean): void;
    setResponseCORS(res: express.Response): void;
    addPublications(pubs: string[]): string[];
    removePublications(pubs: string[]): string[];
    getPublications(): string[];
    loadOrGetCachedPublication(filePath: string): Promise<Publication>;
    isPublicationCached(filePath: string): boolean;
    cachedPublication(filePath: string): Publication | undefined;
    cachePublication(filePath: string, pub: Publication): void;
    uncachePublication(filePath: string): void;
    uncachePublications(): void;
    publicationsOPDS(): OPDSFeed | undefined;
}
