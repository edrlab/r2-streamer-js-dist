"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require("child_process");
var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
var opds2_1 = require("../opds/opds2/opds2");
var UrlUtils_1 = require("../_utils/http/UrlUtils");
var css2json = require("css2json");
var debug_ = require("debug");
var express = require("express");
var jsonMarkup = require("json-markup");
var ta_json_1 = require("ta-json");
var tmp_1 = require("tmp");
var server_assets_1 = require("./server-assets");
var server_manifestjson_1 = require("./server-manifestjson");
var server_mediaoverlays_1 = require("./server-mediaoverlays");
var server_opds_1 = require("./server-opds");
var server_opds2_1 = require("./server-opds2");
var server_pub_1 = require("./server-pub");
var server_url_1 = require("./server-url");
var debug = debug_("r2:server:main");
var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
var Server = (function () {
    function Server(options) {
        var _this = this;
        this.lcpBeginToken = "*-";
        this.lcpEndToken = "-*";
        this.disableReaders = options ? options.disableReaders : false;
        this.publications = [];
        this.pathPublicationMap = {};
        this.publicationsOPDSfeed = undefined;
        this.publicationsOPDSfeedNeedsUpdate = true;
        this.creatingPublicationsOPDS = false;
        this.opdsJsonFilePath = tmp_1.tmpNameSync({ prefix: "readium2-OPDS2-", postfix: ".json" });
        this.started = false;
        this.expressApp = express();
        var staticOptions = {
            etag: false,
        };
        if (!this.disableReaders) {
            this.expressApp.use("/readerNYPL", express.static("misc/readers/reader-NYPL", staticOptions));
            this.expressApp.use("/readerHADRIEN", express.static("misc/readers/reader-HADRIEN", staticOptions));
        }
        this.expressApp.get("/", function (_req, res) {
            var html = "<html><body><h1>Publications</h1>";
            _this.publications.forEach(function (pub) {
                var filePathBase64 = new Buffer(pub).toString("base64");
                html += "<p><strong>"
                    + (UrlUtils_1.isHTTP(pub) ? pub : path.basename(pub))
                    + "</strong><br> => <a href='./pub/" + UrlUtils_1.encodeURIComponent_RFC3986(filePathBase64)
                    + "'>" + "./pub/" + filePathBase64 + "</a></p>";
            });
            html += "<h1>Custom publication URL</h1><p><a href='./url'>CLICK HERE</a></p>";
            html += "<h1>OPDS feed</h1><p><a href='./opds'>CLICK HERE</a></p>";
            html += "<h1>Server version</h1><p><a href='./version/show'>CLICK HERE</a></p>";
            html += "</body></html>";
            res.status(200).send(html);
        });
        this.expressApp.get(["/version", "/version/show/:jsonPath?"], function (req, res) {
            var isShow = req.url.indexOf("/show") >= 0 || req.query.show;
            if (!req.params.jsonPath && req.query.show) {
                req.params.jsonPath = req.query.show;
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
                _this.setResponseCORS(res);
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
        server_url_1.serverUrl(this, this.expressApp);
        server_opds_1.serverOPDS(this, this.expressApp);
        server_opds2_1.serverOPDS2(this, this.expressApp);
        var routerPathBase64 = server_pub_1.serverPub(this, this.expressApp);
        server_manifestjson_1.serverManifestJson(this, routerPathBase64);
        server_mediaoverlays_1.serverMediaOverlays(this, routerPathBase64);
        server_assets_1.serverAssets(this, routerPathBase64);
    }
    Server.prototype.start = function (port) {
        if (this.started) {
            return this.url();
        }
        var p = port || process.env.PORT || 3000;
        debug("PORT: " + p + " || " + process.env.PORT + " || 3000 => " + p);
        this.httpServer = this.expressApp.listen(p, function () {
            debug("http://localhost:" + p);
        });
        this.started = true;
        return "http://127.0.0.1:" + p;
    };
    Server.prototype.stop = function () {
        if (this.started) {
            this.httpServer.close();
            this.started = false;
            this.uncachePublications();
        }
    };
    Server.prototype.url = function () {
        return this.started ?
            "http://127.0.0.1:" + this.httpServer.address().port :
            undefined;
    };
    Server.prototype.setResponseCORS = function (res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Ranges, Link, Transfer-Encoding");
    };
    Server.prototype.addPublications = function (pubs) {
        var _this = this;
        pubs.forEach(function (pub) {
            if (_this.publications.indexOf(pub) < 0) {
                _this.publicationsOPDSfeedNeedsUpdate = true;
                _this.publications.push(pub);
            }
        });
        return pubs.map(function (pub) {
            var pubid = new Buffer(pub).toString("base64");
            return "/pub/" + pubid + "/manifest.json";
        });
    };
    Server.prototype.removePublications = function (pubs) {
        var _this = this;
        pubs.forEach(function (pub) {
            _this.uncachePublication(pub);
            var i = _this.publications.indexOf(pub);
            if (i >= 0) {
                _this.publicationsOPDSfeedNeedsUpdate = true;
                _this.publications.splice(i, 1);
            }
        });
        return pubs.map(function (pub) {
            var pubid = new Buffer(pub).toString("base64");
            return "/pub/" + pubid + "/manifest.json";
        });
    };
    Server.prototype.getPublications = function () {
        return this.publications;
    };
    Server.prototype.isPublicationCached = function (filePath) {
        return typeof this.cachedPublication(filePath) !== "undefined";
    };
    Server.prototype.cachedPublication = function (filePath) {
        return this.pathPublicationMap[filePath];
    };
    Server.prototype.cachePublication = function (filePath, pub) {
        if (!this.isPublicationCached(filePath)) {
            this.pathPublicationMap[filePath] = pub;
        }
    };
    Server.prototype.uncachePublication = function (filePath) {
        if (this.isPublicationCached(filePath)) {
            var pub = this.cachedPublication(filePath);
            if (pub) {
                pub.freeDestroy();
            }
            this.pathPublicationMap[filePath] = undefined;
            delete this.pathPublicationMap[filePath];
        }
    };
    Server.prototype.uncachePublications = function () {
        var _this = this;
        Object.keys(this.pathPublicationMap).forEach(function (filePath) {
            _this.uncachePublication(filePath);
        });
    };
    Server.prototype.publicationsOPDS = function () {
        if (this.publicationsOPDSfeedNeedsUpdate) {
            this.publicationsOPDSfeed = undefined;
            if (fs.existsSync(this.opdsJsonFilePath)) {
                fs.unlinkSync(this.opdsJsonFilePath);
            }
        }
        if (this.publicationsOPDSfeed) {
            return this.publicationsOPDSfeed;
        }
        debug("OPDS2.json => " + this.opdsJsonFilePath);
        if (!fs.existsSync(this.opdsJsonFilePath)) {
            if (!this.creatingPublicationsOPDS) {
                this.creatingPublicationsOPDS = true;
                this.publicationsOPDSfeedNeedsUpdate = false;
                var jsFile = path.join(__dirname, "opds2-create-cli.js");
                var args_1 = [jsFile, this.opdsJsonFilePath];
                this.publications.forEach(function (pub) {
                    var filePathBase64 = new Buffer(pub).toString("base64");
                    args_1.push(filePathBase64);
                });
                debug("SPAWN OPDS2-create: " + args_1[0]);
                var child = child_process.spawn("node", args_1, {
                    cwd: process.cwd(),
                    env: process.env,
                });
                child.stdout.on("data", function (data) {
                    console.log(data.toString());
                });
                child.stderr.on("data", function (data) {
                    console.log(data.toString());
                });
            }
            return undefined;
        }
        this.creatingPublicationsOPDS = false;
        var jsonStr = fs.readFileSync(this.opdsJsonFilePath, "utf8");
        if (!jsonStr) {
            return undefined;
        }
        var json = global.JSON.parse(jsonStr);
        this.publicationsOPDSfeed = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
        return this.publicationsOPDSfeed;
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map