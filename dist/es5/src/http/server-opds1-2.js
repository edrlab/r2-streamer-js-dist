"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    routerOPDS12.get("/:urlEncoded(*)", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var urlDecoded, isSecureHttp, rootUrl, failure, success, needsStreamingResponse, response, err_1;
        return __generator(this, function (_a) {
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
                    success = function (response) { return __awaiter(_this, void 0, void 0, function () {
                        var responseData, err_2, responseStr, responseXml, isEntry, opds1, opds2, err, funk, jsonObjOPDS1, jsonObjOPDS2, css, jsonPrettyOPDS1, jsonPrettyOPDS2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4, BufferUtils_1.streamToBufferPromise(response)];
                                case 1:
                                    responseData = _a.sent();
                                    return [3, 3];
                                case 2:
                                    err_2 = _a.sent();
                                    debug(err_2);
                                    res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                        + err_2 + "</p></body></html>");
                                    return [2];
                                case 3:
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
                case 5:
                    response = response;
                    return [4, success(response)];
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