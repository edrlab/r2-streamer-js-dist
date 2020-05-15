"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverVersion = exports.serverVersion_PATH = void 0;
const crypto = require("crypto");
const css2json = require("css2json");
const debug_ = require("debug");
const fs = require("fs");
const jsonMarkup = require("json-markup");
const path = require("path");
const request_ext_1 = require("./request-ext");
const debug = debug_("r2:streamer#http/server-version");
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
exports.serverVersion_PATH = "/version";
function serverVersion(server, topRouter) {
    topRouter.get([exports.serverVersion_PATH, exports.serverVersion_PATH + "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], (req, res) => {
        const reqparams = req.params;
        const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        if (!reqparams.jsonPath && req.query.show) {
            reqparams.jsonPath = req.query.show;
        }
        const gitRevJson = "../../../gitrev.json";
        if (!fs.existsSync(path.resolve(path.join(__dirname, gitRevJson)))) {
            const err = "Missing Git rev JSON! ";
            debug(err + gitRevJson);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        const jsonObj = require(gitRevJson);
        if (isShow) {
            const jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            res.status(200).send("<html><body>" +
                "<h1>R2-STREAMER-JS VERSION INFO</h1>" +
                "<hr><p><pre>" + jsonPretty + "</pre></p>" +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", "application/json; charset=utf-8");
            const jsonStr = JSON.stringify(jsonObj, null, "  ");
            const checkSum = crypto.createHash("sha256");
            checkSum.update(jsonStr);
            const hash = checkSum.digest("hex");
            const match = req.header("If-None-Match");
            if (match === hash) {
                debug("publications.json cache");
                res.status(304);
                res.end();
                return;
            }
            res.setHeader("ETag", hash);
            res.status(200).send(jsonStr);
        }
    });
}
exports.serverVersion = serverVersion;
//# sourceMappingURL=server-version.js.map