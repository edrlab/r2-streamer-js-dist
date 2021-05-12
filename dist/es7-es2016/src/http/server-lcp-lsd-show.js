"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverLCPLSD_show = exports.serverLCPLSD_show_PATH = void 0;
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
const lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lcp");
const lsd_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lsd");
const serializable_1 = require("r2-lcp-js/dist/es7-es2016/src/serializable");
const UrlUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/JsonUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/stream/BufferUtils");
const json_schema_validate_1 = require("../utils/json-schema-validate");
const request_ext_1 = require("./request-ext");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const server_url_1 = require("./server-url");
const debug = debug_("r2:streamer#http/lcp-lsd-show");
exports.serverLCPLSD_show_PATH = "/lcp-lsd-show";
function serverLCPLSD_show(_server, topRouter) {
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
    const routerLCPLSD_show = express.Router({ strict: false });
    routerLCPLSD_show.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerLCPLSD_show.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerLCPLSD_show.get("/", (_req, res) => {
        let html = "<html><head>";
        html += `<script type="text/javascript">function encodeURIComponent_RFC3986(str) { ` +
            `return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { ` +
            `return "%" + c.charCodeAt(0).toString(16); }); }` +
            `function go(evt) {` +
            `if (evt) { evt.preventDefault(); } var url = ` +
            `location.origin +` +
            ` '${exports.serverLCPLSD_show_PATH}/' +` +
            ` encodeURIComponent_RFC3986(document.getElementById("url").value);` +
            `location.href = url;}</script>`;
        html += "</head>";
        html += "<body><h1>LCP / LSD examiner</h1>";
        html += `<form onsubmit="go();return false;">` +
            `<input type="text" name="url" id="url" size="80">` +
            `<input type="submit" value="Go!"></form>`;
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerLCPLSD_show.param("urlEncoded", (req, _res, next, value, _name) => {
        req.urlEncoded = value;
        next();
    });
    routerLCPLSD_show.get("/:" + request_ext_1._urlEncoded + "(*)", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            var _a;
            const isBadStatusCode = response.statusCode && (response.statusCode < 200 || response.statusCode >= 300);
            if (isBadStatusCode) {
                failure("HTTP CODE " + response.statusCode);
                return;
            }
            let responseData;
            try {
                responseData = yield BufferUtils_1.streamToBufferPromise(response);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>" + err + "</p></body></html>");
                return;
            }
            const responseStr = responseData.toString("utf8");
            const responseJson = JSON.parse(responseStr);
            const isStatusDoc = responseJson.id &&
                responseJson.status &&
                responseJson.updated &&
                responseJson.links;
            const lcpOrLsd = isStatusDoc ?
                serializable_1.TaJsonDeserialize(responseJson, lsd_1.LSD) :
                serializable_1.TaJsonDeserialize(responseJson, lcp_1.LCP);
            const lcpOrLsdJson = serializable_1.TaJsonSerialize(lcpOrLsd);
            let validationStr;
            const doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
            if (doValidate) {
                const jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                const jsonSchemasNames = [
                    isStatusDoc ? "lcp/status" : "lcp/license",
                    "lcp/link",
                ];
                const validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, lcpOrLsdJson);
                if (validationErrors) {
                    validationStr = "";
                    for (const err of validationErrors) {
                        debug("JSON Schema validation FAIL.");
                        debug(err);
                        const val = err.jsonPath ? DotProp.get(lcpOrLsdJson, err.jsonPath) : "";
                        const valueStr = (typeof val === "string") ?
                            `${val}` :
                            ((val instanceof Array || typeof val === "object") ?
                                `${JSON.stringify(val)}` :
                                "");
                        debug(valueStr);
                        validationStr +=
                            `\n${err.ajvMessage}: ${valueStr}\n\n'${(_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
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
                    if ((obj.type === "application/vnd.readium.license.status.v1.0+json" && obj.rel === "status") ||
                        (obj.type === "application/vnd.readium.lcp.license.v1.0+json" && obj.rel === "license")) {
                        obj.__href__ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverLCPLSD_show_PATH + "/")) +
                            exports.serverLCPLSD_show_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(fullHref);
                    }
                    else if (obj.type === "application/epub+zip" && obj.rel === "publication") {
                        obj.__href__ = rootUrl + req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverLCPLSD_show_PATH + "/")) +
                            server_url_1.serverRemotePub_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(fullHref);
                    }
                    else if (isDataUrl) {
                    }
                    else if (notFull && !isMailUrl) {
                        obj.__href__ = fullHref;
                    }
                }
            };
            JsonUtils_1.traverseJsonObjects(lcpOrLsdJson, funk);
            const css = css2json(jsonStyle);
            const jsonPretty = jsonMarkup(lcpOrLsdJson, css);
            res.status(200).send("<html><body>" +
                "<h1>" +
                (isStatusDoc ? "LSD" : "LCP") +
                " JSON" + "</h1>" +
                "<h2><a href=\"" + urlDecoded + "\">" + urlDecoded + "</a></h2>" +
                "<hr>" +
                "<div style=\"overflow-x: auto;margin:0;padding:0;width:100%;height:auto;\">" +
                jsonPretty + "</div>" +
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
    topRouter.use(exports.serverLCPLSD_show_PATH, routerLCPLSD_show);
}
exports.serverLCPLSD_show = serverLCPLSD_show;
//# sourceMappingURL=server-lcp-lsd-show.js.map