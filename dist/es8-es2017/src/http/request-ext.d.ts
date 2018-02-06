import * as express from "express";
import { mediaOverlayURLParam } from "r2-shared-js/dist/es8-es2017/src/parser/epub";
export declare const _pathBase64 = "pathBase64";
export declare const _asset = "asset";
export declare const _jsonPath = "jsonPath";
export declare const _urlEncoded = "urlEncoded";
export declare const _show = "show";
export declare const _version = "version";
export interface IRequestPayloadExtension extends express.Request {
    lcpPass64: string;
    pathBase64: string;
    asset: string;
    jsonPath: string;
    urlEncoded: string;
    [mediaOverlayURLParam]: string;
}
export interface IRequestQueryParams {
    show: string;
    canonical: string;
    [mediaOverlayURLParam]: string;
}
