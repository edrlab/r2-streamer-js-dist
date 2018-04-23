/// <reference types="express" />
import { Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";
import { OPDSFeed } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2";
import * as express from "express";
import { CertificateData } from "../utils/self-signed";
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
}
export declare class Server {
    readonly disableReaders: boolean;
    readonly disableDecryption: boolean;
    readonly disableRemotePubUrl: boolean;
    readonly disableOPDS: boolean;
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
    private httpsServer;
    private serverData;
    constructor(options?: IServerOptions);
    preventRobots(): void;
    expressUse(pathf: string, func: express.Handler): void;
    expressGet(paths: string[], func: express.Handler): void;
    isStarted(): boolean;
    isSecured(): boolean;
    start(port: number, secure: boolean): Promise<ServerData>;
    stop(): void;
    serverInfo(): ServerData | undefined;
    serverUrl(): string | undefined;
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
