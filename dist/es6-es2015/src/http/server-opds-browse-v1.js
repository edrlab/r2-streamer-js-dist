"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOPDS_browse_v1 = exports.serverOPDS_browse_v1_PATH = void 0;
const tslib_1 = require("tslib");
const debug_ = require("debug");
const express = require("express");
const morgan = require("morgan");
const request = require("request");
const requestPromise = require("request-promise-native");
const xmldom = require("xmldom");
const opds_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds1/opds");
const opds_entry_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds1/opds-entry");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const xml_js_mapper_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/xml-js-mapper");
const request_ext_1 = require("./request-ext");
const server_lcp_lsd_show_1 = require("./server-lcp-lsd-show");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const server_url_1 = require("./server-url");
const debug = debug_("r2:streamer#http/server-opds-browse-v1");
exports.serverOPDS_browse_v1_PATH = "/opds-v1-browse";
function serverOPDS_browse_v1(_server, topRouter) {
    const routerOPDS_browse_v1 = express.Router({ strict: false });
    routerOPDS_browse_v1.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerOPDS_browse_v1.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_browse_v1.get("/", (_req, res) => {
        let html = "<html><head>";
        html += `<script type="text/javascript">function encodeURIComponent_RFC3986(str) { ` +
            `return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { ` +
            `return "%" + c.charCodeAt(0).toString(16); }); }` +
            `function go(evt) {` +
            `if (evt) { evt.preventDefault(); } var url = ` +
            `location.origin +` +
            ` '${exports.serverOPDS_browse_v1_PATH}/' +` +
            ` encodeURIComponent_RFC3986(document.getElementById("url").value);` +
            `location.href = url;}</script>`;
        html += "</head>";
        html += "<body><h1>OPDS feed browser</h1>";
        html += `<form onsubmit="go();return false;">` +
            `<input type="text" name="url" id="url" size="80">` +
            `<input type="submit" value="Go!"></form>`;
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerOPDS_browse_v1.param("urlEncoded", (req, _res, next, value, _name) => {
        req.urlEncoded = value;
        next();
    });
    routerOPDS_browse_v1.get("/:" + request_ext_1._urlEncoded + "(*)", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const reqparams = req.params;
        if (!reqparams.urlEncoded) {
            reqparams.urlEncoded = req.urlEncoded;
        }
        const urlDecoded = reqparams.urlEncoded;
        debug(urlDecoded);
        const failure = (err) => {
            debug(err);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
        };
        const success = (response) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            let opds;
            let opdsEntry;
            if (isEntry) {
                opdsEntry = xml_js_mapper_1.XML.deserialize(responseXml, opds_entry_1.Entry);
            }
            else {
                opds = xml_js_mapper_1.XML.deserialize(responseXml, opds_1.OPDS);
            }
            let html = "<html><head>";
            html += "</head>";
            html += "<body><h1>" + urlDecoded + "</h1>";
            if (opds && opds.Title) {
                html += "<h2>" + opds.Title + "</h2>";
            }
            if (opdsEntry && opdsEntry.Title) {
                html += "<h2>" + opdsEntry.Title + "</h2>";
            }
            if (opds && opds.Icon) {
                const iconUrl = UrlUtils_1.ensureAbsolute(urlDecoded, opds.Icon);
                html += "<img src='" + iconUrl + "' alt='' />";
            }
            const links = opds ? opds.Links : (opdsEntry ? opdsEntry.Links : undefined);
            if (links && links.length) {
                html += "<p>";
                links.forEach((link) => {
                    if (link.Type &&
                        (link.Type.indexOf("opds-catalog") >= 0 || link.Type === "application/atom+xml")) {
                        const linkUrl = UrlUtils_1.ensureAbsolute(urlDecoded, link.Href);
                        const opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                            + exports.serverOPDS_browse_v1_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
                        html += "<a href='" + opdsUrl
                            + "'>" + link.Href + "</a> (TITLE: " + link.Title
                            + ") [REL: " + link.Rel + "]<br/>";
                    }
                });
                html += "</p>";
            }
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
                    let image;
                    let imageThumbnail;
                    let epub;
                    entry.Links.forEach((link) => {
                        if (link.Type === "application/epub+zip") {
                            epub = link.Href;
                        }
                        if (link.HasRel("http://opds-spec.org/image")
                            || link.HasRel("x-stanza-cover-image")) {
                            image = link.Href;
                        }
                        if (link.HasRel("http://opds-spec.org/image/thumbnail")
                            || link.HasRel("http://opds-spec.org/thumbnail")
                            || link.HasRel("x-stanza-cover-image-thumbnail")) {
                            imageThumbnail = link.Href;
                        }
                        if (opds && link.Type &&
                            (link.Type.indexOf("opds-catalog") >= 0 || link.Type === "application/atom+xml")) {
                            const linkUrl = UrlUtils_1.ensureAbsolute(urlDecoded, link.Href);
                            const opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                                + exports.serverOPDS_browse_v1_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
                            html += "<a href='" + opdsUrl
                                + "'>" + link.Href + "</a> (TITLE: " + link.Title
                                + ") [REL: " + link.Rel + "]<br/>";
                        }
                        else if (opds && link.Type &&
                            (link.Type === "application/vnd.readium.lcp.license.v1.0+json")) {
                            const linkUrl = UrlUtils_1.ensureAbsolute(urlDecoded, link.Href);
                            const opdsUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                                + server_lcp_lsd_show_1.serverLCPLSD_show_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(linkUrl);
                            html += "<a href='" + opdsUrl
                                + "'>" + link.Href + "</a> (TITLE: " + link.Title
                                + ") [REL: " + link.Rel + "]<br/>";
                        }
                    });
                    if (imageThumbnail) {
                        const imageThumbnailUrl = UrlUtils_1.ensureAbsolute(urlDecoded, imageThumbnail);
                        if (image) {
                            const imageUrl = UrlUtils_1.ensureAbsolute(urlDecoded, image);
                            html += "<a href='" + imageUrl + "'><img src='"
                                + imageThumbnailUrl + "' alt='' /></a><br/>";
                        }
                        else {
                            html += "<img src='" + imageThumbnailUrl + "' alt='' /><br/>";
                        }
                    }
                    else if (image) {
                        const imageUrl = UrlUtils_1.ensureAbsolute(urlDecoded, image);
                        html += "<img src='" + imageUrl + "' alt='' /><br/>";
                    }
                    if (epub) {
                        const epub_ = UrlUtils_1.ensureAbsolute(urlDecoded, epub);
                        const epubUrl = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverOPDS_browse_v1_PATH + "/"))
                            + server_url_1.serverRemotePub_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(epub_);
                        html += "<strong><a href='" + epubUrl + "'>" + epub + "</a></strong>";
                    }
                }
                html += "</div>";
            }
            if (opds && opds.Entries && opds.Entries.length) {
                opds.Entries.forEach((entry) => {
                    processEntry(entry);
                });
            }
            if (opdsEntry) {
                processEntry(opdsEntry);
            }
            html += "</body></html>";
            res.status(200).send(html);
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
    topRouter.use(exports.serverOPDS_browse_v1_PATH, routerOPDS_browse_v1);
}
exports.serverOPDS_browse_v1 = serverOPDS_browse_v1;
//# sourceMappingURL=server-opds-browse-v1.js.map