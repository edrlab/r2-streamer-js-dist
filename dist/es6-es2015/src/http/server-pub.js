"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverPub = exports.serverPub_PATH = void 0;
const debug_ = require("debug");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const querystring = require("querystring");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const request_ext_1 = require("./request-ext");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:streamer#http/server-pub");
exports.serverPub_PATH = "/pub";
function serverPub(server, topRouter) {
    const urlBook = exports.serverPub_PATH + "/PATH_BASE64/manifest.json";
    const urlBookShowAll = "./manifest.json/show/all";
    const urlReaderNYPL = "/readerNYPL/?url=PREFIX" + querystring.escape(urlBook);
    const urlReaderEPUBJS = "https://s3.amazonaws.com/epubjs-manifest/examples/manifest.html?href=PREFIZ" + urlBook;
    const urlReaderHADRIEN = "/readerHADRIEN/?manifest=true&href=PREFIX" + querystring.escape(urlBook);
    const urlReaderHADRIEN_ = "https://hadriengardeur.github.io/webpub-manifest/examples/viewer/?manifest=true&href=PREFIX"
        + querystring.escape(urlBook);
    const htmlLanding = "<html><body><h1>PATH_STR</h1><h2><a href='" +
        urlBookShowAll + "'>" + urlBookShowAll + "</a></h2>" +
        (server.disableReaders ? "" : ("<p>Reader NYPL:<br><a href='" + urlReaderNYPL + "'>" + urlReaderNYPL + "</a></p>" +
            "<p>Reader EPUB.js:<br><a href='" + urlReaderEPUBJS + "'>" + urlReaderEPUBJS + "</a></p>" +
            "<p>Reader HADRIEN:<br><a href='" + urlReaderHADRIEN + "'>" + urlReaderHADRIEN + "</a></p>" +
            "<p>Reader HADRIEN BASIC:<br><a href='" + urlReaderHADRIEN_ + "'>" + urlReaderHADRIEN_ + "</a></p>")) +
        "</body></html>";
    const routerPathBase64 = express.Router({ strict: false });
    routerPathBase64.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerPathBase64.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerPathBase64.param("pathBase64", (req, res, next, value, _name) => {
        const reqparams = req.params;
        if (value.indexOf(server.lcpBeginToken) === 0 && value.indexOf(server.lcpEndToken) > 0) {
            const i = value.indexOf(server.lcpEndToken);
            const pass64 = value.substr(server.lcpBeginToken.length, i - server.lcpBeginToken.length);
            req.lcpPass64 = pass64;
            value = value.substr(i + server.lcpEndToken.length);
            reqparams.pathBase64 = value;
            debug(value);
        }
        const valueStr = Buffer.from(value, "base64").toString("utf8");
        if (UrlUtils_1.isHTTP(valueStr)) {
            req.pathBase64 = value;
            next();
            return;
        }
        const found = server.getPublications().find((filePath) => {
            const filePathBase64 = Buffer.from(filePath).toString("base64");
            return value === filePathBase64;
        });
        if (found) {
            req.pathBase64 = value;
            next();
        }
        else {
            res.status(403).send("<html><body><p>Forbidden</p><p>INVALID parameter: <code>"
                + reqparams.pathBase64 + "</code></p></body></html>");
        }
    });
    routerPathBase64.get("/:" + request_ext_1._pathBase64, (req, res) => {
        const reqparams = req.params;
        if (!reqparams.pathBase64) {
            reqparams.pathBase64 = req.pathBase64;
        }
        const pathBase64Str = Buffer.from(reqparams.pathBase64, "base64").toString("utf8");
        debug(`Publication: ${pathBase64Str}`);
        const isSecureHttp = req.secure ||
            req.protocol === "https" ||
            req.get("X-Forwarded-Proto") === "https";
        res.status(200).send(htmlLanding
            .replace(/PATH_STR/g, path.basename(pathBase64Str))
            .replace(/PATH_BASE64/g, UrlUtils_1.encodeURIComponent_RFC3986(reqparams.pathBase64))
            .replace(/PREFIX/g, (isSecureHttp ?
            querystring.escape("https://") : querystring.escape("http://"))
            + req.headers.host).replace(/PREFIZ/g, (isSecureHttp ?
            "https://" : "http://")
            + req.headers.host));
    });
    topRouter.use(exports.serverPub_PATH, routerPathBase64);
    return routerPathBase64;
}
exports.serverPub = serverPub;
//# sourceMappingURL=server-pub.js.map