/// <reference types="express" />
import * as express from "express";
import { Server } from "./server";
export declare function serverUrl(_server: Server, topRouter: express.Router): void;
