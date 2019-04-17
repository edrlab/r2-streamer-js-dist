"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const path = require("path");
const opds2_link_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2-link");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/JsonUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const DotProp = require("dot-prop");
const express = require("express");
const jsonMarkup = require("json-markup");
const ta_json_x_1 = require("ta-json-x");
const json_schema_validate_1 = require("../utils/json-schema-validate");
const request_ext_1 = require("./request-ext");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:streamer#http/server-opds-local-feed");
exports.serverOPDS_local_feed_PATH = "/opds2";
exports.serverOPDS_local_feed_PATH_ = "/publications.json";
function serverOPDS_local_feed(server, topRouter) {
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
    const routerOPDS_local_feed = express.Router({ strict: false });
    routerOPDS_local_feed.get(["/", "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], (req, res) => {
        const reqparams = req.params;
        const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        if (!reqparams.jsonPath && req.query.show) {
            reqparams.jsonPath = req.query.show;
        }
        const isCanonical = req.query.canonical &&
            req.query.canonical === "true";
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host;
        const selfURL = rootUrl + exports.serverOPDS_local_feed_PATH + exports.serverOPDS_local_feed_PATH_;
        const feed = server.publicationsOPDS();
        if (!feed) {
            const err = "Publications OPDS2 feed not available yet, try again later.";
            debug(err);
            res.status(503).send("<html><body><p>Resource temporarily unavailable</p><p>"
                + err + "</p></body></html>");
            return;
        }
        if (!feed.findFirstLinkByRel("self")) {
            feed.Links = [];
            const selfLink = new opds2_link_1.OPDSLink();
            selfLink.Href = selfURL;
            selfLink.TypeLink = "application/opds+json";
            selfLink.AddRel("self");
            feed.Links.push(selfLink);
        }
        function absoluteURL(href) {
            return rootUrl + "/pub/" + href;
        }
        function absolutizeURLs(jsonObj) {
            JsonUtils_1.traverseJsonObjects(jsonObj, (obj) => {
                if (obj.href && typeof obj.href === "string") {
                    if (!UrlUtils_1.isHTTP(obj.href)) {
                        obj.href = absoluteURL(obj.href);
                    }
                    if (isShow &&
                        obj.type === "application/webpub+json" &&
                        obj.rel === "http://opds-spec.org/acquisition" &&
                        obj.href.endsWith("/manifest.json")) {
                        obj.href += "/show";
                    }
                }
            });
        }
        if (isShow) {
            let objToSerialize = null;
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
            const jsonObj = ta_json_x_1.JSON.serialize(objToSerialize);
            let validationStr;
            const doValidate = !reqparams.jsonPath || reqparams.jsonPath === "all";
            if (doValidate) {
                const jsonSchemasRootpath = path.join(process.cwd(), "misc", "json-schema");
                const jsonSchemasNames = [
                    "opds/feed",
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
                const validationErrors = json_schema_validate_1.jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonObj);
                if (validationErrors) {
                    validationStr = "";
                    for (const err of validationErrors) {
                        debug("JSON Schema validation FAIL.");
                        debug(err);
                        const val = DotProp.get(jsonObj, err.jsonPath);
                        const valueStr = (typeof val === "string") ?
                            `${val}` :
                            ((val instanceof Array || typeof val === "object") ?
                                `${JSON.stringify(val)}` :
                                "");
                        debug(valueStr);
                        let title = "";
                        let pubIndex = "";
                        if (/^publications\.[0-9]+/.test(err.jsonPath)) {
                            const jsonPubTitlePath = err.jsonPath.replace(/^(publications\.[0-9]+).*/, "$1.metadata.title");
                            debug(jsonPubTitlePath);
                            title = DotProp.get(jsonObj, jsonPubTitlePath);
                            debug(title);
                            pubIndex = err.jsonPath.replace(/^publications\.([0-9]+).*/, "$1");
                            debug(pubIndex);
                        }
                        validationStr +=
                            `\n___________INDEX___________ #${pubIndex} "${title}"\n\n${err.ajvMessage}: ${valueStr}\n\n'${err.ajvDataPath.replace(/^\./, "")}' (${err.ajvSchemaPath})\n\n`;
                    }
                }
            }
            absolutizeURLs(jsonObj);
            if (jsonObj.publications && jsonObj.publications.length) {
                let i = 0;
                jsonObj.publications.forEach((pub) => {
                    pub.___________INDEX___________ = i++;
                });
            }
            const jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            res.status(200).send("<html><body>" +
                "<h1>OPDS2 JSON feed</h1>" +
                "<hr><p><pre>" + jsonPretty + "</pre></p>" +
                (doValidate ? (validationStr ? ("<hr><p><pre>" + validationStr + "</pre></p>") : ("<hr><p>JSON SCHEMA OK.</p>")) : "") +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", "application/opds+json; charset=utf-8");
            const publicationsJsonObj = ta_json_x_1.JSON.serialize(feed);
            absolutizeURLs(publicationsJsonObj);
            const publicationsJsonStr = isCanonical ?
                global.JSON.stringify(JsonUtils_1.sortObject(publicationsJsonObj), null, "") :
                global.JSON.stringify(publicationsJsonObj, null, "  ");
            const checkSum = crypto.createHash("sha256");
            checkSum.update(publicationsJsonStr);
            const hash = checkSum.digest("hex");
            const match = req.header("If-None-Match");
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
    const routerOPDS_local_feed_ = express.Router({ strict: false });
    routerOPDS_local_feed_.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS_local_feed_.get("/", (req, res) => {
        const i = req.originalUrl.indexOf("?");
        let pathWithoutQuery = req.originalUrl;
        if (i >= 0) {
            pathWithoutQuery = pathWithoutQuery.substr(0, i);
        }
        let redirect = pathWithoutQuery +
            exports.serverOPDS_local_feed_PATH_ + "/show";
        redirect = redirect.replace("//", "/");
        if (i >= 0) {
            redirect += req.originalUrl.substr(i);
        }
        debug(`REDIRECT: ${req.originalUrl} ==> ${redirect}`);
        res.redirect(301, redirect);
    });
    routerOPDS_local_feed_.use(exports.serverOPDS_local_feed_PATH_, routerOPDS_local_feed);
    topRouter.use(exports.serverOPDS_local_feed_PATH, routerOPDS_local_feed_);
}
exports.serverOPDS_local_feed = serverOPDS_local_feed;
//# sourceMappingURL=server-opds-local-feed.js.map