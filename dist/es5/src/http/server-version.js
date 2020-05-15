"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverVersion = exports.serverVersion_PATH = void 0;
var crypto = require("crypto");
var css2json = require("css2json");
var debug_ = require("debug");
var fs = require("fs");
var jsonMarkup = require("json-markup");
var path = require("path");
var request_ext_1 = require("./request-ext");
var debug = debug_("r2:streamer#http/server-version");
var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
exports.serverVersion_PATH = "/version";
function serverVersion(server, topRouter) {
    topRouter.get([exports.serverVersion_PATH, exports.serverVersion_PATH + "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], function (req, res) {
        var reqparams = req.params;
        var isShow = req.url.indexOf("/show") >= 0 || req.query.show;
        if (!reqparams.jsonPath && req.query.show) {
            reqparams.jsonPath = req.query.show;
        }
        var gitRevJson = "../../../gitrev.json";
        if (!fs.existsSync(path.resolve(path.join(__dirname, gitRevJson)))) {
            var err = "Missing Git rev JSON! ";
            debug(err + gitRevJson);
            res.status(500).send("<html><body><p>Internal Server Error</p><p>"
                + err + "</p></body></html>");
            return;
        }
        var jsonObj = require(gitRevJson);
        if (isShow) {
            var jsonPretty = jsonMarkup(jsonObj, css2json(jsonStyle));
            res.status(200).send("<html><body>" +
                "<h1>R2-STREAMER-JS VERSION INFO</h1>" +
                "<hr><p><pre>" + jsonPretty + "</pre></p>" +
                "</body></html>");
        }
        else {
            server.setResponseCORS(res);
            res.set("Content-Type", "application/json; charset=utf-8");
            var jsonStr = JSON.stringify(jsonObj, null, "  ");
            var checkSum = crypto.createHash("sha256");
            checkSum.update(jsonStr);
            var hash = checkSum.digest("hex");
            var match = req.header("If-None-Match");
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