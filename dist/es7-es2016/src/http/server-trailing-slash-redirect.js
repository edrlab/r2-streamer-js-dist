"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trailingSlashRedirect = void 0;
const debug_ = require("debug");
const debug = debug_("r2:streamer#http/server-trailing-slash-redirect");
function trailingSlashRedirect(req, res, next) {
    const i = req.originalUrl.indexOf("?");
    let pathWithoutQuery = req.originalUrl;
    if (i >= 0) {
        pathWithoutQuery = pathWithoutQuery.substr(0, i);
    }
    if (pathWithoutQuery.substr(-1) === "/"
        || pathWithoutQuery.indexOf(".") >= 0) {
        return next();
    }
    let redirect = pathWithoutQuery + "/";
    if (i >= 0) {
        redirect += req.originalUrl.substr(i);
    }
    debug(`REDIRECT: ${req.originalUrl} ==> ${redirect}`);
    res.redirect(301, redirect);
}
exports.trailingSlashRedirect = trailingSlashRedirect;
//# sourceMappingURL=server-trailing-slash-redirect.js.map