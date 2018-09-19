import * as express from "express";
import { Server } from "./server";
export declare const serverOPDS_local_feed_PATH = "/opds2";
export declare const serverOPDS_local_feed_PATH_ = "/publications.json";
export declare function serverOPDS_local_feed(server: Server, topRouter: express.Application): void;
