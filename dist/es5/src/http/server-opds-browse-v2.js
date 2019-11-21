"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var opds2_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2");
var opds2_authentication_doc_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-authentication-doc");
var opds2_publication_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-publication");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var json_schema_validate_1 = require("../utils/json-schema-validate");
var request_ext_1 = require("./request-ext");
var server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:streamer#http/server-opds-browse-v2");
exports.serverOPDS_browse_v2_PATH = "/opds-v2-browse";
exports.serverOPDS_dataUrl_PATH = "/data-url";
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
                        var responseData, err_2, responseStr, responseJson, isPublication, isAuth, opds2Feed, opds2FeedJson, validationStr, doValidate, jsonSchemasRootpath, jsonSchemasNames, validationErrors, _i, validationErrors_1, err, val, valueStr, title, val, valueStr, title, pubIndex, jsonPubTitlePath, funk, css, jsonPrettyOPDS2;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                                        failure("HTTP CODE " + response.statusCode);
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
                                    err_2 = _a.sent();
                                    debug(err_2);
                                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                        + err_2 + "</p></body></html>");
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
                                        validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, opds2FeedJson);
                                        if (validationErrors) {
                                            validationStr = "";
                                            for (_i = 0, validationErrors_1 = validationErrors; _i < validationErrors_1.length; _i++) {
                                                err = validationErrors_1[_i];
                                                debug("JSON Schema validation FAIL.");
                                                debug(err);
                                                if (isPublication) {
                                                    val = DotProp.get(opds2FeedJson, err.jsonPath);
                                                    valueStr = (typeof val === "string") ?
                                                        "" + val :
                                                        ((val instanceof Array || typeof val === "object") ?
                                                            "" + JSON.stringify(val) :
                                                            "");
                                                    debug(valueStr);
                                                    title = DotProp.get(opds2FeedJson, "metadata.title");
                                                    debug(title);
                                                    validationStr +=
                                                        "\n\"" + title + "\"\n\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + err.ajvDataPath.replace(/^\./, "") + "' (" + err.ajvSchemaPath + ")\n\n";
                                                }
                                                else {
                                                    val = DotProp.get(opds2FeedJson, err.jsonPath);
                                                    valueStr = (typeof val === "string") ?
                                                        "" + val :
                                                        ((val instanceof Array || typeof val === "object") ?
                                                            "" + JSON.stringify(val) :
                                                            "");
                                                    debug(valueStr);
                                                    title = "";
                                                    pubIndex = "";
                                                    if (/^publications\.[0-9]+/.test(err.jsonPath)) {
                                                        jsonPubTitlePath = err.jsonPath.replace(/^(publications\.[0-9]+).*/, "$1.metadata.title");
                                                        debug(jsonPubTitlePath);
                                                        title = DotProp.get(opds2FeedJson, jsonPubTitlePath);
                                                        debug(title);
                                                        pubIndex = err.jsonPath.replace(/^publications\.([0-9]+).*/, "$1");
                                                        debug(pubIndex);
                                                    }
                                                    validationStr +=
                                                        "\n___________INDEX___________ #" + pubIndex + " \"" + title + "\"\n\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + err.ajvDataPath.replace(/^\./, "") + "' (" + err.ajvSchemaPath + ")\n\n";
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
    topRouter.use(exports.serverOPDS_browse_v2_PATH, routerOPDS_browse_v2);
    var routerOPDS_dataUrl = express.Router({ strict: false });
    routerOPDS_dataUrl.use(morgan("combined", { stream: { write: function (msg) { return debug(msg); } } }));
    routerOPDS_dataUrl.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_dataUrl.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            (" '" + exports.serverOPDS_dataUrl_PATH + "/' +") +
            " encodeURIComponent_RFC3986(document.getElementById(\"url\").value);" +
            "location.href = url;}</script>";
        html += "</head>";
        html += "<body><h1>data URL viewer</h1>";
        html += "<form onsubmit=\"go();return false;\">" +
            "<input type=\"text\" name=\"url\" id=\"url\" size=\"80\">" +
            "<input type=\"submit\" value=\"Go!\"></form>";
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerOPDS_dataUrl.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_dataUrl.get("/:" + request_ext_1._urlEncoded + "(*)", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var reqparams, urlDecoded;
        return tslib_1.__generator(this, function (_a) {
            reqparams = req.params;
            if (!reqparams.urlEncoded) {
                reqparams.urlEncoded = req.urlEncoded;
            }
            urlDecoded = reqparams.urlEncoded;
            debug(urlDecoded);
            res.status(200).send("<html><body>" +
                "<h1>DATA URL</h1>" +
                "<h2><a href=\"" + urlDecoded + "\">" + urlDecoded + "</a></h2>" +
                "<hr>" +
                "<img src=\"" + urlDecoded + "\" />" +
                "</body></html>");
            return [2];
        });
    }); });
    topRouter.use(exports.serverOPDS_dataUrl_PATH, routerOPDS_dataUrl);
}
exports.serverOPDS_browse_v2 = serverOPDS_browse_v2;
//# sourceMappingURL=server-opds-browse-v2.js.map