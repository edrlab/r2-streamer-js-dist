"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOPDS_browse_v2 = exports.serverOPDS_auth_PATH = exports.serverOPDS_dataUrl_PATH = exports.serverOPDS_browse_v2_PATH = void 0;
const tslib_1 = require("tslib");
const crypto = require("crypto");
const css2json = require("css2json");
const debug_ = require("debug");
const DotProp = require("dot-prop");
const express = require("express");
const jsonMarkup = require("json-markup");
const morgan = require("morgan");
const path = require("path");
const request = require("request");
const requestPromise = require("request-promise-native");
const uuid_1 = require("uuid");
const serializable_1 = require("r2-lcp-js/dist/es6-es2015/src/serializable");
const opds2_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2");
const opds2_authentication_doc_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2-authentication-doc");
const opds2_publication_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2-publication");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/JsonUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const json_schema_validate_1 = require("../utils/json-schema-validate");
const request_ext_1 = require("./request-ext");
const server_lcp_lsd_show_1 = require("./server-lcp-lsd-show");
const server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:streamer#http/server-opds-browse-v2");
exports.serverOPDS_browse_v2_PATH = "/opds-v2-browse";
exports.serverOPDS_dataUrl_PATH = "/data-url";
exports.serverOPDS_auth_PATH = "/opds-auth";
const salt = crypto.randomBytes(16).toString("hex");
const OPDS_AUTH_ENCRYPTION_KEY_BUFFER = crypto.pbkdf2Sync(uuid_1.v4(), salt, 1000, 32, "sha256");
const OPDS_AUTH_ENCRYPTION_KEY_HEX = OPDS_AUTH_ENCRYPTION_KEY_BUFFER.toString("hex");
const AES_BLOCK_SIZE = 16;
const OPDS_AUTH_ENCRYPTION_IV_BUFFER = Buffer.from(uuid_1.v4()).slice(0, AES_BLOCK_SIZE);
const OPDS_AUTH_ENCRYPTION_IV_HEX = OPDS_AUTH_ENCRYPTION_IV_BUFFER.toString("hex");
function serverOPDS_browse_v2(_server, topRouter) {
    const jsonStyle = `
.json-markup {
    line-height: 17px;
    font-size: 13px;
    font-family: monospace;
    white-space: pre;
}
.json-markup-key {
    font-weight: bold;
}
.json-markup-bool {
    color: firebrick;
}
.json-markup-string {
    color: green;
}
.json-markup-null {
    color: gray;
}
.json-markup-number {
    color: blue;
}
`;
    const routerOPDS_browse_v2 = express.Router({ strict: false });
    routerOPDS_browse_v2.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerOPDS_browse_v2.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_browse_v2.get("/", (_req, res) => {
        let html = "<html><head>";
        html += `<script type="text/javascript">function encodeURIComponent_RFC3986(str) { ` +
            `return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { ` +
            `return "%" + c.charCodeAt(0).toString(16); }); }` +
            `function go(evt) {` +
            `if (evt) { evt.preventDefault(); } var url = ` +
            `location.origin +` +
            ` '${exports.serverOPDS_browse_v2_PATH}/' +` +
            ` encodeURIComponent_RFC3986(document.getElementById("url").value);` +
            `location.href = url;}</script>`;
        html += "</head>";
        html += "<body><h1>OPDS feed browser</h1>";
        html += `<form onsubmit="go();return false;">` +
            `<input type="text" name="url" id="url" size="80">` +
            `<input type="submit" value="Go!"></form>`;
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerOPDS_browse_v2.param("urlEncoded", (req, _res, next, value, _name) => {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_browse_v2.get("/:" + request_ext_1._urlEncoded + "(*)", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const reqparams = req.params;
        if (!reqparams.urlEncoded) {
            reqparams.urlEncoded = req.urlEncoded;
        }
        let authResponseJson;
        const authResponseBase64 = req.query.authResponse;
        if (authResponseBase64) {
            try {
                const authResponseStr = Buffer.from(authResponseBase64, "base64").toString("utf8");
                authResponseJson = JSON.parse(authResponseStr);
            }
            catch (err) {
                debug(err);
            }
        }
        const authRequestBase64 = req.query.authRequest;
        const urlDecoded = reqparams.urlEncoded;
        debug(urlDecoded);
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host;
        const failure = (err) => {
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
        };
        const success = (response) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const isAuthStatusCode = response.statusCode === 401;
            if (isAuthStatusCode &&
                authRequestBase64 && authResponseJson && authResponseJson.refresh_token) {
                const redirectUrl = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v2_PATH + "/")) +
                    exports.serverOPDS_auth_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(authRequestBase64) +
                    "?" + request_ext_1._authRefresh + "=" + authResponseJson.refresh_token;
                debug(`REDIRECT: ${req.originalUrl} ==> ${redirectUrl}`);
                res.redirect(301, redirectUrl);
                return;
            }
            const isBadStatusCode = response.statusCode && (response.statusCode < 200 || response.statusCode >= 300);
            if (!isAuthStatusCode && isBadStatusCode) {
                failure("HTTP CODE " + response.statusCode);
                return;
            }
            let responseData;
            try {
                responseData = yield BufferUtils_1.streamToBufferPromise(response);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + (isAuthStatusCode ? " (Auth 401)" : "") + "</p></body></html>");
                return;
            }
            const responseStr = responseData.toString("utf8");
            const responseJson = JSON.parse(responseStr);
            const isPublication = !responseJson.publications &&
                !responseJson.navigation &&
                !responseJson.groups &&
                !responseJson.catalogs &&
                responseJson.metadata;
            const isAuth = !isPublication && responseJson.authentication;
            const opds2Feed = isPublication ? serializable_1.TaJsonDeserialize(responseJson, opds2_publication_1.OPDSPublication) :
                (isAuth ? serializable_1.TaJsonDeserialize(responseJson, opds2_authentication_doc_1.OPDSAuthenticationDoc) :
                    serializable_1.TaJsonDeserialize(responseJson, opds2_1.OPDSFeed));
            const opds2FeedJson = serializable_1.TaJsonSerialize(opds2Feed);
            let validationStr;
            const doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
            if (doValidate) {
                const jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                const jsonSchemasNames = [
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
                const validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, opds2FeedJson);
                if (validationErrors) {
                    validationStr = "";
                    for (const err of validationErrors) {
                        debug("JSON Schema validation FAIL.");
                        debug(err);
                        if (isPublication) {
                            const val = err.jsonPath ? DotProp.get(opds2FeedJson, err.jsonPath) : "";
                            const valueStr = (typeof val === "string") ?
                                `${val}` :
                                ((val instanceof Array || typeof val === "object") ?
                                    `${JSON.stringify(val)}` :
                                    "");
                            debug(valueStr);
                            const title = DotProp.get(opds2FeedJson, "metadata.title");
                            debug(title);
                            validationStr +=
                                `\n"${title}"\n\n${err.ajvMessage}: ${valueStr}\n\n'${(_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
                        }
                        else {
                            const val = err.jsonPath ? DotProp.get(opds2FeedJson, err.jsonPath) : "";
                            const valueStr = (typeof val === "string") ?
                                `${val}` :
                                ((val instanceof Array || typeof val === "object") ?
                                    `${JSON.stringify(val)}` :
                                    "");
                            debug(valueStr);
                            let title = "";
                            let pubIndex = "";
                            if (err.jsonPath && /^publications\.[0-9]+/.test(err.jsonPath)) {
                                const jsonPubTitlePath = err.jsonPath.replace(/^(publications\.[0-9]+).*/, "$1.metadata.title");
                                debug(jsonPubTitlePath);
                                title = DotProp.get(opds2FeedJson, jsonPubTitlePath);
                                debug(title);
                                pubIndex = err.jsonPath.replace(/^publications\.([0-9]+).*/, "$1");
                                debug(pubIndex);
                            }
                            validationStr +=
                                `\n___________INDEX___________ #${pubIndex} "${title}"\n\n${err.ajvMessage}: ${valueStr}\n\n'${(_b = err.ajvDataPath) === null || _b === void 0 ? void 0 : _b.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
                        }
                    }
                }
            }
            const funk = (obj) => {
                if ((obj.href && typeof obj.href === "string") ||
                    (obj.Href && typeof obj.Href === "string")) {
                    let fullHref = obj.href ? obj.href : obj.Href;
                    const isDataUrl = /^data:/.test(fullHref);
                    const isMailUrl = /^mailto:/.test(fullHref);
                    const notFull = !isDataUrl && !isMailUrl && !UrlUtils_1.isHTTP(fullHref);
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
            const css = css2json(jsonStyle);
            let jsonPrettyOPDS2 = jsonMarkup(opds2FeedJson, css);
            jsonPrettyOPDS2 = jsonPrettyOPDS2.replace(/>"data:image\/(.*)"</g, "><a href=\"data:image/$1\" target=\"_BLANK\"><img style=\"max-width: 100px;\" src=\"data:image/$1\"></a><");
            const authDoc = isAuth ? opds2Feed : undefined;
            const authObj = (authDoc && authDoc.Authentication) ? authDoc.Authentication.find((auth) => {
                return auth.Type === "http://opds-spec.org/auth/oauth/password";
            }) : undefined;
            const authLink = authObj ? (authObj.Links && authObj.Links.find((link) => {
                return link.Rel && link.Rel.includes("authenticate") && link.TypeLink === "application/json";
            })) : undefined;
            const imageLink = authDoc ? (authDoc.Links && authDoc.Links.find((link) => {
                return link.Rel && link.Rel.includes("logo") && link.TypeLink && link.TypeLink.startsWith("image/");
            })) : undefined;
            const imageUrl = imageLink ? UrlUtils_1.ensureAbsolute(urlDecoded, imageLink.Href) : undefined;
            const authHtmlForm = !authObj ? "" : `
<hr>
<form id="authForm">
    <input type="text" name="login" id="login" size="40">
    <span>${authObj.Labels.Login}</span>
<br><br>
    <input type="password" name="password" id="password" size="40">
    <span>${authObj.Labels.Password}</span>
<br><br>
    <input type="submit" value="Authenticate">
</form>
${imageUrl ? `<img src="${imageUrl}" />` : ``}
<script type="text/javascript">
// document.addEventListener("DOMContentLoaded", (event) => {
// });
const formElement = document.getElementById("authForm");
formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    doAuth();
});
function encodeURIComponent_RFC3986(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
        return "%" + c.charCodeAt(0).toString(16);
    });
}
function encodeFormData(json) {
    if (!json) {
        return "";
    }
    return Object.keys(json).map((key) => {
        return encodeURIComponent_RFC3986(key) + "=" + (json[key] ? encodeURIComponent_RFC3986(json[key]) : "_");
    }).join("&");
}
function hexStrToArrayBuffer(hexStr) {
    return new Uint8Array(
        hexStr
        .match(/.{1,2}/g)
        .map((byte) => {
            return parseInt(byte, 16);
        })
    );
}
function doAuth() {
    ${authLink ? `
    const bodyJson = {
        targetUrl: "${urlDecoded}",
        authUrl: "${authLink.Href}",
        grant_type: "password",
        username: document.getElementById("login").value,
        password: document.getElementById("password").value
    };
    const bodyStr = JSON.stringify(bodyJson);

    const textEncoder = new TextEncoder("utf-8");
    const bodyStrEncoded = textEncoder.encode(bodyStr); // Uint8Array

    const keyPromise = window.crypto.subtle.importKey(
        "raw",
        hexStrToArrayBuffer("${OPDS_AUTH_ENCRYPTION_KEY_HEX}"),
        { "name": "AES-CBC" },
        false,
        ["encrypt", "decrypt"]
    );
    keyPromise.then((key) => { // CryptoKey

        const iv = hexStrToArrayBuffer("${OPDS_AUTH_ENCRYPTION_IV_HEX}");
        const encryptedBodyPromise = window.crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv
            },
            key,
            bodyStrEncoded
        );
        encryptedBodyPromise.then((encryptedBody) => { // ArrayBuffer
            // const arg = String.fromCharCode.apply(null, new Uint8Array(encryptedBody));
            const arg = new Uint8Array(encryptedBody).reduce((data, byte) => {
                return data + String.fromCharCode(byte);
            }, '');
            const encryptedBodyB64 = window.btoa(arg);

            const url = location.origin + "${exports.serverOPDS_auth_PATH}/" + encodeURIComponent_RFC3986(encryptedBodyB64);
            location.href = url;
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });

/* does not work because of HTTP CORS, so we forward to NodeJS fetch/request via the serverOPDS_auth_PATH HTTP route
    window.fetch("${authLink.Href}", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-url-encoded",
            "Accept": "application/json"
        },
        body: encodeFormData(bodyJson)
    })
    .then((response) => {
        const res = JSON.stringify(response, null, 4);
        console.log(res);
    })
    .catch((error) => {
        console.log(error);
    });
*/
    ` :
                `window.alert("no auth link!");`}
}
</script>`;
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
        });
        const headers = {
            "Accept": "application/json,application/xml",
            "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
            "User-Agent": "READIUM2",
        };
        if (authResponseJson && authResponseJson.access_token) {
            headers.Authorization = `Bearer ${authResponseJson.access_token}`;
        }
        const needsStreamingResponse = true;
        if (needsStreamingResponse) {
            request.get({
                headers,
                method: "GET",
                uri: urlDecoded,
            })
                .on("response", success)
                .on("error", failure);
        }
        else {
            let response;
            try {
                response = yield requestPromise({
                    headers,
                    method: "GET",
                    resolveWithFullResponse: true,
                    uri: urlDecoded,
                });
            }
            catch (err) {
                failure(err);
                return;
            }
            yield success(response);
        }
    }));
    topRouter.use(exports.serverOPDS_browse_v2_PATH, routerOPDS_browse_v2);
    const routerOPDS_auth = express.Router({ strict: false });
    routerOPDS_auth.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerOPDS_auth.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_auth.get("/", (_req, res) => {
        const html = "<html><body><h1>NOPE</h1></body></html>";
        res.status(200).send(html);
    });
    routerOPDS_auth.param("urlEncoded", (req, _res, next, value, _name) => {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_auth.get("/:" + request_ext_1._urlEncoded + "(*)", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const reqparams = req.params;
        if (!reqparams.urlEncoded) {
            reqparams.urlEncoded = req.urlEncoded;
        }
        const base64Payload = reqparams.urlEncoded;
        const refreshToken = req.query.authRefresh;
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host;
        try {
            const encrypted = Buffer.from(base64Payload, "base64");
            const decrypteds = [];
            const decryptStream = crypto.createDecipheriv("aes-256-cbc", OPDS_AUTH_ENCRYPTION_KEY_BUFFER, OPDS_AUTH_ENCRYPTION_IV_BUFFER);
            decryptStream.setAutoPadding(false);
            const buff1 = decryptStream.update(encrypted);
            if (buff1) {
                decrypteds.push(buff1);
            }
            const buff2 = decryptStream.final();
            if (buff2) {
                decrypteds.push(buff2);
            }
            const decrypted = Buffer.concat(decrypteds);
            const nPaddingBytes = decrypted[decrypted.length - 1];
            const size = encrypted.length - nPaddingBytes;
            const decryptedStr = decrypted.slice(0, size).toString("utf8");
            const decryptedJson = JSON.parse(decryptedStr);
            const authUrl = decryptedJson.authUrl;
            delete decryptedJson.authUrl;
            const targetUrl = decryptedJson.targetUrl;
            delete decryptedJson.targetUrl;
            if (refreshToken) {
                decryptedJson.grant_type = "refresh_token";
                decryptedJson.refresh_token = refreshToken;
            }
            const failure = (err) => {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
            };
            const success = (response) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                    failure("HTTP CODE " + response.statusCode);
                    return;
                }
                let responseData;
                try {
                    responseData = yield BufferUtils_1.streamToBufferPromise(response);
                }
                catch (err) {
                    debug(err);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err + "</p></body></html>");
                    return;
                }
                try {
                    const responseStr = responseData.toString("utf8");
                    const responseJson = JSON.parse(responseStr);
                    const targetUrl_ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_auth_PATH + "/")) +
                        exports.serverOPDS_browse_v2_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(targetUrl) +
                        "?" + request_ext_1._authResponse + "=" +
                        UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(JSON.stringify(responseJson)).toString("base64")) +
                        "&" + request_ext_1._authRequest + "=" + UrlUtils_1.encodeURIComponent_RFC3986(base64Payload);
                    const refreshTokenUrl = responseJson.refresh_token ? rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_auth_PATH + "/")) +
                        exports.serverOPDS_auth_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(base64Payload) +
                        "?" + request_ext_1._authRefresh + "=" + UrlUtils_1.encodeURIComponent_RFC3986(responseJson.refresh_token) : undefined;
                    decryptedJson.password = "***";
                    res.status(200).send(`
                        <html><body>
                        <hr>
                        <a href="${targetUrl_}">${targetUrl}</a>
                        <hr>
                        <pre>${JSON.stringify(decryptedJson, null, 4)}</pre>
                        <hr>
                        <pre>${JSON.stringify(responseJson, null, 4)}</pre>
                        <hr>
                        ${refreshTokenUrl ? `<a href="${refreshTokenUrl}">FORCE REFRESH TOKEN</a>` : ""}
                        <hr>
                        </body></html>
                    `);
                }
                catch (err) {
                    debug(err);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err + "</p></body></html>");
                    return;
                }
            });
            const headers = {
                "Accept": "application/json,application/xml",
                "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
                "Content-Type": "application/x-www-form-url-encoded",
                "User-Agent": "READIUM2",
            };
            const needsStreamingResponse = true;
            if (needsStreamingResponse) {
                request.post({
                    form: decryptedJson,
                    headers,
                    method: "POST",
                    uri: authUrl,
                })
                    .on("response", success)
                    .on("error", failure);
            }
            else {
                let response;
                try {
                    response = yield requestPromise({
                        form: decryptedJson,
                        headers,
                        method: "POST",
                        resolveWithFullResponse: true,
                        uri: authUrl,
                    });
                }
                catch (err) {
                    failure(err);
                    return;
                }
                yield success(response);
            }
        }
        catch (err) {
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + "--" + "</p></body></html>");
        }
    }));
    topRouter.use(exports.serverOPDS_auth_PATH, routerOPDS_auth);
}
exports.serverOPDS_browse_v2 = serverOPDS_browse_v2;
//# sourceMappingURL=server-opds-browse-v2.js.map