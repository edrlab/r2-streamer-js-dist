"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyExpiringResourceURL = exports.signExpiringResourceURLs = exports.URL_SIGNED_EXPIRY_QUERY_PARAM_NAME = void 0;
const debug_ = require("debug");
const crypto = require("crypto");
const JsonUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/JsonUtils");
const debug = debug_("r2:streamer#http/url-signed-expiry");
const DEFAULT_EXPIRE_SECONDS = 86400;
exports.URL_SIGNED_EXPIRY_QUERY_PARAM_NAME = "r2tkn";
const computeHashSecret = () => {
    if (!process.env.R2_STREAMER_URL_EXPIRE_SECRET) {
        return undefined;
    }
    const checkSumSecret = crypto.createHash("sha256");
    checkSumSecret.update(process.env.R2_STREAMER_URL_EXPIRE_SECRET);
    const hashSecret = checkSumSecret.digest("hex");
    return hashSecret;
};
const signExpiringResourceURLs = (rootUrl, pathBase64Str, jsonObj) => {
    const hashSecret = computeHashSecret();
    if (!hashSecret) {
        return;
    }
    const timestamp = Date.now();
    let expiry = DEFAULT_EXPIRE_SECONDS;
    if (process.env.R2_STREAMER_URL_EXPIRE_SECONDS) {
        try {
            expiry = parseInt(process.env.R2_STREAMER_URL_EXPIRE_SECONDS, 10);
        }
        catch (err) {
            debug(err);
        }
    }
    (0, JsonUtils_1.traverseJsonObjects)(jsonObj, (obj) => {
        if (obj.href && typeof obj.href === "string"
            && !/^https?:\/\//.test(obj.href) && !/^data:\/\//.test(obj.href)) {
            const publicationRootUrl = new URL(`${rootUrl}/`);
            const url = new URL(obj.href, publicationRootUrl);
            const resourcePath = url.pathname.replace(publicationRootUrl.pathname, "");
            const checkSumData = crypto.createHash("sha256");
            checkSumData.update(`${timestamp}_${hashSecret}_${resourcePath}_${expiry}_${pathBase64Str}`);
            const hashData = checkSumData.digest("hex");
            const queryParamJson = {
                hash: hashData,
                timestamp,
                expiry,
            };
            const queryParamValue = Buffer.from(JSON.stringify(queryParamJson)).toString("base64");
            url.searchParams.append(exports.URL_SIGNED_EXPIRY_QUERY_PARAM_NAME, queryParamValue);
            obj.href = url.toString().replace(publicationRootUrl.toString(), "");
        }
    });
};
exports.signExpiringResourceURLs = signExpiringResourceURLs;
const verifyExpiringResourceURL = (queryParamValue, pathBase64Str, pathInZip) => {
    const hashSecret = computeHashSecret();
    if (!hashSecret) {
        return true;
    }
    if (!queryParamValue) {
        return false;
    }
    try {
        const queryParamStr = Buffer.from(queryParamValue, "base64").toString("utf8");
        const json = JSON.parse(queryParamStr);
        if (!json.hash || !json.timestamp || !json.expiry) {
            return false;
        }
        const resourcePath = pathInZip;
        const checkSumData = crypto.createHash("sha256");
        checkSumData.update(`${json.timestamp}_${hashSecret}_${resourcePath}_${json.expiry}_${pathBase64Str}`);
        const hashData = checkSumData.digest("hex");
        if (hashData !== json.hash) {
            debug(`HASH diff! ${hashData} !== ${json.hash} (${resourcePath})`);
            return false;
        }
        const timestamp = Date.now();
        const timeDiff = timestamp - json.timestamp;
        if (timeDiff > (json.expiry * 1000)) {
            debug(`Resource EXPIRED! ${timeDiff} > ${json.expiry} (${resourcePath})`);
            return false;
        }
        return true;
    }
    catch (e) {
        debug(e);
    }
    return false;
};
exports.verifyExpiringResourceURL = verifyExpiringResourceURL;
//# sourceMappingURL=url-signed-expiry.js.map