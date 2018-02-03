"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_ = require("debug");
const express = require("express");
const morgan = require("morgan");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:streamer#http/server-url");
function serverUrl(_server, topRouter) {
    const routerUrl = express.Router({ strict: false });
    routerUrl.use(morgan("combined"));
    routerUrl.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerUrl.get("/", (_req, res) => {
        let html = "<html><head>";
        html += `<script type="text/javascript">function encodeURIComponent_RFC3986(str) { ` +
            `return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { ` +
            `return "%" + c.charCodeAt(0).toString(16); }); }` +
            `function go(evt) {` +
            `if (evt) { evt.preventDefault(); } var url = ` +
            `location.origin +` +
            ` '/url/' +` +
            ` encodeURIComponent_RFC3986(document.getElementById("url").value);` +
            `location.href = url;}</script>`;
        html += "</head>";
        html += "<body><h1>Publication URL</h1>";
        html += `<form onsubmit="go();return false;">` +
            `<input type="text" name="url" id="url" size="80">` +
            `<input type="submit" value="Go!"></form>`;
        html += "</body></html>";
        res.status(200).send(html);
    });
    routerUrl.param("urlEncoded", (req, _res, next, value, _name) => {
        req.urlEncoded = value;
        next();
    });
    routerUrl.get("/:urlEncoded(*)", (req, res) => {
        if (!req.params.urlEncoded) {
            req.params.urlEncoded = req.urlEncoded;
        }
        const urlDecoded = req.params.urlEncoded;
        debug(urlDecoded);
        const urlDecodedBase64 = new Buffer(urlDecoded).toString("base64");
        const redirect = req.originalUrl.substr(0, req.originalUrl.indexOf("/url/"))
            + "/pub/" + urlDecodedBase64 + "/";
        debug(`REDIRECT: ${req.originalUrl} ==> ${redirect}`);
        res.redirect(301, redirect);
    });
    topRouter.use("/url", routerUrl);
}
exports.serverUrl = serverUrl;
//# sourceMappingURL=server-url.js.map