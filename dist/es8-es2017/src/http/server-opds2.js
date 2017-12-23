"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const opds2_link_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const JsonUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/JsonUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const ta_json_1 = require("ta-json");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:server:opds2");
function serverOPDS2(server, topRouter) {
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
    const routerOPDS2 = express.Router({ strict: false });
    routerOPDS2.get(["/", "/show/:jsonPath?"], (req, res) => {
        const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        if (!req.params.jsonPath && req.query.show) {
            req.params.jsonPath = req.query.show;
        }
        const isCanonical = req.query.canonical && req.query.canonical === "true";
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        const rootUrl = (isSecureHttp ? "https://" : "http://")
            + req.headers.host;
        const selfURL = rootUrl + "/opds2/publications.json";
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
                if (obj.href && typeof obj.href === "string"
                    && !UrlUtils_1.isHTTP(obj.href)) {
                    obj.href = absoluteURL(obj.href);
                }
            });
        }
        if (isShow) {
            let objToSerialize = null;
            if (req.params.jsonPath) {
                switch (req.params.jsonPath) {
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
            const jsonObj = ta_json_1.JSON.serialize(objToSerialize);
            absolutizeURLs(jsonObj);
            const jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            res.status(200).send("<html><body>" +
                "<h1>OPDS2 JSON feed</h1>" +
                "<hr><p><pre>" + jsonPretty + "</pre></p>" +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", "application/opds+json; charset=utf-8");
            const publicationsJsonObj = ta_json_1.JSON.serialize(feed);
            absolutizeURLs(publicationsJsonObj);
            const publicationsJsonStr = isCanonical ?
                global.JSON.stringify(JsonUtils_1.sortObject(publicationsJsonObj), null, "") :
                global.JSON.stringify(publicationsJsonObj, null, "  ");
            const checkSum = crypto.createHash("sha256");
            checkSum.update(publicationsJsonStr);
            const hash = checkSum.digest("hex");
            const match = req.header("If-None-Match");
            if (match === hash) {
                debug("publications.json cache");
                res.status(304);
                res.end();
                return;
            }
            res.setHeader("ETag", hash);
            res.status(200).send(publicationsJsonStr);
        }
    });
    const routerOPDS2_ = express.Router({ strict: false });
    routerOPDS2_.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerOPDS2_.get("/", (req, res) => {
        const i = req.originalUrl.indexOf("?");
        let pathWithoutQuery = req.originalUrl;
        if (i >= 0) {
            pathWithoutQuery = pathWithoutQuery.substr(0, i);
        }
        let redirect = pathWithoutQuery +
            (pathWithoutQuery.substr(-1) === "/" ? "" : "/") +
            "publications.json/show";
        if (i >= 0) {
            redirect += req.originalUrl.substr(i);
        }
        debug(`REDIRECT: ${req.originalUrl} ==> ${redirect}`);
        res.redirect(301, redirect);
    });
    routerOPDS2_.use("/publications.json", routerOPDS2);
    topRouter.use("/opds2", routerOPDS2_);
}
exports.serverOPDS2 = serverOPDS2;
//# sourceMappingURL=server-opds2.js.map