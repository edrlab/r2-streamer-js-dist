"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverRemotePub = exports.serverRemotePub_PATH = void 0;
var debug_ = require("debug");
var express = require("express");
var morgan = require("morgan");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var request_ext_1 = require("./request-ext");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:streamer#http/server-url");
exports.serverRemotePub_PATH = "/url";
function serverRemotePub(_server, topRouter) {
    var routerUrl = express.Router({ strict: false });
    routerUrl.use(morgan("combined", { stream: { write: function (msg) { return debug(msg); } } }));
    routerUrl.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerUrl.get("/", function (_req, res) {
        var html = "<html><head>";
        html += "<script type=\"text/javascript\">function encodeURIComponent_RFC3986(str) { " +
            "return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { " +
            "return \"%\" + c.charCodeAt(0).toString(16); }); }" +
            "function go(evt) {" +
            "if (evt) { evt.preventDefault(); } var url = " +
            "location.origin +" +
            " '".concat(exports.serverRemotePub_PATH, "/' +") +
            " encodeURIComponent_RFC3986(document.getElementById(\"url\").value);" +
            "location.href = url;}</script>";
        html += "</head>";
        html += "<body><h1>Publication URL</h1>";
        html += "<form onsubmit=\"go();return false;\">" +
            "<input type=\"text\" name=\"url\" id=\"url\" size=\"80\">" +
            "<input type=\"submit\" value=\"Go!\"></form>";
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerUrl.param("urlEncoded", function (req, _res, next, value, _name) {
        req.urlEncoded = value;
        next();
    });
    routerUrl.get("/:" + request_ext_1._urlEncoded + "(*)", function (req, res) {
        var reqparams = req.params;
        if (!reqparams.urlEncoded) {
            reqparams.urlEncoded = req.urlEncoded;
        }
        var urlDecoded = reqparams.urlEncoded;
        debug(urlDecoded);
        var urlDecodedBase64 = (0, UrlUtils_1.encodeURIComponent_RFC3986)(Buffer.from(urlDecoded).toString("base64"));
        var redirect = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverRemotePub_PATH + "/"))
            + "/pub/" + urlDecodedBase64 + "/";
        debug("REDIRECT: ".concat(req.originalUrl, " ==> ").concat(redirect));
        res.redirect(301, redirect);
    });
    topRouter.use(exports.serverRemotePub_PATH, routerUrl);
}
exports.serverRemotePub = serverRemotePub;
//# sourceMappingURL=server-url.js.map