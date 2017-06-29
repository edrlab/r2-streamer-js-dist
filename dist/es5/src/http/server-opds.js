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
var opds_1 = require("../opds/opds1/opds");
var opds_entry_1 = require("../opds/opds1/opds-entry");
var UrlUtils_1 = require("../_utils/http/UrlUtils");
var BufferUtils_1 = require("../_utils/stream/BufferUtils");
var xml_js_mapper_1 = require("../_utils/xml-js-mapper");
var debug_ = require("debug");
var express = require("express");
var morgan = require("morgan");
var request = require("request");
var requestPromise = require("request-promise-native");
var xmldom = require("xmldom");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:server:opds");
function serverOPDS(_server, topRouter) {
    var _this = this;
    var routerOPDS = express.Router({ strict: false });
    routerOPDS.use(morgan("combined"));
    routerOPDS.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            " '/opds/' +" +
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
    routerOPDS.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerOPDS.get("/:urlEncoded(*)", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var urlDecoded, failure, success, needsStreamingResponse, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.params.urlEncoded) {
                        req.params.urlEncoded = req.urlEncoded;
                    }
                    urlDecoded = req.params.urlEncoded;
                    debug(urlDecoded);
                    failure = function (err) {
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                    };
                    success = function (response) { return __awaiter(_this, void 0, void 0, function () {
                        function processEntry(entry) {
                            html += "<hr/>";
                            html += "<div>";
                            if (opds) {
                                html += "<h3>" + entry.Title + "</h3>";
                            }
                            if (entry.Summary) {
                                if (!entry.SummaryType || entry.SummaryType === "text") {
                                    html += "<strong>" + entry.Summary + "</strong>";
                                }
                                else if (entry.SummaryType === "html") {
                                    html += "<div>" + entry.Summary + "</div>";
                                }
                                html += "<br/>";
                            }
                            if (entry.Content) {
                                if (!entry.ContentType || entry.ContentType === "text") {
                                    html += "<strong>" + entry.Content + "</strong>";
                                }
                                else if (entry.ContentType === "html") {
                                    html += "<div>" + entry.Content + "</div>";
                                }
                                html += "<br/>";
                            }
                            if (entry.Links && entry.Links.length) {
                                var image_1;
                                var imageThumbnail_1;
                                var epub_1;
                                entry.Links.forEach(function (link) {
                                    if (link.Type === "application/epub+zip") {
                                        epub_1 = link.Href;
                                    }
                                    if (link.HasRel("http://opds-spec.org/image")
                                        || link.HasRel("x-stanza-cover-image")) {
                                        image_1 = link.Href;
                                    }
                                    if (link.HasRel("http://opds-spec.org/image/thumbnail")
                                        || link.HasRel("http://opds-spec.org/thumbnail")
                                        || link.HasRel("x-stanza-cover-image-thumbnail")) {
                                        imageThumbnail_1 = link.Href;
                                    }
                                    if (opds && link.Type &&
                                        (link.Type.indexOf("opds-catalog") >= 0 || link.Type === "application/atom+xml")) {
                                        var linkUrl = UrlUtils_1.ensureAbsolute(urlDecoded, link.Href);
                                        var opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf("/opds/"))
                                            + "/opds/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
                                        html += "<a href='" + opdsUrl
                                            + "'>" + link.Href + "</a> (TITLE: " + link.Title
                                            + ") [REL: " + link.Rel + "]<br/>";
                                    }
                                });
                                if (imageThumbnail_1) {
                                    var imageThumbnailUrl = UrlUtils_1.ensureAbsolute(urlDecoded, imageThumbnail_1);
                                    if (image_1) {
                                        var imageUrl = UrlUtils_1.ensureAbsolute(urlDecoded, image_1);
                                        html += "<a href='" + imageUrl + "'><img src='"
                                            + imageThumbnailUrl + "' alt='' /></a><br/>";
                                    }
                                    else {
                                        html += "<img src='" + imageThumbnailUrl + "' alt='' /><br/>";
                                    }
                                }
                                else if (image_1) {
                                    var imageUrl = UrlUtils_1.ensureAbsolute(urlDecoded, image_1);
                                    html += "<img src='" + imageUrl + "' alt='' /><br/>";
                                }
                                if (epub_1) {
                                    var epub_ = UrlUtils_1.ensureAbsolute(urlDecoded, epub_1);
                                    var epubUrl = req.originalUrl.substr(0, req.originalUrl.indexOf("/opds/"))
                                        + "/url/" + UrlUtils_1.encodeURIComponent_RFC3986(epub_);
                                    html += "<strong><a href='" + epubUrl + "'>" + epub_1 + "</a></strong>";
                                }
                            }
                            html += "</div>";
                        }
                        var responseData, err_2, responseStr, responseXml, isEntry, opds, opdsEntry, html, iconUrl, links;
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
                                        opdsEntry = xml_js_mapper_1.XML.deserialize(responseXml, opds_entry_1.Entry);
                                    }
                                    else {
                                        opds = xml_js_mapper_1.XML.deserialize(responseXml, opds_1.OPDS);
                                    }
                                    html = "<html><head>";
                                    html += "</head>";
                                    html += "<body><h1>" + urlDecoded + "</h1>";
                                    if (opds && opds.Title) {
                                        html += "<h2>" + opds.Title + "</h2>";
                                    }
                                    if (opdsEntry && opdsEntry.Title) {
                                        html += "<h2>" + opdsEntry.Title + "</h2>";
                                    }
                                    if (opds && opds.Icon) {
                                        iconUrl = UrlUtils_1.ensureAbsolute(urlDecoded, opds.Icon);
                                        html += "<img src='" + iconUrl + "' alt='' />";
                                    }
                                    links = opds ? opds.Links : (opdsEntry ? opdsEntry.Links : undefined);
                                    if (links && links.length) {
                                        html += "<p>";
                                        links.forEach(function (link) {
                                            if (link.Type &&
                                                (link.Type.indexOf("opds-catalog") >= 0 || link.Type === "application/atom+xml")) {
                                                var linkUrl = UrlUtils_1.ensureAbsolute(urlDecoded, link.Href);
                                                var opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf("/opds/"))
                                                    + "/opds/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
                                                html += "<a href='" + opdsUrl
                                                    + "'>" + link.Href + "</a> (TITLE: " + link.Title
                                                    + ") [REL: " + link.Rel + "]<br/>";
                                            }
                                        });
                                        html += "</p>";
                                    }
                                    if (opds && opds.Entries && opds.Entries.length) {
                                        opds.Entries.forEach(function (entry) {
                                            processEntry(entry);
                                        });
                                    }
                                    if (opdsEntry) {
                                        processEntry(opdsEntry);
                                    }
                                    html += "</body></html>";
                                    res.status(200).send(html);
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
    topRouter.use("/opds", routerOPDS);
}
exports.serverOPDS = serverOPDS;
//# sourceMappingURL=server-opds.js.map