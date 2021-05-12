"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOPDS_browse_v2 = exports.serverOPDS_auth_PATH = exports.serverOPDS_dataUrl_PATH = exports.serverOPDS_browse_v2_PATH = void 0;
var tslib_1 = require("tslib");
var crypto = require("crypto");
var css2json = require("css2json");
var debug_ = require("debug");
var DotProp = require("dot-prop");
var express = require("express");
var jsonMarkup = require("json-markup");
var morgan = require("morgan");
var path = require("path");
var request = require("request");
var requestPromise = require("request-promise-native");
var uuid_1 = require("uuid");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var opds2_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2");
var opds2_authentication_doc_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-authentication-doc");
var opds2_publication_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-publication");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var json_schema_validate_1 = require("../utils/json-schema-validate");
var request_ext_1 = require("./request-ext");
var server_lcp_lsd_show_1 = require("./server-lcp-lsd-show");
var server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:streamer#http/server-opds-browse-v2");
exports.serverOPDS_browse_v2_PATH = "/opds-v2-browse";
exports.serverOPDS_dataUrl_PATH = "/data-url";
exports.serverOPDS_auth_PATH = "/opds-auth";
var salt = crypto.randomBytes(16).toString("hex");
var OPDS_AUTH_ENCRYPTION_KEY_BUFFER = crypto.pbkdf2Sync(uuid_1.v4(), salt, 1000, 32, "sha256");
var OPDS_AUTH_ENCRYPTION_KEY_HEX = OPDS_AUTH_ENCRYPTION_KEY_BUFFER.toString("hex");
var AES_BLOCK_SIZE = 16;
var OPDS_AUTH_ENCRYPTION_IV_BUFFER = Buffer.from(uuid_1.v4()).slice(0, AES_BLOCK_SIZE);
var OPDS_AUTH_ENCRYPTION_IV_HEX = OPDS_AUTH_ENCRYPTION_IV_BUFFER.toString("hex");
function serverOPDS_browse_v2(_server, topRouter) {
    var _this = this;
    var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
    var routerOPDS_browse_v2 = express.Router({ strict: false });
    routerOPDS_browse_v2.use(morgan("combined", { stream: { write: function (msg) { return debug(msg); } } }));
    routerOPDS_browse_v2.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_browse_v2.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            (" '" + exports.serverOPDS_browse_v2_PATH + "/' +") +
            " encodeURIComponent_RFC3986(document.getElementById(\"url\").value);" +
            "location.href = url;}</script>";
        html += "</head>";
        html += "<body><h1>OPDS feed browser</h1>";
        html += "<form onsubmit=\"go();return false;\">" +
            "<input type=\"text\" name=\"url\" id=\"url\" size=\"80\">" +
            "<input type=\"submit\" value=\"Go!\"></form>";
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerOPDS_browse_v2.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_browse_v2.get("/:" + request_ext_1._urlEncoded + "(*)", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var reqparams, authResponseJson, authResponseBase64, authResponseStr, authRequestBase64, urlDecoded, isSecureHttp, rootUrl, failure, success, headers, needsStreamingResponse, response, err_1;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reqparams = req.params;
                    if (!reqparams.urlEncoded) {
                        reqparams.urlEncoded = req.urlEncoded;
                    }
                    authResponseBase64 = req.query.authResponse;
                    if (authResponseBase64) {
                        try {
                            authResponseStr = Buffer.from(authResponseBase64, "base64").toString("utf8");
                            authResponseJson = JSON.parse(authResponseStr);
                        }
                        catch (err) {
                            debug(err);
                        }
                    }
                    authRequestBase64 = req.query.authRequest;
                    urlDecoded = reqparams.urlEncoded;
                    debug(urlDecoded);
                    isSecureHttp = req.secure ||
                        req.protocol === "https" ||
                        req.get("X-Forwarded-Proto") === "https";
                    rootUrl = (isSecureHttp ? "https://" : "http://")
                        + req.headers.host;
                    failure = function (err) {
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                    };
                    success = function (response) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var isAuthStatusCode, redirectUrl, isBadStatusCode, responseData, err_2, responseStr, responseJson, isPublication, isAuth, opds2Feed, opds2FeedJson, validationStr, doValidate, jsonSchemasRootpath, jsonSchemasNames, validationErrors, _i, validationErrors_1, err, val, valueStr, title, val, valueStr, title, pubIndex, jsonPubTitlePath, funk, css, jsonPrettyOPDS2, authDoc, authObj, authLink, imageLink, imageUrl, authHtmlForm;
                        var _a, _b;
                        return tslib_1.__generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    isAuthStatusCode = response.statusCode === 401;
                                    if (isAuthStatusCode &&
                                        authRequestBase64 && authResponseJson && authResponseJson.refresh_token) {
                                        redirectUrl = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v2_PATH + "/")) +
                                            exports.serverOPDS_auth_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(authRequestBase64) +
                                            "?" + request_ext_1._authRefresh + "=" + authResponseJson.refresh_token;
                                        debug("REDIRECT: " + req.originalUrl + " ==> " + redirectUrl);
                                        res.redirect(301, redirectUrl);
                                        return [2];
                                    }
                                    isBadStatusCode = response.statusCode && (response.statusCode < 200 || response.statusCode >= 300);
                                    if (!isAuthStatusCode && isBadStatusCode) {
                                        failure("HTTP CODE " + response.statusCode);
                                        return [2];
                                    }
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 3, , 4]);
                                    return [4, BufferUtils_1.streamToBufferPromise(response)];
                                case 2:
                                    responseData = _c.sent();
                                    return [3, 4];
                                case 3:
                                    err_2 = _c.sent();
                                    debug(err_2);
                                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                        + err_2 + (isAuthStatusCode ? " (Auth 401)" : "") + "</p></body></html>");
                                    return [2];
                                case 4:
                                    responseStr = responseData.toString("utf8");
                                    responseJson = JSON.parse(responseStr);
                                    isPublication = !responseJson.publications &&
                                        !responseJson.navigation &&
                                        !responseJson.groups &&
                                        !responseJson.catalogs &&
                                        responseJson.metadata;
                                    isAuth = !isPublication && responseJson.authentication;
                                    opds2Feed = isPublication ? serializable_1.TaJsonDeserialize(responseJson, opds2_publication_1.OPDSPublication) :
                                        (isAuth ? serializable_1.TaJsonDeserialize(responseJson, opds2_authentication_doc_1.OPDSAuthenticationDoc) :
                                            serializable_1.TaJsonDeserialize(responseJson, opds2_1.OPDSFeed));
                                    opds2FeedJson = serializable_1.TaJsonSerialize(opds2Feed);
                                    doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
                                    if (doValidate) {
                                        jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                                        jsonSchemasNames = [
                                            "opds/publication",
                                            "opds/acquisition-object",
                                            "opds/catalog-entry",
                                            "opds/feed-metadata",
                                            "opds/properties",
                                            "webpub-manifest/publication",
                                            "webpub-manifest/contributor-object",
                                            "webpub-manifest/contributor",
                                            "webpub-manifest/link",
                                            "webpub-manifest/metadata",
                                            "webpub-manifest/subcollection",
                                            "webpub-manifest/properties",
                                            "webpub-manifest/subject",
                                            "webpub-manifest/subject-object",
                                            "webpub-manifest/extensions/epub/metadata",
                                            "webpub-manifest/extensions/epub/subcollections",
                                            "webpub-manifest/extensions/epub/properties",
                                            "webpub-manifest/extensions/presentation/metadata",
                                            "webpub-manifest/extensions/presentation/properties",
                                            "webpub-manifest/language-map",
                                        ];
                                        if (isAuth) {
                                            jsonSchemasNames.unshift("opds/authentication");
                                        }
                                        else if (!isPublication) {
                                            jsonSchemasNames.unshift("opds/feed");
                                        }
                                        validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, opds2FeedJson);
                                        if (validationErrors) {
                                            validationStr = "";
                                            for (_i = 0, validationErrors_1 = validationErrors; _i < validationErrors_1.length; _i++) {
                                                err = validationErrors_1[_i];
                                                debug("JSON Schema validation FAIL.");
                                                debug(err);
                                                if (isPublication) {
                                                    val = err.jsonPath ? DotProp.get(opds2FeedJson, err.jsonPath) : "";
                                                    valueStr = (typeof val === "string") ?
                                                        "" + val :
                                                        ((val instanceof Array || typeof val === "object") ?
                                                            "" + JSON.stringify(val) :
                                                            "");
                                                    debug(valueStr);
                                                    title = DotProp.get(opds2FeedJson, "metadata.title");
                                                    debug(title);
                                                    validationStr +=
                                                        "\n\"" + title + "\"\n\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + ((_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")) + "' (" + err.ajvSchemaPath + ")\n\n";
                                                }
                                                else {
                                                    val = err.jsonPath ? DotProp.get(opds2FeedJson, err.jsonPath) : "";
                                                    valueStr = (typeof val === "string") ?
                                                        "" + val :
                                                        ((val instanceof Array || typeof val === "object") ?
                                                            "" + JSON.stringify(val) :
                                                            "");
                                                    debug(valueStr);
                                                    title = "";
                                                    pubIndex = "";
                                                    if (err.jsonPath && /^publications\.[0-9]+/.test(err.jsonPath)) {
                                                        jsonPubTitlePath = err.jsonPath.replace(/^(publications\.[0-9]+).*/, "$1.metadata.title");
                                                        debug(jsonPubTitlePath);
                                                        title = DotProp.get(opds2FeedJson, jsonPubTitlePath);
                                                        debug(title);
                                                        pubIndex = err.jsonPath.replace(/^publications\.([0-9]+).*/, "$1");
                                                        debug(pubIndex);
                                                    }
                                                    validationStr +=
                                                        "\n___________INDEX___________ #" + pubIndex + " \"" + title + "\"\n\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + ((_b = err.ajvDataPath) === null || _b === void 0 ? void 0 : _b.replace(/^\./, "")) + "' (" + err.ajvSchemaPath + ")\n\n";
                                                }
                                            }
                                        }
                                    }
                                    funk = function (obj) {
                                        if ((obj.href && typeof obj.href === "string") ||
                                            (obj.Href && typeof obj.Href === "string")) {
                                            var fullHref = obj.href ? obj.href : obj.Href;
                                            var isDataUrl = /^data:/.test(fullHref);
                                            var isMailUrl = /^mailto:/.test(fullHref);
                                            var notFull = !isDataUrl && !isMailUrl && !UrlUtils_1.isHTTP(fullHref);
                                            if (notFull) {
                                                fullHref = UrlUtils_1.ensureAbsolute(urlDecoded, fullHref);
                                            }
                                            if ((obj.type && obj.type.indexOf("opds") >= 0 && obj.type.indexOf("json") >= 0) ||
                                                (obj.Type && obj.Type.indexOf("opds") >= 0 && obj.Type.indexOf("json") >= 0)) {
                                                obj.__href__ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v2_PATH + "/")) +
                                                    exports.serverOPDS_browse_v2_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(fullHref);
                                                if (authRequestBase64 && authResponseBase64) {
                                                    obj.__href__AUTH = obj.__href__ +
                                                        "?" +
                                                        request_ext_1._authResponse + "=" + UrlUtils_1.encodeURIComponent_RFC3986(authResponseBase64) +
                                                        "&" +
                                                        request_ext_1._authRequest + "=" + UrlUtils_1.encodeURIComponent_RFC3986(authRequestBase64);
                                                }
                                            }
                                            else if (obj.type === "application/vnd.readium.lcp.license.v1.0+json") {
                                                obj.__href__ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v2_PATH + "/")) +
                                                    server_lcp_lsd_show_1.serverLCPLSD_show_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(fullHref);
                                                if (authRequestBase64 && authResponseBase64) {
                                                    obj.__href__AUTH = obj.__href__ +
                                                        "?" +
                                                        request_ext_1._authResponse + "=" + UrlUtils_1.encodeURIComponent_RFC3986(authResponseBase64) +
                                                        "&" +
                                                        request_ext_1._authRequest + "=" + UrlUtils_1.encodeURIComponent_RFC3986(authRequestBase64);
                                                }
                                            }
                                            else if ((obj.type && obj.type.indexOf("application/atom+xml") >= 0) ||
                                                (obj.Type && obj.Type.indexOf("application/atom+xml") >= 0)) {
                                                obj.__href__ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v2_PATH + "/")) +
                                                    server_opds_convert_v1_to_v2_1.serverOPDS_convert_v1_to_v2_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(fullHref);
                                            }
                                            else if (isDataUrl) {
                                            }
                                            else if (notFull && !isMailUrl) {
                                                obj.__href__ = fullHref;
                                            }
                                        }
                                    };
                                    JsonUtils_1.traverseJsonObjects(opds2FeedJson, funk);
                                    css = css2json(jsonStyle);
                                    jsonPrettyOPDS2 = jsonMarkup(opds2FeedJson, css);
                                    jsonPrettyOPDS2 = jsonPrettyOPDS2.replace(/>"data:image\/(.*)"</g, "><a href=\"data:image/$1\" target=\"_BLANK\"><img style=\"max-width: 100px;\" src=\"data:image/$1\"></a><");
                                    authDoc = isAuth ? opds2Feed : undefined;
                                    authObj = (authDoc && authDoc.Authentication) ? authDoc.Authentication.find(function (auth) {
                                        return auth.Type === "http://opds-spec.org/auth/oauth/password";
                                    }) : undefined;
                                    authLink = authObj ? (authObj.Links && authObj.Links.find(function (link) {
                                        return link.Rel && link.Rel.includes("authenticate") && link.TypeLink === "application/json";
                                    })) : undefined;
                                    imageLink = authDoc ? (authDoc.Links && authDoc.Links.find(function (link) {
                                        return link.Rel && link.Rel.includes("logo") && link.TypeLink && link.TypeLink.startsWith("image/");
                                    })) : undefined;
                                    imageUrl = imageLink ? UrlUtils_1.ensureAbsolute(urlDecoded, imageLink.Href) : undefined;
                                    authHtmlForm = !authObj ? "" : "\n<hr>\n<form id=\"authForm\">\n    <input type=\"text\" name=\"login\" id=\"login\" size=\"40\">\n    <span>" + authObj.Labels.Login + "</span>\n<br><br>\n    <input type=\"password\" name=\"password\" id=\"password\" size=\"40\">\n    <span>" + authObj.Labels.Password + "</span>\n<br><br>\n    <input type=\"submit\" value=\"Authenticate\">\n</form>\n" + (imageUrl ? "<img src=\"" + imageUrl + "\" />" : "") + "\n<script type=\"text/javascript\">\n// document.addEventListener(\"DOMContentLoaded\", (event) => {\n// });\nconst formElement = document.getElementById(\"authForm\");\nformElement.addEventListener(\"submit\", (event) => {\n    event.preventDefault();\n    doAuth();\n});\nfunction encodeURIComponent_RFC3986(str) {\n    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {\n        return \"%\" + c.charCodeAt(0).toString(16);\n    });\n}\nfunction encodeFormData(json) {\n    if (!json) {\n        return \"\";\n    }\n    return Object.keys(json).map((key) => {\n        return encodeURIComponent_RFC3986(key) + \"=\" + (json[key] ? encodeURIComponent_RFC3986(json[key]) : \"_\");\n    }).join(\"&\");\n}\nfunction hexStrToArrayBuffer(hexStr) {\n    return new Uint8Array(\n        hexStr\n        .match(/.{1,2}/g)\n        .map((byte) => {\n            return parseInt(byte, 16);\n        })\n    );\n}\nfunction doAuth() {\n    " + (authLink ? "\n    const bodyJson = {\n        targetUrl: \"" + urlDecoded + "\",\n        authUrl: \"" + authLink.Href + "\",\n        grant_type: \"password\",\n        username: document.getElementById(\"login\").value,\n        password: document.getElementById(\"password\").value\n    };\n    const bodyStr = JSON.stringify(bodyJson);\n\n    const textEncoder = new TextEncoder(\"utf-8\");\n    const bodyStrEncoded = textEncoder.encode(bodyStr); // Uint8Array\n\n    const keyPromise = window.crypto.subtle.importKey(\n        \"raw\",\n        hexStrToArrayBuffer(\"" + OPDS_AUTH_ENCRYPTION_KEY_HEX + "\"),\n        { \"name\": \"AES-CBC\" },\n        false,\n        [\"encrypt\", \"decrypt\"]\n    );\n    keyPromise.then((key) => { // CryptoKey\n\n        const iv = hexStrToArrayBuffer(\"" + OPDS_AUTH_ENCRYPTION_IV_HEX + "\");\n        const encryptedBodyPromise = window.crypto.subtle.encrypt(\n            {\n                name: \"AES-CBC\",\n                iv\n            },\n            key,\n            bodyStrEncoded\n        );\n        encryptedBodyPromise.then((encryptedBody) => { // ArrayBuffer\n            // const arg = String.fromCharCode.apply(null, new Uint8Array(encryptedBody));\n            const arg = new Uint8Array(encryptedBody).reduce((data, byte) => {\n                return data + String.fromCharCode(byte);\n            }, '');\n            const encryptedBodyB64 = window.btoa(arg);\n\n            const url = location.origin + \"" + exports.serverOPDS_auth_PATH + "/\" + encodeURIComponent_RFC3986(encryptedBodyB64);\n            location.href = url;\n        }).catch((err) => {\n            console.log(err);\n        });\n    }).catch((err) => {\n        console.log(err);\n    });\n\n/* does not work because of HTTP CORS, so we forward to NodeJS fetch/request via the serverOPDS_auth_PATH HTTP route\n    window.fetch(\"" + authLink.Href + "\", {\n        method: \"POST\",\n        headers: {\n            \"Content-Type\": \"application/x-www-form-url-encoded\",\n            \"Accept\": \"application/json\"\n        },\n        body: encodeFormData(bodyJson)\n    })\n    .then((response) => {\n        const res = JSON.stringify(response, null, 4);\n        console.log(res);\n    })\n    .catch((error) => {\n        console.log(error);\n    });\n*/\n    " :
                                        "window.alert(\"no auth link!\");") + "\n}\n</script>";
                                    res.status(200).send("<html><body>" +
                                        "<h1>OPDS2 JSON " +
                                        (isPublication ? "entry" : (isAuth ? "authentication" : "feed")) +
                                        " (OPDS2) " + (isAuthStatusCode ? " [HTTP 401]" : "") + "</h1>" +
                                        "<h2><a href=\"" + urlDecoded + "\">" + urlDecoded + "</a></h2>" +
                                        "<hr>" +
                                        "<div style=\"overflow-x: auto;margin:0;padding:0;width:100%;height:auto;\">" +
                                        jsonPrettyOPDS2 + "</div>" +
                                        (doValidate ? (validationStr ? ("<hr><p><pre>" + validationStr + "</pre></p>") : ("<hr><p>JSON SCHEMA OK.</p>")) : "") +
                                        authHtmlForm +
                                        "</body></html>");
                                    return [2];
                            }
                        });
                    }); };
                    headers = {
                        "Accept": "application/json,application/xml",
                        "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
                        "User-Agent": "READIUM2",
                    };
                    if (authResponseJson && authResponseJson.access_token) {
                        headers.Authorization = "Bearer " + authResponseJson.access_token;
                    }
                    needsStreamingResponse = true;
                    if (!needsStreamingResponse) return [3, 1];
                    request.get({
                        headers: headers,
                        method: "GET",
                        uri: urlDecoded,
                    })
                        .on("response", success)
                        .on("error", failure);
                    return [3, 7];
                case 1:
                    response = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4, requestPromise({
                            headers: headers,
                            method: "GET",
                            resolveWithFullResponse: true,
                            uri: urlDecoded,
                        })];
                case 3:
                    response = _a.sent();
                    return [3, 5];
                case 4:
                    err_1 = _a.sent();
                    failure(err_1);
                    return [2];
                case 5: return [4, success(response)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2];
            }
        });
    }); });
    topRouter.use(exports.serverOPDS_browse_v2_PATH, routerOPDS_browse_v2);
    var routerOPDS_auth = express.Router({ strict: false });
    routerOPDS_auth.use(morgan("combined", { stream: { write: function (msg) { return debug(msg); } } }));
    routerOPDS_auth.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_auth.get("/", function (_req, res) {
        var html = "<html><body><h1>NOPE</h1></body></html>";
        res.status(200).send(html);
    });
    routerOPDS_auth.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_auth.get("/:" + request_ext_1._urlEncoded + "(*)", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var reqparams, base64Payload, refreshToken, isSecureHttp, rootUrl, encrypted, decrypteds, decryptStream, buff1, buff2, decrypted, nPaddingBytes, size, decryptedStr, decryptedJson_1, authUrl, targetUrl_1, failure_1, success, headers, needsStreamingResponse, response, err_3, err_4;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reqparams = req.params;
                    if (!reqparams.urlEncoded) {
                        reqparams.urlEncoded = req.urlEncoded;
                    }
                    base64Payload = reqparams.urlEncoded;
                    refreshToken = req.query.authRefresh;
                    isSecureHttp = req.secure ||
                        req.protocol === "https" ||
                        req.get("X-Forwarded-Proto") === "https";
                    rootUrl = (isSecureHttp ? "https://" : "http://")
                        + req.headers.host;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    encrypted = Buffer.from(base64Payload, "base64");
                    decrypteds = [];
                    decryptStream = crypto.createDecipheriv("aes-256-cbc", OPDS_AUTH_ENCRYPTION_KEY_BUFFER, OPDS_AUTH_ENCRYPTION_IV_BUFFER);
                    decryptStream.setAutoPadding(false);
                    buff1 = decryptStream.update(encrypted);
                    if (buff1) {
                        decrypteds.push(buff1);
                    }
                    buff2 = decryptStream.final();
                    if (buff2) {
                        decrypteds.push(buff2);
                    }
                    decrypted = Buffer.concat(decrypteds);
                    nPaddingBytes = decrypted[decrypted.length - 1];
                    size = encrypted.length - nPaddingBytes;
                    decryptedStr = decrypted.slice(0, size).toString("utf8");
                    decryptedJson_1 = JSON.parse(decryptedStr);
                    authUrl = decryptedJson_1.authUrl;
                    delete decryptedJson_1.authUrl;
                    targetUrl_1 = decryptedJson_1.targetUrl;
                    delete decryptedJson_1.targetUrl;
                    if (refreshToken) {
                        decryptedJson_1.grant_type = "refresh_token";
                        decryptedJson_1.refresh_token = refreshToken;
                    }
                    failure_1 = function (err) {
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                    };
                    success = function (response) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var responseData, err_5, responseStr, responseJson, targetUrl_, refreshTokenUrl;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                                        failure_1("HTTP CODE " + response.statusCode);
                                        return [2];
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4, BufferUtils_1.streamToBufferPromise(response)];
                                case 2:
                                    responseData = _a.sent();
                                    return [3, 4];
                                case 3:
                                    err_5 = _a.sent();
                                    debug(err_5);
                                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                        + err_5 + "</p></body></html>");
                                    return [2];
                                case 4:
                                    try {
                                        responseStr = responseData.toString("utf8");
                                        responseJson = JSON.parse(responseStr);
                                        targetUrl_ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_auth_PATH + "/")) +
                                            exports.serverOPDS_browse_v2_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(targetUrl_1) +
                                            "?" + request_ext_1._authResponse + "=" +
                                            UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(JSON.stringify(responseJson)).toString("base64")) +
                                            "&" + request_ext_1._authRequest + "=" + UrlUtils_1.encodeURIComponent_RFC3986(base64Payload);
                                        refreshTokenUrl = responseJson.refresh_token ? rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_auth_PATH + "/")) +
                                            exports.serverOPDS_auth_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(base64Payload) +
                                            "?" + request_ext_1._authRefresh + "=" + UrlUtils_1.encodeURIComponent_RFC3986(responseJson.refresh_token) : undefined;
                                        decryptedJson_1.password = "***";
                                        res.status(200).send("\n                        <html><body>\n                        <hr>\n                        <a href=\"" + targetUrl_ + "\">" + targetUrl_1 + "</a>\n                        <hr>\n                        <pre>" + JSON.stringify(decryptedJson_1, null, 4) + "</pre>\n                        <hr>\n                        <pre>" + JSON.stringify(responseJson, null, 4) + "</pre>\n                        <hr>\n                        " + (refreshTokenUrl ? "<a href=\"" + refreshTokenUrl + "\">FORCE REFRESH TOKEN</a>" : "") + "\n                        <hr>\n                        </body></html>\n                    ");
                                    }
                                    catch (err) {
                                        debug(err);
                                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                            + err + "</p></body></html>");
                                        return [2];
                                    }
                                    return [2];
                            }
                        });
                    }); };
                    headers = {
                        "Accept": "application/json,application/xml",
                        "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
                        "Content-Type": "application/x-www-form-url-encoded",
                        "User-Agent": "READIUM2",
                    };
                    needsStreamingResponse = true;
                    if (!needsStreamingResponse) return [3, 2];
                    request.post({
                        form: decryptedJson_1,
                        headers: headers,
                        method: "POST",
                        uri: authUrl,
                    })
                        .on("response", success)
                        .on("error", failure_1);
                    return [3, 8];
                case 2:
                    response = void 0;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4, requestPromise({
                            form: decryptedJson_1,
                            headers: headers,
                            method: "POST",
                            resolveWithFullResponse: true,
                            uri: authUrl,
                        })];
                case 4:
                    response = _a.sent();
                    return [3, 6];
                case 5:
                    err_3 = _a.sent();
                    failure_1(err_3);
                    return [2];
                case 6: return [4, success(response)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3, 10];
                case 9:
                    err_4 = _a.sent();
                    debug(err_4);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + "--" + "</p></body></html>");
                    return [3, 10];
                case 10: return [2];
            }
        });
    }); });
    topRouter.use(exports.serverOPDS_auth_PATH, routerOPDS_auth);
}
exports.serverOPDS_browse_v2 = serverOPDS_browse_v2;
//# sourceMappingURL=server-opds-browse-v2.js.map