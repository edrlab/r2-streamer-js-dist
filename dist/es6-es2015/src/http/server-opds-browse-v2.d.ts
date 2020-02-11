import * as express from "express";
import { Server } from "./server";
export declare const serverOPDS_browse_v2_PATH = "/opds-v2-browse";
export declare const serverOPDS_dataUrl_PATH = "/data-url";
export declare const serverOPDS_auth_PATH = "/opds-auth";
export declare function serverOPDS_browse_v2(_server: Server, topRouter: express.Application): void;
