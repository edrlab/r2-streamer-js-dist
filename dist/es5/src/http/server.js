"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var opds2_1 = require("../models/opds2/opds2");
var UrlUtils_1 = require("../_utils/http/UrlUtils");
var debug_ = require("debug");
var express = require("express");
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
var Server = (function () {
    function Server() {
        var _this = this;
        this.lcpBeginToken = "*-";
        this.lcpEndToken = "-*";
        this.publications = [];
        this.pathPublicationMap = {};
        this.publicationsOPDSfeed = undefined;
        this.creatingPublicationsOPDS = false;
        this.opdsJsonFilePath = tmp_1.tmpNameSync({ prefix: "readium2-OPDS2-", postfix: ".json" });
        this.expressApp = express();
        var staticOptions = {
            etag: false,
        };
        this.expressApp.use("/readerNYPL", express.static("misc/readers/reader-NYPL", staticOptions));
        this.expressApp.use("/readerHADRIEN", express.static("misc/readers/reader-HADRIEN", staticOptions));
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
            html += "</body></html>";
            res.status(200).send(html);
        });
        server_url_1.serverUrl(this, this.expressApp);
        server_opds_1.serverOPDS(this, this.expressApp);
        server_opds2_1.serverOPDS2(this, this.expressApp);
        var routerPathBase64 = server_pub_1.serverPub(this, this.expressApp);
        server_manifestjson_1.serverManifestJson(this, routerPathBase64);
        server_mediaoverlays_1.serverMediaOverlays(this, routerPathBase64);
        server_assets_1.serverAssets(this, routerPathBase64);
    }
    Server.prototype.start = function () {
        var port = process.env.PORT || 3000;
        debug("PORT: " + process.env.PORT + " => " + port);
        this.httpServer = this.expressApp.listen(port, function () {
            debug("http://localhost:" + port);
        });
        return "http://127.0.0.1:" + port;
    };
    Server.prototype.stop = function () {
        this.httpServer.close();
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
                _this.publications.push(pub);
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
    Server.prototype.publicationsOPDS = function () {
        if (this.publicationsOPDSfeed) {
            return this.publicationsOPDSfeed;
        }
        debug("OPDS2.json => " + this.opdsJsonFilePath);
        if (!fs.existsSync(this.opdsJsonFilePath)) {
            if (!this.creatingPublicationsOPDS) {
                this.creatingPublicationsOPDS = true;
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