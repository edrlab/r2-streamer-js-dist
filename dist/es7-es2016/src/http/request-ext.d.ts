import * as express from "express";
import { mediaOverlayURLParam } from "r2-shared-js/dist/es7-es2016/src/parser/epub";
export declare const URL_PARAM_SESSION_INFO = "r2_SESSION_INFO";
export declare const _pathBase64 = "pathBase64";
export declare const _asset = "asset";
export declare const _jsonPath = "jsonPath";
export declare const _urlEncoded = "urlEncoded";
export declare const _show = "show";
export declare const _authResponse = "authResponse";
export declare const _authRequest = "authRequest";
export declare const _authRefresh = "authRefresh";
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
    authResponse: string;
    authRequest: string;
    authRefresh: string;
    [mediaOverlayURLParam]: string;
    [URL_PARAM_SESSION_INFO]: string;
    [key: string]: string;
}
