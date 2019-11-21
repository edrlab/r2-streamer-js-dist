"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const css2json = require("css2json");
const debug_ = require("debug");
const DotProp = require("dot-prop");
const express = require("express");
const jsonMarkup = require("json-markup");
const morgan = require("morgan");
const path = require("path");
const request = require("request");
const requestPromise = require("request-promise-native");
const serializable_1 = require("r2-lcp-js/dist/es6-es2015/src/serializable");
const opds2_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2");
const opds2_authentication_doc_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2-authentication-doc");
const opds2_publication_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2-publication");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/JsonUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const json_schema_validate_1 = require("../utils/json-schema-validate");
const request_ext_1 = require("./request-ext");
const server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:streamer#http/server-opds-browse-v2");
exports.serverOPDS_browse_v2_PATH = "/opds-v2-browse";
exports.serverOPDS_dataUrl_PATH = "/data-url";
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
                            const val = DotProp.get(opds2FeedJson, err.jsonPath);
                            const valueStr = (typeof val === "string") ?
                                `${val}` :
                                ((val instanceof Array || typeof val === "object") ?
                                    `${JSON.stringify(val)}` :
                                    "");
                            debug(valueStr);
                            const title = DotProp.get(opds2FeedJson, "metadata.title");
                            debug(title);
                            validationStr +=
                                `\n"${title}"\n\n${err.ajvMessage}: ${valueStr}\n\n'${err.ajvDataPath.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
                        }
                        else {
                            const val = DotProp.get(opds2FeedJson, err.jsonPath);
                            const valueStr = (typeof val === "string") ?
                                `${val}` :
                                ((val instanceof Array || typeof val === "object") ?
                                    `${JSON.stringify(val)}` :
                                    "");
                            debug(valueStr);
                            let title = "";
                            let pubIndex = "";
                            if (/^publications\.[0-9]+/.test(err.jsonPath)) {
                                const jsonPubTitlePath = err.jsonPath.replace(/^(publications\.[0-9]+).*/, "$1.metadata.title");
                                debug(jsonPubTitlePath);
                                title = DotProp.get(opds2FeedJson, jsonPubTitlePath);
                                debug(title);
                                pubIndex = err.jsonPath.replace(/^publications\.([0-9]+).*/, "$1");
                                debug(pubIndex);
                            }
                            validationStr +=
                                `\n___________INDEX___________ #${pubIndex} "${title}"\n\n${err.ajvMessage}: ${valueStr}\n\n'${err.ajvDataPath.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
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
            res.status(200).send("<html><body>" +
                "<h1>OPDS2 JSON " +
                (isPublication ? "entry" : (isAuth ? "authentication" : "feed")) +
                " (OPDS2)</h1>" +
                "<h2><a href=\"" + urlDecoded + "\">" + urlDecoded + "</a></h2>" +
                "<hr>" +
                "<div style=\"overflow-x: auto;margin:0;padding:0;width:100%;height:auto;\">" +
                jsonPrettyOPDS2 + "</div>" +
                (doValidate ? (validationStr ? ("<hr><p><pre>" + validationStr + "</pre></p>") : ("<hr><p>JSON SCHEMA OK.</p>")) : "") +
                "</body></html>");
        });
        const headers = {
            "Accept": "application/json,application/xml",
            "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
            "User-Agent": "READIUM2",
        };
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
    const routerOPDS_dataUrl = express.Router({ strict: false });
    routerOPDS_dataUrl.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerOPDS_dataUrl.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_dataUrl.get("/", (_req, res) => {
        let html = "<html><head>";
        html += `<script type="text/javascript">function encodeURIComponent_RFC3986(str) { ` +
            `return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { ` +
            `return "%" + c.charCodeAt(0).toString(16); }); }` +
            `function go(evt) {` +
            `if (evt) { evt.preventDefault(); } var url = ` +
            `location.origin +` +
            ` '${exports.serverOPDS_dataUrl_PATH}/' +` +
            ` encodeURIComponent_RFC3986(document.getElementById("url").value);` +
            `location.href = url;}</script>`;
        html += "</head>";
        html += "<body><h1>data URL viewer</h1>";
        html += `<form onsubmit="go();return false;">` +
            `<input type="text" name="url" id="url" size="80">` +
            `<input type="submit" value="Go!"></form>`;
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerOPDS_dataUrl.param("urlEncoded", (req, _res, next, value, _name) => {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_dataUrl.get("/:" + request_ext_1._urlEncoded + "(*)", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const reqparams = req.params;
        if (!reqparams.urlEncoded) {
            reqparams.urlEncoded = req.urlEncoded;
        }
        const urlDecoded = reqparams.urlEncoded;
        debug(urlDecoded);
        res.status(200).send("<html><body>" +
            "<h1>DATA URL</h1>" +
            "<h2><a href=\"" + urlDecoded + "\">" + urlDecoded + "</a></h2>" +
            "<hr>" +
            "<img src=\"" + urlDecoded + "\" />" +
            "</body></html>");
    }));
    topRouter.use(exports.serverOPDS_dataUrl_PATH, routerOPDS_dataUrl);
}
exports.serverOPDS_browse_v2 = serverOPDS_browse_v2;
//# sourceMappingURL=server-opds-browse-v2.js.map