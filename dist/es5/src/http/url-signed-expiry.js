"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyExpiringResourceURL = exports.signExpiringResourceURLs = exports.URL_SIGNED_EXPIRY_QUERY_PARAM_NAME = void 0;
var debug_ = require("debug");
var crypto = require("crypto");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var debug = debug_("r2:streamer#http/url-signed-expiry");
var DEFAULT_EXPIRE_SECONDS = 86400;
exports.URL_SIGNED_EXPIRY_QUERY_PARAM_NAME = "r2tkn";
var computeHashSecret = function () {
    if (!process.env.R2_STREAMER_URL_EXPIRE_SECRET) {
        return undefined;
    }
    var checkSumSecret = crypto.createHash("sha256");
    checkSumSecret.update(process.env.R2_STREAMER_URL_EXPIRE_SECRET);
    var hashSecret = checkSumSecret.digest("hex");
    return hashSecret;
};
var signExpiringResourceURLs = function (rootUrl, pathBase64Str, jsonObj) {
    var hashSecret = computeHashSecret();
    if (!hashSecret) {
        return;
    }
    var timestamp = Date.now();
    var expiry = DEFAULT_EXPIRE_SECONDS;
    if (process.env.R2_STREAMER_URL_EXPIRE_SECONDS) {
        try {
            expiry = parseInt(process.env.R2_STREAMER_URL_EXPIRE_SECONDS, 10);
        }
        catch (err) {
            debug(err);
        }
    }
    (0, JsonUtils_1.traverseJsonObjects)(jsonObj, function (obj) {
        if (obj.href && typeof obj.href === "string"
            && !/^https?:\/\//.test(obj.href) && !/^data:\/\//.test(obj.href)) {
            var publicationRootUrl = new URL("".concat(rootUrl, "/"));
            var url = new URL(obj.href, publicationRootUrl);
            var resourcePath = url.pathname.replace(publicationRootUrl.pathname, "");
            var checkSumData = crypto.createHash("sha256");
            checkSumData.update("".concat(timestamp, "_").concat(hashSecret, "_").concat(resourcePath, "_").concat(expiry, "_").concat(pathBase64Str));
            var hashData = checkSumData.digest("hex");
            var queryParamJson = {
                hash: hashData,
                timestamp: timestamp,
                expiry: expiry,
            };
            var queryParamValue = Buffer.from(JSON.stringify(queryParamJson)).toString("base64");
            url.searchParams.append(exports.URL_SIGNED_EXPIRY_QUERY_PARAM_NAME, queryParamValue);
            obj.href = url.toString().replace(publicationRootUrl.toString(), "");
        }
    });
};
exports.signExpiringResourceURLs = signExpiringResourceURLs;
var verifyExpiringResourceURL = function (queryParamValue, pathBase64Str, pathInZip) {
    var hashSecret = computeHashSecret();
    if (!hashSecret) {
        return true;
    }
    if (!queryParamValue) {
        return false;
    }
    try {
        var queryParamStr = Buffer.from(queryParamValue, "base64").toString("utf8");
        var json = JSON.parse(queryParamStr);
        if (!json.hash || !json.timestamp || !json.expiry) {
            return false;
        }
        var resourcePath = pathInZip;
        var checkSumData = crypto.createHash("sha256");
        checkSumData.update("".concat(json.timestamp, "_").concat(hashSecret, "_").concat(resourcePath, "_").concat(json.expiry, "_").concat(pathBase64Str));
        var hashData = checkSumData.digest("hex");
        if (hashData !== json.hash) {
            debug("HASH diff! ".concat(hashData, " !== ").concat(json.hash, " (").concat(resourcePath, ")"));
            return false;
        }
        var timestamp = Date.now();
        var timeDiff = timestamp - json.timestamp;
        if (timeDiff > (json.expiry * 1000)) {
            debug("Resource EXPIRED! ".concat(timeDiff, " > ").concat(json.expiry, " (").concat(resourcePath, ")"));
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