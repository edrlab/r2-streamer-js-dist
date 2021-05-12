"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverLCPLSD_show = exports.serverLCPLSD_show_PATH = void 0;
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
var lcp_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lcp");
var lsd_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lsd");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var json_schema_validate_1 = require("../utils/json-schema-validate");
var request_ext_1 = require("./request-ext");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var server_url_1 = require("./server-url");
var debug = debug_("r2:streamer#http/lcp-lsd-show");
exports.serverLCPLSD_show_PATH = "/lcp-lsd-show";
function serverLCPLSD_show(_server, topRouter) {
    var _this = this;
    var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
    var routerLCPLSD_show = express.Router({ strict: false });
    routerLCPLSD_show.use(morgan("combined", { stream: { write: function (msg) { return debug(msg); } } }));
    routerLCPLSD_show.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerLCPLSD_show.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            (" '" + exports.serverLCPLSD_show_PATH + "/' +") +
            " encodeURIComponent_RFC3986(document.getElementById(\"url\").value);" +
            "location.href = url;}</script>";
        html += "</head>";
        html += "<body><h1>LCP / LSD examiner</h1>";
        html += "<form onsubmit=\"go();return false;\">" +
            "<input type=\"text\" name=\"url\" id=\"url\" size=\"80\">" +
            "<input type=\"submit\" value=\"Go!\"></form>";
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerLCPLSD_show.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerLCPLSD_show.get("/:" + request_ext_1._urlEncoded + "(*)", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
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
                        var isBadStatusCode, responseData, err_2, responseStr, responseJson, isStatusDoc, lcpOrLsd, lcpOrLsdJson, validationStr, doValidate, jsonSchemasRootpath, jsonSchemasNames, validationErrors, _i, validationErrors_1, err, val, valueStr, funk, css, jsonPretty;
                        var _a;
                        return tslib_1.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    isBadStatusCode = response.statusCode && (response.statusCode < 200 || response.statusCode >= 300);
                                    if (isBadStatusCode) {
                                        failure("HTTP CODE " + response.statusCode);
                                        return [2];
                                    }
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4, BufferUtils_1.streamToBufferPromise(response)];
                                case 2:
                                    responseData = _b.sent();
                                    return [3, 4];
                                case 3:
                                    err_2 = _b.sent();
                                    debug(err_2);
                                    res.status(500).send("<html><body><p>Internal Server Error</p><p>" + err_2 + "</p></body></html>");
                                    return [2];
                                case 4:
                                    responseStr = responseData.toString("utf8");
                                    responseJson = JSON.parse(responseStr);
                                    isStatusDoc = responseJson.id &&
                                        responseJson.status &&
                                        responseJson.updated &&
                                        responseJson.links;
                                    lcpOrLsd = isStatusDoc ?
                                        serializable_1.TaJsonDeserialize(responseJson, lsd_1.LSD) :
                                        serializable_1.TaJsonDeserialize(responseJson, lcp_1.LCP);
                                    lcpOrLsdJson = serializable_1.TaJsonSerialize(lcpOrLsd);
                                    doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
                                    if (doValidate) {
                                        jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                                        jsonSchemasNames = [
                                            isStatusDoc ? "lcp/status" : "lcp/license",
                                            "lcp/link",
                                        ];
                                        validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, lcpOrLsdJson);
                                        if (validationErrors) {
                                            validationStr = "";
                                            for (_i = 0, validationErrors_1 = validationErrors; _i < validationErrors_1.length; _i++) {
                                                err = validationErrors_1[_i];
                                                debug("JSON Schema validation FAIL.");
                                                debug(err);
                                                val = err.jsonPath ? DotProp.get(lcpOrLsdJson, err.jsonPath) : "";
                                                valueStr = (typeof val === "string") ?
                                                    "" + val :
                                                    ((val instanceof Array || typeof val === "object") ?
                                                        "" + JSON.stringify(val) :
                                                        "");
                                                debug(valueStr);
                                                validationStr +=
                                                    "\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + ((_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")) + "' (" + err.ajvSchemaPath + ")\n\n";
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
                                    css = css2json(jsonStyle);
                                    jsonPretty = jsonMarkup(lcpOrLsdJson, css);
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
    topRouter.use(exports.serverLCPLSD_show_PATH, routerLCPLSD_show);
}
exports.serverLCPLSD_show = serverLCPLSD_show;
//# sourceMappingURL=server-lcp-lsd-show.js.map