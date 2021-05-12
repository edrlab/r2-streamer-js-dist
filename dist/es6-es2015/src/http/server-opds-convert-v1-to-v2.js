"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOPDS_convert_v1_to_v2 = exports.serverOPDS_convert_v1_to_v2_PATH = void 0;
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
const xmldom = require("xmldom");
const serializable_1 = require("r2-lcp-js/dist/es6-es2015/src/serializable");
const converter_1 = require("r2-opds-js/dist/es6-es2015/src/opds/converter");
const opds_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds1/opds");
const opds_entry_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds1/opds-entry");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/JsonUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const xml_js_mapper_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/xml-js-mapper");
const json_schema_validate_1 = require("../utils/json-schema-validate");
const request_ext_1 = require("./request-ext");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:streamer#http/server-opds-convert-v1-to-v2");
exports.serverOPDS_convert_v1_to_v2_PATH = "/opds-v1-v2-convert";
function serverOPDS_convert_v1_to_v2(_server, topRouter) {
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
    const routerOPDS_convert_v1_to_v2 = express.Router({ strict: false });
    routerOPDS_convert_v1_to_v2.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerOPDS_convert_v1_to_v2.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_convert_v1_to_v2.get("/", (_req, res) => {
        let html = "<html><head>";
        html += `<script type="text/javascript">function encodeURIComponent_RFC3986(str) { ` +
            `return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { ` +
            `return "%" + c.charCodeAt(0).toString(16); }); }` +
            `function go(evt) {` +
            `if (evt) { evt.preventDefault(); } var url = ` +
            `location.origin +` +
            ` '${exports.serverOPDS_convert_v1_to_v2_PATH}/' +` +
            ` encodeURIComponent_RFC3986(document.getElementById("url").value);` +
            `location.href = url;}</script>`;
        html += "</head>";
        html += "<body><h1>OPDS 1 -> 2 converter</h1>";
        html += `<form onsubmit="go();return false;">` +
            `<input type="text" name="url" id="url" size="80">` +
            `<input type="submit" value="Go!"></form>`;
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerOPDS_convert_v1_to_v2.param("urlEncoded", (req, _res, next, value, _name) => {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_convert_v1_to_v2.get("/:" + request_ext_1._urlEncoded + "(*)", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            var _a, _b;
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
            const responseXml = new xmldom.DOMParser().parseFromString(responseStr);
            if (!responseXml || !responseXml.documentElement) {
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + "XML parse fail" + "</p></body></html>");
                return;
            }
            const isEntry = responseXml.documentElement.localName === "entry";
            let opds1Feed;
            let opds1Entry;
            let opds2Feed;
            let opds2Publication;
            if (isEntry) {
                opds1Entry = xml_js_mapper_1.XML.deserialize(responseXml, opds_entry_1.Entry);
                try {
                    opds2Publication = converter_1.convertOpds1ToOpds2_EntryToPublication(opds1Entry);
                }
                catch (err) {
                    debug("OPDS 1 -> 2 conversion FAILED (Entry)");
                    debug(err);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err + "</p></body></html>");
                    return;
                }
            }
            else {
                opds1Feed = xml_js_mapper_1.XML.deserialize(responseXml, opds_1.OPDS);
                try {
                    opds2Feed = converter_1.convertOpds1ToOpds2(opds1Feed);
                }
                catch (err) {
                    debug("OPDS 1 -> 2 conversion FAILED");
                    debug(err);
                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                        + err + "</p></body></html>");
                    return;
                }
            }
            const funk = (obj) => {
                if ((obj.href && typeof obj.href === "string") ||
                    (obj.Href && typeof obj.Href === "string")) {
                    let fullHref = obj.href ? obj.href : obj.Href;
                    const notFull = !UrlUtils_1.isHTTP(fullHref);
                    if (notFull) {
                        fullHref = UrlUtils_1.ensureAbsolute(urlDecoded, fullHref);
                    }
                    if ((obj.type && obj.type.indexOf("application/atom+xml") >= 0) ||
                        (obj.Type && obj.Type.indexOf("application/atom+xml") >= 0)) {
                        obj.__href__ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_convert_v1_to_v2_PATH + "/")) +
                            exports.serverOPDS_convert_v1_to_v2_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(fullHref);
                    }
                    else if (notFull) {
                        obj.__href__ = fullHref;
                    }
                }
            };
            const jsonObjOPDS1 = serializable_1.TaJsonSerialize(opds1Entry ? opds1Entry : opds1Feed);
            JsonUtils_1.traverseJsonObjects(jsonObjOPDS1, funk);
            const jsonObjOPDS2 = serializable_1.TaJsonSerialize(opds2Publication ? opds2Publication : opds2Feed);
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
                if (!opds2Publication) {
                    jsonSchemasNames.unshift("opds/feed");
                }
                const validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonObjOPDS2);
                if (validationErrors) {
                    validationStr = "";
                    for (const err of validationErrors) {
                        debug("JSON Schema validation FAIL.");
                        debug(err);
                        if (opds2Publication) {
                            const val = err.jsonPath ? DotProp.get(jsonObjOPDS2, err.jsonPath) : "";
                            const valueStr = (typeof val === "string") ?
                                `${val}` :
                                ((val instanceof Array || typeof val === "object") ?
                                    `${JSON.stringify(val)}` :
                                    "");
                            debug(valueStr);
                            const title = DotProp.get(jsonObjOPDS2, "metadata.title");
                            debug(title);
                            validationStr +=
                                `\n"${title}"\n\n${err.ajvMessage}: ${valueStr}\n\n'${(_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
                        }
                        else {
                            const val = err.jsonPath ? DotProp.get(jsonObjOPDS2, err.jsonPath) : "";
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
                                title = DotProp.get(jsonObjOPDS2, jsonPubTitlePath);
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
            JsonUtils_1.traverseJsonObjects(jsonObjOPDS2, funk);
            const css = css2json(jsonStyle);
            const jsonPrettyOPDS1 = jsonMarkup(jsonObjOPDS1, css);
            const jsonPrettyOPDS2 = jsonMarkup(jsonObjOPDS2, css);
            res.status(200).send("<html><body>" +
                "<h1>OPDS2 JSON " +
                (opds2Publication ? "entry" : "feed") +
                " (converted from OPDS1 XML/ATOM)</h1>" +
                "<h2><a href=\"" + urlDecoded + "\">" + urlDecoded + "</a></h2>" +
                "<hr>" +
                "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"90%\" " +
                "style=\"table-layout:fixed;width:90%\">" +
                "<thead><tr><th>OPDS1</th><th>OPDS2</th></tr></thead>" +
                "<tbody><tr>" +
                "<td valign=\"top\" width=\"50%\">" +
                "<div style=\"overflow-x: auto;margin:0;padding:0;width:100%;height:auto;\">" +
                jsonPrettyOPDS1 + "</div></td>" +
                "<td valign=\"top\" width=\"50%\">" +
                "<div style=\"overflow-x: auto;margin:0;padding:0;width:100%;height:auto;\">" +
                jsonPrettyOPDS2 + "</div></td>" +
                "</tbody></tr>" +
                "</table>" +
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
    topRouter.use(exports.serverOPDS_convert_v1_to_v2_PATH, routerOPDS_convert_v1_to_v2);
}
exports.serverOPDS_convert_v1_to_v2 = serverOPDS_convert_v1_to_v2;
//# sourceMappingURL=server-opds-convert-v1-to-v2.js.map