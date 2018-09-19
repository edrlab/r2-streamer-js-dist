import * as express from "express";
import { Server } from "./server";
export declare const serverPub_PATH = "/pub";
export declare function serverPub(server: Server, topRouter: express.Application): express.Router;
