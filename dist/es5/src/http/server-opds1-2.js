"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var converter_1 = require("../opds/converter");
var opds_1 = require("../opds/opds1/opds");
var UrlUtils_1 = require("../_utils/http/UrlUtils");
var JsonUtils_1 = require("../_utils/JsonUtils");
var BufferUtils_1 = require("../_utils/stream/BufferUtils");
var xml_js_mapper_1 = require("../_utils/xml-js-mapper");
var css2json = require("css2json");
var debug_ = require("debug");
var express = require("express");
var jsonMarkup = require("json-markup");
var morgan = require("morgan");
var request = require("request");
var requestPromise = require("request-promise-native");
var ta_json_1 = require("ta-json");
var xmldom = require("xmldom");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:server:opds");
function serverOPDS12(_server, topRouter) {
    var _this = this;
    var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
    var routerOPDS12 = express.Router({ strict: false });
    routerOPDS12.use(morgan("combined"));
    routerOPDS12.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS12.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            " '/opds12/' +" +
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
    routerOPDS12.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerOPDS12.get("/:urlEncoded(*)", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var urlDecoded, isSecureHttp, rootUrl, failure, success, needsStreamingResponse, response, err_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.params.urlEncoded) {
                        req.params.urlEncoded = req.urlEncoded;
                    }
                    urlDecoded = req.params.urlEncoded;
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
                        var responseData, err_2, responseStr, responseXml, isEntry, opds1, opds2, err, funk, jsonObjOPDS1, jsonObjOPDS2, css, jsonPrettyOPDS1, jsonPrettyOPDS2;
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
                                    responseXml = new xmldom.DOMParser().parseFromString(responseStr);
                                    isEntry = responseXml.documentElement.localName === "entry";
                                    if (isEntry) {
                                        err = "OPDS Entry as top-level feed, not supported.";
                                        debug(err);
                                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                            + err + "</p></body></html>");
                                        return [2];
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
                                            return [2];
                                        }
                                    }
                                    funk = function (obj) {
                                        if ((obj.href && typeof obj.href === "string"
                                            && obj.type && obj.type.indexOf("application/atom+xml") >= 0) ||
                                            (obj.Href && typeof obj.Href === "string"
                                                && obj.Type && obj.Type.indexOf("application/atom+xml") >= 0)) {
                                            var fullHref = obj.href ? obj.href : obj.Href;
                                            if (!UrlUtils_1.isHTTP(fullHref)) {
                                                fullHref = UrlUtils_1.ensureAbsolute(urlDecoded, fullHref);
                                            }
                                            obj.__href__ = rootUrl +
                                                req.originalUrl.substr(0, req.originalUrl.indexOf("/opds12/")) +
                                                "/opds12/" + UrlUtils_1.encodeURIComponent_RFC3986(fullHref);
                                        }
                                    };
                                    jsonObjOPDS1 = ta_json_1.JSON.serialize(opds1);
                                    JsonUtils_1.traverseJsonObjects(jsonObjOPDS1, funk);
                                    jsonObjOPDS2 = ta_json_1.JSON.serialize(opds2);
                                    JsonUtils_1.traverseJsonObjects(jsonObjOPDS2, funk);
                                    css = css2json(jsonStyle);
                                    jsonPrettyOPDS1 = jsonMarkup(jsonObjOPDS1, css);
                                    jsonPrettyOPDS2 = jsonMarkup(jsonObjOPDS2, css);
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
                                        "</body></html>");
                                    return [2];
                            }
                        });
                    }); };
                    needsStreamingResponse = true;
                    if (!needsStreamingResponse) return [3, 1];
                    request.get({
                        headers: {},
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
                            headers: {},
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
    topRouter.use("/opds12", routerOPDS12);
}
exports.serverOPDS12 = serverOPDS12;
//# sourceMappingURL=server-opds1-2.js.map