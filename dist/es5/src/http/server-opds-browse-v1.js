"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOPDS_browse_v1 = exports.serverOPDS_browse_v1_PATH = void 0;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var express = require("express");
var morgan = require("morgan");
var request = require("request");
var requestPromise = require("request-promise-native");
var xmldom = require("xmldom");
var opds_1 = require("r2-opds-js/dist/es5/src/opds/opds1/opds");
var opds_entry_1 = require("r2-opds-js/dist/es5/src/opds/opds1/opds-entry");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var request_ext_1 = require("./request-ext");
var server_lcp_lsd_show_1 = require("./server-lcp-lsd-show");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var server_url_1 = require("./server-url");
var debug = debug_("r2:streamer#http/server-opds-browse-v1");
exports.serverOPDS_browse_v1_PATH = "/opds-v1-browse";
function serverOPDS_browse_v1(_server, topRouter) {
    var _this = this;
    var routerOPDS_browse_v1 = express.Router({ strict: false });
    routerOPDS_browse_v1.use(morgan("combined", { stream: { write: function (msg) { return debug(msg); } } }));
    routerOPDS_browse_v1.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_browse_v1.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            (" '" + exports.serverOPDS_browse_v1_PATH + "/' +") +
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
    routerOPDS_browse_v1.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_browse_v1.get("/:" + request_ext_1._urlEncoded + "(*)", function (req, res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var reqparams, urlDecoded, failure, success, headers, needsStreamingResponse, response, err_1;
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
                    failure = function (err) {
                        debug(err);
                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                            + err + "</p></body></html>");
                    };
                    success = function (response) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
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
                                        var opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                                            + exports.serverOPDS_browse_v1_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
                                        html += "<a href='" + opdsUrl
                                            + "'>" + link.Href + "</a> (TITLE: " + link.Title
                                            + ") [REL: " + link.Rel + "]<br/>";
                                    }
                                    else if (opds && link.Type &&
                                        (link.Type === "application/vnd.readium.lcp.license.v1.0+json")) {
                                        var linkUrl = UrlUtils_1.ensureAbsolute(urlDecoded, link.Href);
                                        var opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                                            + server_lcp_lsd_show_1.serverLCPLSD_show_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
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
                                    var epubUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                                        + server_url_1.serverRemotePub_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(epub_);
                                    html += "<strong><a href='" + epubUrl + "'>" + epub_1 + "</a></strong>";
                                }
                            }
                            html += "</div>";
                        }
                        var responseData, err_2, responseStr, responseXml, isEntry, opds, opdsEntry, html, iconUrl, links;
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
                                    if (!responseXml || !responseXml.documentElement) {
                                        res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                                            + "XML parse fail" + "</p></body></html>");
                                        return [2];
                                    }
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
                                                var opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                                                    + exports.serverOPDS_browse_v1_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
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
    topRouter.use(exports.serverOPDS_browse_v1_PATH, routerOPDS_browse_v1);
}
exports.serverOPDS_browse_v1 = serverOPDS_browse_v1;
//# sourceMappingURL=server-opds-browse-v1.js.map