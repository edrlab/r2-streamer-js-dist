"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debug_ = require("debug");
var express = require("express");
var morgan = require("morgan");
var request_ext_1 = require("./request-ext");
var server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
var debug = debug_("r2:streamer#http/server-url");
function serverUrl(_server, topRouter) {
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
            " '/url/' +" +
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
        var urlDecodedBase64 = new Buffer(urlDecoded).toString("base64");
        var redirect = req.originalUrl.substr(0, req.originalUrl.indexOf("/url/"))
            + "/pub/" + urlDecodedBase64 + "/";
        debug("REDIRECT: " + req.originalUrl + " ==> " + redirect);
        res.redirect(301, redirect);
    });
    topRouter.use("/url", routerUrl);
}
exports.serverUrl = serverUrl;
//# sourceMappingURL=server-url.js.map