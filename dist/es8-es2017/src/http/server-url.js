"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverRemotePub = exports.serverRemotePub_PATH = void 0;
const debug_ = require("debug");
const express = require("express");
const morgan = require("morgan");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const request_ext_1 = require("./request-ext");
const server_trailing_slash_redirect_1 = require("./server-trailing-slash-redirect");
const debug = debug_("r2:streamer#http/server-url");
exports.serverRemotePub_PATH = "/url";
function serverRemotePub(_server, topRouter) {
    const routerUrl = express.Router({ strict: false });
    routerUrl.use(morgan("combined", { stream: { write: (msg) => debug(msg) } }));
    routerUrl.use(server_trailing_slash_redirect_1.trailingSlashRedirect);
    routerUrl.get("/", (_req, res) => {
        let html = "<html><head>";
        html += `<script type="text/javascript">function encodeURIComponent_RFC3986(str) { ` +
            `return encodeURIComponent(str).replace(/[!'()*]/g, (c) => { ` +
            `return "%" + c.charCodeAt(0).toString(16); }); }` +
            `function go(evt) {` +
            `if (evt) { evt.preventDefault(); } var url = ` +
            `location.origin +` +
            ` '${exports.serverRemotePub_PATH}/' +` +
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
    routerUrl.get("/:" + request_ext_1._urlEncoded + "(*)", (req, res) => {
        const reqparams = req.params;
        if (!reqparams.urlEncoded) {
            reqparams.urlEncoded = req.urlEncoded;
        }
        const urlDecoded = reqparams.urlEncoded;
        debug(urlDecoded);
        const urlDecodedBase64 = UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(urlDecoded).toString("base64"));
        const redirect = req.originalUrl.substr(0, req.originalUrl.indexOf(exports.serverRemotePub_PATH + "/"))
            + "/pub/" + urlDecodedBase64 + "/";
        debug(`REDIRECT: ${req.originalUrl} ==> ${redirect}`);
        res.redirect(301, redirect);
    });
    topRouter.use(exports.serverRemotePub_PATH, routerUrl);
}
exports.serverRemotePub = serverRemotePub;
//# sourceMappingURL=server-url.js.map