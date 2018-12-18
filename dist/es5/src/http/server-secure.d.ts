import * as express from "express";
import { Server } from "./server";
export interface IHTTPHeaderNameValue {
    name: string;
    value: string;
}
export declare function serverSecureHTTPHeader(server: Server, url: string): IHTTPHeaderNameValue | undefined;
export declare function serverSecure(server: Server, topRouter: express.Application): void;
