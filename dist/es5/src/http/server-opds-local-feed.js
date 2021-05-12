"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverOPDS_local_feed = exports.serverOPDS_local_feed_PATH_ = exports.serverOPDS_local_feed_PATH = void 0;
var crypto = require("crypto");
var css2json = require("css2json");
var debug_ = require("debug");
var DotProp = require("dot-prop");
var express = require("express");
var jsonMarkup = require("json-markup");
var path = require("path");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var opds2_link_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-link");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var JsonUtils_1 = require("r2-utils-js/dist/es5/src/_utils/JsonUtils");
var json_schema_validate_1 = require("../utils/json-schema-validate");
var request_ext_1 = require("./request-ext");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:streamer#http/server-opds-local-feed");
exports.serverOPDS_local_feed_PATH = "/opds2";
exports.serverOPDS_local_feed_PATH_ = "/publications.json";
function serverOPDS_local_feed(server, topRouter) {
    var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
    var routerOPDS_local_feed = express.Router({ strict: false });
    routerOPDS_local_feed.get(["/", "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], function (req, res) {
        var _a;
        var reqparams = req.params;
        var isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        if (!reqparams.jsonPath && req.query.show) {
            reqparams.jsonPath = req.query.show;
        }
        var isCanonical = req.query.canonical &&
            req.query.canonical === "true";
        var isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        var rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host;
        var selfURL = rootUrl + exports.serverOPDS_local_feed_PATH + exports.serverOPDS_local_feed_PATH_;
        var feed = server.publicationsOPDS();
        if (!feed) {
            var err = "Publications OPDS2 feed not available yet, try again later.";
            debug(err);
            res.status(503).send("<html><body><p>Resource temporarily unavailable</p><p>"
                + err + "</p></body></html>");
            return;
        }
        if (!feed.findFirstLinkByRel("self")) {
            feed.Links = [];
            var selfLink = new opds2_link_1.OPDSLink();
            selfLink.Href = selfURL;
            selfLink.TypeLink = "application/opds+json";
            selfLink.AddRel("self");
            feed.Links.push(selfLink);
        }
        function absoluteURL(href) {
            return rootUrl + "/pub/" + href;
        }
        function absolutizeURLs(jsonObj) {
            JsonUtils_1.traverseJsonObjects(jsonObj, function (obj) {
                if (obj.href && typeof obj.href === "string") {
                    if (!UrlUtils_1.isHTTP(obj.href)) {
                        obj.href = absoluteURL(obj.href);
                    }
                    if (isShow &&
                        (obj.type === "application/webpub+json"
                            || obj.type === "application/audiobook+json"
                            || obj.type === "application/divina+json") &&
                        obj.rel === "http://opds-spec.org/acquisition" &&
                        obj.href.endsWith("/manifest.json")) {
                        obj.href += "/show";
                    }
                }
            });
        }
        if (isShow) {
            var objToSerialize = null;
            if (reqparams.jsonPath) {
                switch (reqparams.jsonPath) {
                    case "all": {
                        objToSerialize = feed;
                        break;
                    }
                    case "metadata": {
                        objToSerialize = feed.Metadata;
                        break;
                    }
                    case "links": {
                        objToSerialize = feed.Links;
                        break;
                    }
                    case "publications": {
                        objToSerialize = feed.Publications;
                        break;
                    }
                    default: {
                        objToSerialize = null;
                    }
                }
            }
            else {
                objToSerialize = feed;
            }
            if (!objToSerialize) {
                objToSerialize = {};
            }
            var jsonObj = serializable_1.TaJsonSerialize(objToSerialize);
            var validationStr = void 0;
            var doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
            if (doValidate) {
                var jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                var jsonSchemasNames = [
                    "opds/feed",
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
                var validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonObj);
                if (validationErrors) {
                    validationStr = "";
                    for (var _i = 0, validationErrors_1 = validationErrors; _i < validationErrors_1.length; _i++) {
                        var err = validationErrors_1[_i];
                        debug("JSON Schema validation FAIL.");
                        debug(err);
                        var val = err.jsonPath ? DotProp.get(jsonObj, err.jsonPath) : "";
                        var valueStr = (typeof val === "string") ?
                            "" + val :
                            ((val instanceof Array || typeof val === "object") ?
                                "" + JSON.stringify(val) :
                                "");
                        debug(valueStr);
                        var title = "";
                        var pubIndex = "";
                        if (err.jsonPath && /^publications\.[0-9]+/.test(err.jsonPath)) {
                            var jsonPubTitlePath = err.jsonPath.replace(/^(publications\.[0-9]+).*/, "$1.metadata.title");
                            debug(jsonPubTitlePath);
                            title = DotProp.get(jsonObj, jsonPubTitlePath);
                            debug(title);
                            pubIndex = err.jsonPath.replace(/^publications\.([0-9]+).*/, "$1");
                            debug(pubIndex);
                        }
                        validationStr +=
                            "\n___________INDEX___________ #" + pubIndex + " \"" + title + "\"\n\n" + err.ajvMessage + ": " + valueStr + "\n\n'" + ((_a = err.ajvDataPath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "")) + "' (" + err.ajvSchemaPath + ")\n\n";
                    }
                }
            }
            absolutizeURLs(jsonObj);
            if (jsonObj.publications && jsonObj.publications.length) {
                var i_1 = 0;
                jsonObj.publications.forEach(function (pub) {
                    pub.___________INDEX___________ = i_1++;
                });
            }
            var jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            res.status(200).send("<html><body>" +
                "<h1>OPDS2 JSON feed</h1>" +
                "<hr><p><pre>" + jsonPretty + "</pre></p>" +
                (doValidate ? (validationStr ? ("<hr><p><pre>" + validationStr + "</pre></p>") : ("<hr><p>JSON SCHEMA OK.</p>")) : "") +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", "application/opds+json; charset=utf-8");
            var publicationsJsonObj = serializable_1.TaJsonSerialize(feed);
            absolutizeURLs(publicationsJsonObj);
            var publicationsJsonStr = isCanonical ?
                global.JSON.stringify(JsonUtils_1.sortObject(publicationsJsonObj), null, "") :
                global.JSON.stringify(publicationsJsonObj, null, "  ");
            var checkSum = crypto.createHash("sha256");
            checkSum.update(publicationsJsonStr);
            var hash = checkSum.digest("hex");
            var match = req.header("If-None-Match");
            if (match === hash) {
                debug("opds2 publications.json cache");
                res.status(304);
                res.end();
                return;
            }
            res.setHeader("ETag", hash);
            res.status(200).send(publicationsJsonStr);
        }
    });
    var routerOPDS_local_feed_ = express.Router({ strict: false });
    routerOPDS_local_feed_.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_local_feed_.get("/", function (req, res) {
        var i = req.originalUrl.indexOf("?");
        var pathWithoutQuery = req.originalUrl;
        if (i >= 0) {
            pathWithoutQuery = pathWithoutQuery.substr(0, i);
        }
        var redirect = pathWithoutQuery +
            exports.serverOPDS_local_feed_PATH_ + "/show";
        redirect = redirect.replace("//", "/");
        if (i >= 0) {
            redirect += req.originalUrl.substr(i);
        }
        debug("REDIRECT: " + req.originalUrl + " ==> " + redirect);
        res.redirect(301, redirect);
    });
    routerOPDS_local_feed_.use(exports.serverOPDS_local_feed_PATH_, routerOPDS_local_feed);
    topRouter.use(exports.serverOPDS_local_feed_PATH, routerOPDS_local_feed_);
}
exports.serverOPDS_local_feed = serverOPDS_local_feed;
//# sourceMappingURL=server-opds-local-feed.js.map