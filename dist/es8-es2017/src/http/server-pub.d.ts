/// <reference types="express" />
import * as express from "express";
import { Server } from "./server";
export declare function serverPub(server: Server, topRouter: express.Router): express.Router;
