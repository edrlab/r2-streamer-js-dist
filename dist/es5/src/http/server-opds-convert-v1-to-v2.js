"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOPDS_convert_v1_to_v2 = exports.serverOPDS_convert_v1_to_v2_PATH = void 0;
var tslib_1 = require("tslib");
var css2json = require("css2json");
var debug_ = require("debug");
var DotProp = require("dot-prop");
var express = require("express");
var jsonMarkup = require("json-markup");
var morgan = require("morgan");
var path = require("path");
var request = require("request");
var requestPromise = require("request-promise-native");
var xmldom = require("xmldom");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var converter_1 = require("r2-opds-js/dist/es5/src/opds/converter");
var opds_1 = require("r2-opds-js/dist/es5/src/opds/opds1/opds");
var opds_entry_1 = require("r2-opds-js/dist/es5/src/opds/opds1/opds-entry");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var json_schema_validate_1 = require("../utils/json-schema-validate");
var request_ext_1 = require("./request-ext");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:streamer#http/server-opds-convert-v1-to-v2");
exports.serverOPDS_convert_v1_to_v2_PATH = "/opds-v1-v2-convert";
function serverOPDS_convert_v1_to_v2(_server, topRouter) {
    var _this = this;
    var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
    var routerOPDS_convert_v1_to_v2 = express.Router({ strict: false });
    routerOPDS_convert_v1_to_v2.use(morgan("combined", { stream: { write: function (msg) { return debug(msg); } } }));
    routerOPDS_convert_v1_to_v2.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_convert_v1_to_v2.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            (" '" + exports.serverOPDS_convert_v1_to_v2_PATH + "/' +") +
            " encodeURIComponent_RFC3986(document.getElementById(\"url\").value);" +
            "location.href = url;}</script>";
        html += "</head>";
        html += "<body><h1>OPDS 1 -> 2 converter</h1>";
        html += "<form onsubmit=\"go();return false;\">" +
            "<input type=\"text\" name=\"url\" id=\"url\" size=\"80\">" +
            "<input type=\"submit\" value=\"Go!\"></form>";
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerOPDS_convert_v1_to_v2.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_convert_v1_to_v2.get("/:" + request_ext_1._urlEncoded + "(*)", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var reqparams, urlDecoded, isSecureHttp, rootUrl, failure, success, headers, needsStreamingResponse, response, err_1;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reqparams = req.params;
                    if (!reqparams.urlEncoded) {
                        reqparams.urlEncoded = req.urlEncoded;
                    }
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
                        var responseData, err_2, responseStr, responseXml, isEntry, opds1Feed, opds1Entry, opds2Feed, opds2Publication, funk, jsonObjOPDS1, jsonObjOPDS2, validationStr, doValidate, jsonSchemasRootpath, jsonSchemasNames, validationErrors, _i, validationErrors_1, err, val, valueStr, title, val, valueStr, title, pubIndex, jsonPubTitlePath, css, jsonPrettyOPDS1, jsonPrettyOPDS2;
                        var _a, _b;
                        return tslib_1.__generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
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
                                        + err_2 + "</p></body></html>");
                                    return [2];
                                case 4:
                                    responseStr = responseData.toString("utf8");
                                    responseXml = new xmldom.DOMParser().parseFromString(responseStr);
                                    if (!responseXml || !responseXml.documentElement) {
                                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                            + "XML parse fail" + "</p></body></html>");
                                        return [2];
                                    }
                                    isEntry = responseXml.documentElement.localName === "entry";
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
                                            return [2];
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
                                            return [2];
                                        }
                                    }
                                    funk = function (obj) {
                                        if ((obj.href && typeof obj.href === "string") ||
                                            (obj.Href && typeof obj.Href === "string")) {
                                            var fullHref = obj.href ? obj.href : obj.Href;
                                            var notFull = !UrlUtils_1.isHTTP(fullHref);
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
                                    jsonObjOPDS1 = serializable_1.TaJsonSerialize(opds1Entry ? opds1Entry : opds1Feed);
                                    JsonUtils_1.traverseJsonObjects(jsonObjOPDS1, funk);
                                    jsonObjOPDS2 = serializable_1.TaJsonSerialize(opds2Publication ? opds2Publication : opds2Feed);
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
                                        if (!opds2Publication) {
                                            jsonSchemasNames.unshift("opds/feed");
                                        }
                                        validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonObjOPDS2);
                                        if (validationErrors) {
                                            validationStr = "";
                                            for (_i = 0, validationErrors_1 = validationErrors; _i < validationErrors_1.length; _i++) {
                                                err = validationErrors_1[_i];
                                                debug("JSON Schema validation FAIL.");
                                                debug(err);
                                                if (opds2Publication) {
                                                    val = err.jsonPath ? DotProp.get(jsonObjOPDS2, err.jsonPath) : "";
                                                    valueStr = (typeof val === "string") ?
                                                        "" + val :
                                                        ((val instanceof Array || typeof val === "object") ?
                                                            "" + JSON.stringify(val) :
                                                            "");
                                                    debug(valueStr);
                                                    title = DotProp.get(jsonObjOPDS2, "metadata.title");
                                                    debug(title);
                                                    validationStr +=
                                                        "\n\"" + title + "\"\n\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + ((_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")) + "' (" + err.ajvSchemaPath + ")\n\n";
                                                }
                                                else {
                                                    val = err.jsonPath ? DotProp.get(jsonObjOPDS2, err.jsonPath) : "";
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
                                                        title = DotProp.get(jsonObjOPDS2, jsonPubTitlePath);
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
                                    JsonUtils_1.traverseJsonObjects(jsonObjOPDS2, funk);
                                    css = css2json(jsonStyle);
                                    jsonPrettyOPDS1 = jsonMarkup(jsonObjOPDS1, css);
                                    jsonPrettyOPDS2 = jsonMarkup(jsonObjOPDS2, css);
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
                                    return [2];
                            }
                        });
                    }); };
                    headers = {
                        "Accept": "application/json,application/xml",
                        "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
                        "User-Agent": "READIUM2",
                    };
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
    topRouter.use(exports.serverOPDS_convert_v1_to_v2_PATH, routerOPDS_convert_v1_to_v2);
}
exports.serverOPDS_convert_v1_to_v2 = serverOPDS_convert_v1_to_v2;
//# sourceMappingURL=server-opds-convert-v1-to-v2.js.map