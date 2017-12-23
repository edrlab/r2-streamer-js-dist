"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const querystring = require("querystring");
const debug_ = require("debug");
const express = require("express");
const morgan = require("morgan");
const UrlUtils_1 = require("r2-shared-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:server:pub");
function serverPub(server, topRouter) {
    const urlBook = "/pub/PATH_BASE64/manifest.json";
    const urlBookShowAll = "./manifest.json/show/all";
    const urlReaderNYPL = "/readerNYPL/?url=PREFIX" + querystring.escape(urlBook);
    const urlReaderHADRIEN = "/readerHADRIEN/?manifest=true&href=PREFIX"
        + querystring.escape(urlBook);
    const urlReaderEPUBJS = "https://s3.amazonaws.com/epubjs-manifest/examples/manifest.html?href=PREFIZ"
        + urlBook;
    const urlReaderHADRIENbasic = "https://hadriengardeur.github.io/webpub-manifest/examples/viewer/?manifest=true&href=PREFIX"
        + querystring.escape(urlBook);
    const urlReaderREADIUM1 = "http://readium-2.surge.sh/?epub=PREFIX"
        + querystring.escape(urlBook);
    const htmlLanding = "<html><body><h1>PATH_STR</h1><h2><a href='" +
        urlBookShowAll + "'>" + urlBookShowAll + "</a></h2>" +
        (server.disableReaders ? "" : ("<p>Reader NYPL:<br><a href='" +
            urlReaderNYPL + "'>" + urlReaderNYPL + "</a></p><p>Reader HADRIEN:<br><a href='" +
            urlReaderHADRIEN + "'>" + urlReaderHADRIEN + "</a></p><p>Reader EPUB.js:<br><a href='" +
            urlReaderEPUBJS + "'>" + urlReaderEPUBJS + "</a></p><p>Reader HADRIEN BASIC:<br><a href='" +
            urlReaderHADRIENbasic + "'>" + urlReaderHADRIENbasic + "</a></p><p>Reader READIUM-1:<br><a href='" +
            urlReaderREADIUM1 + "'>" + urlReaderREADIUM1 + "</a></p>")) +
        "</body></html>";
    const routerPathBase64 = express.Router({ strict: false });
    routerPathBase64.use(morgan("combined"));
    routerPathBase64.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerPathBase64.param("pathBase64", (req, res, next, value, _name) => {
        if (value.indexOf(server.lcpBeginToken) === 0 && value.indexOf(server.lcpEndToken) > 0) {
            const i = value.indexOf(server.lcpEndToken);
            const pass64 = value.substr(server.lcpBeginToken.length, i - server.lcpBeginToken.length);
            req.lcpPass64 = pass64;
            value = value.substr(i + server.lcpEndToken.length);
            req.params.pathBase64 = value;
            debug(value);
        }
        const valueStr = new Buffer(value, "base64").toString("utf8");
        debug(valueStr);
        if (UrlUtils_1.isHTTP(valueStr)) {
            req.pathBase64 = value;
            next();
            return;
        }
        const found = server.getPublications().find((filePath) => {
            const filePathBase64 = new Buffer(filePath).toString("base64");
            return value === filePathBase64;
        });
        if (found) {
            req.pathBase64 = value;
            next();
        }
        else {
            res.status(403).send("<html><body><p>Forbidden</p><p>INVALID parameter: <code>"
                + req.params.pathBase64 + "</code></p></body></html>");
        }
    });
    routerPathBase64.get("/:pathBase64", (req, res) => {
        if (!req.params.pathBase64) {
            req.params.pathBase64 = req.pathBase64;
        }
        const pathBase64Str = new Buffer(req.params.pathBase64, "base64").toString("utf8");
        debug(`Publication: ${pathBase64Str}`);
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        res.status(200).send(htmlLanding
            .replace(/PATH_STR/g, path.basename(pathBase64Str))
            .replace(/PATH_BASE64/g, UrlUtils_1.encodeURIComponent_RFC3986(req.params.pathBase64))
            .replace(/PREFIX/g, (isSecureHttp ?
            querystring.escape("https://") : querystring.escape("http://"))
            + req.headers.host).replace(/PREFIZ/g, (isSecureHttp ?
            "https://" : "http://")
            + req.headers.host));
    });
    topRouter.use("/pub", routerPathBase64);
    return routerPathBase64;
}
exports.serverPub = serverPub;
//# sourceMappingURL=server-pub.js.map