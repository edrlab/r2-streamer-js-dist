"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const converter_1 = require("r2-opds-js/dist/es8-es2017/src/opds/converter");
const opds_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds1/opds");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/JsonUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/stream/BufferUtils");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const morgan = require("morgan");
const request = require("request");
const requestPromise = require("request-promise-native");
const ta_json_1 = require("ta-json");
const xmldom = require("xmldom");
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
    routerOPDS_convert_v1_to_v2.get("/:" + request_ext_1._urlEncoded + "(*)", async (req, res) => {
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
        const success = async (response) => {
            if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                failure("HTTP CODE " + response.statusCode);
                return;
            }
            let responseData;
            try {
                responseData = await BufferUtils_1.streamToBufferPromise(response);
            }
            catch (err) {
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
            const responseStr = responseData.toString("utf8");
            const responseXml = new xmldom.DOMParser().parseFromString(responseStr);
            const isEntry = responseXml.documentElement.localName === "entry";
            let opds1;
            let opds2;
            if (isEntry) {
                const err = "OPDS Entry as top-level feed, not supported.";
                debug(err);
                res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                    + err + "</p></body></html>");
                return;
            }
            else {
                opds1 = xml_js_mapper_1.XML.deserialize(responseXml, opds_1.OPDS);
                try {
                    opds2 = converter_1.convertOpds1ToOpds2(opds1);
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
            const jsonObjOPDS1 = ta_json_1.JSON.serialize(opds1);
            JsonUtils_1.traverseJsonObjects(jsonObjOPDS1, funk);
            const jsonObjOPDS2 = ta_json_1.JSON.serialize(opds2);
            let validationStr;
            const doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
            if (doValidate) {
                const jsonSchemasRootpath = path.join(process.cwd(), "misc/json-schema/opds");
                const jsonSchemasNames = [
                    "feed",
                    "acquisition-object",
                    "feed-metadata",
                    "link",
                    "properties",
                    "publication",
                    "../webpub-manifest/subcollection",
                    "../webpub-manifest/metadata",
                    "../webpub-manifest/link",
                    "../webpub-manifest/contributor",
                    "../webpub-manifest/contributor-object",
                ];
                validationStr = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, "opds", jsonSchemasNames, jsonObjOPDS2);
            }
            JsonUtils_1.traverseJsonObjects(jsonObjOPDS2, funk);
            const css = css2json(jsonStyle);
            const jsonPrettyOPDS1 = jsonMarkup(jsonObjOPDS1, css);
            const jsonPrettyOPDS2 = jsonMarkup(jsonObjOPDS2, css);
            res.status(200).send("<html><body>" +
                "<h1>OPDS2 JSON feed (converted from OPDS1 XML/ATOM)</h1>" +
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
        };
        const needsStreamingResponse = true;
        if (needsStreamingResponse) {
            request.get({
                headers: {},
                method: "GET",
                uri: urlDecoded,
            })
                .on("response", success)
                .on("error", failure);
        }
        else {
            let response;
            try {
                response = await requestPromise({
                    headers: {},
                    method: "GET",
                    resolveWithFullResponse: true,
                    uri: urlDecoded,
                });
            }
            catch (err) {
                failure(err);
                return;
            }
            await success(response);
        }
    });
    topRouter.use(exports.serverOPDS_convert_v1_to_v2_PATH, routerOPDS_convert_v1_to_v2);
}
exports.serverOPDS_convert_v1_to_v2 = serverOPDS_convert_v1_to_v2;
//# sourceMappingURL=server-opds-convert-v1-to-v2.js.map