import * as express from "express";
import { Server } from "./server";
export declare const serverVersion_PATH = "/version";
export declare function serverVersion(server: Server, topRouter: express.Application): void;
