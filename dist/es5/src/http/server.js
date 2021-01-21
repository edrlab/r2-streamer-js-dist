"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.MAX_PREFETCH_LINKS = void 0;
var tslib_1 = require("tslib");
var child_process = require("child_process");
var debug_ = require("debug");
var express = require("express");
var fs = require("fs");
var http = require("http");
var https = require("https");
var path = require("path");
var tmp_1 = require("tmp");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var opds2_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2");
var publication_parser_1 = require("r2-shared-js/dist/es5/src/parser/publication-parser");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var self_signed_1 = require("../utils/self-signed");
var server_assets_1 = require("./server-assets");
var server_lcp_lsd_show_1 = require("./server-lcp-lsd-show");
var server_manifestjson_1 = require("./server-manifestjson");
var server_mediaoverlays_1 = require("./server-mediaoverlays");
var server_opds_browse_v1_1 = require("./server-opds-browse-v1");
var server_opds_browse_v2_1 = require("./server-opds-browse-v2");
var server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
var server_opds_local_feed_1 = require("./server-opds-local-feed");
var server_pub_1 = require("./server-pub");
var server_root_1 = require("./server-root");
var server_secure_1 = require("./server-secure");
var server_url_1 = require("./server-url");
var server_version_1 = require("./server-version");
var debug = debug_("r2:streamer#http/server");
exports.MAX_PREFETCH_LINKS = 10;
var Server = (function () {
    function Server(options) {
        this.lcpBeginToken = "*-";
        this.lcpEndToken = "-*";
        this.disableReaders = options && options.disableReaders ? options.disableReaders : false;
        this.disableDecryption = options && options.disableDecryption ? options.disableDecryption : false;
        this.disableRemotePubUrl = options && options.disableRemotePubUrl ? options.disableRemotePubUrl : false;
        this.disableOPDS = options && options.disableOPDS ? options.disableOPDS : false;
        this.maxPrefetchLinks = options && options.maxPrefetchLinks ? options.maxPrefetchLinks : exports.MAX_PREFETCH_LINKS;
        this.publications = [];
        this.pathPublicationMap = {};
        this.publicationsOPDSfeed = undefined;
        this.publicationsOPDSfeedNeedsUpdate = true;
        this.creatingPublicationsOPDS = false;
        this.opdsJsonFilePath = tmp_1.tmpNameSync({ prefix: "readium2-OPDS2-", postfix: ".json" });
        this.expressApp = express();
        server_secure_1.serverSecure(this, this.expressApp);
        var staticOptions = {
            etag: false,
        };
        if (!this.disableReaders) {
            this.expressApp.use("/readerNYPL", express.static("misc/readers/reader-NYPL", staticOptions));
            this.expressApp.use("/readerHADRIEN", express.static("misc/readers/reader-HADRIEN", staticOptions));
        }
        server_root_1.serverRoot(this, this.expressApp);
        server_version_1.serverVersion(this, this.expressApp);
        if (!this.disableRemotePubUrl) {
            server_url_1.serverRemotePub(this, this.expressApp);
            server_lcp_lsd_show_1.serverLCPLSD_show(this, this.expressApp);
        }
        if (!this.disableOPDS) {
            server_opds_browse_v1_1.serverOPDS_browse_v1(this, this.expressApp);
            server_opds_browse_v2_1.serverOPDS_browse_v2(this, this.expressApp);
            server_opds_local_feed_1.serverOPDS_local_feed(this, this.expressApp);
            server_opds_convert_v1_to_v2_1.serverOPDS_convert_v1_to_v2(this, this.expressApp);
        }
        var routerPathBase64 = server_pub_1.serverPub(this, this.expressApp);
        server_manifestjson_1.serverManifestJson(this, routerPathBase64);
        server_mediaoverlays_1.serverMediaOverlays(this, routerPathBase64);
        server_assets_1.serverAssets(this, routerPathBase64);
    }
    Server.prototype.preventRobots = function () {
        this.expressApp.get("/robots.txt", function (_req, res) {
            var robotsTxt = "User-agent: *\nDisallow: /\n";
            res.header("Content-Type", "text/plain");
            res.status(200).send(robotsTxt);
        });
    };
    Server.prototype.expressUse = function (pathf, func) {
        this.expressApp.use(pathf, func);
    };
    Server.prototype.expressGet = function (paths, func) {
        this.expressApp.get(paths, func);
    };
    Server.prototype.isStarted = function () {
        return (typeof this.serverInfo() !== "undefined") &&
            (typeof this.httpServer !== "undefined") ||
            (typeof this.httpsServer !== "undefined");
    };
    Server.prototype.isSecured = function () {
        return (typeof this.serverInfo() !== "undefined") &&
            (typeof this.httpsServer !== "undefined");
    };
    Server.prototype.getSecureHTTPHeader = function (url) {
        return server_secure_1.serverSecureHTTPHeader(this, url);
    };
    Server.prototype.start = function (port, secure) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var envPort, p;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (this.isStarted()) {
                    return [2, Promise.resolve(this.serverInfo())];
                }
                envPort = 0;
                try {
                    envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 0;
                }
                catch (err) {
                    debug(err);
                    envPort = 0;
                }
                p = port || envPort || 3000;
                debug("PORT: " + port + " || " + envPort + " || 3000 => " + p);
                if (secure) {
                    this.httpServer = undefined;
                    return [2, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var certData, err_1;
                            var _this = this;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4, self_signed_1.generateSelfSignedData()];
                                    case 1:
                                        certData = _a.sent();
                                        return [3, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        debug(err_1);
                                        reject("err");
                                        return [2];
                                    case 3:
                                        this.httpsServer = https.createServer({ key: certData.private, cert: certData.cert }, this.expressApp).listen(p, function () {
                                            _this.serverData = tslib_1.__assign(tslib_1.__assign({}, certData), { urlHost: "127.0.0.1", urlPort: p, urlScheme: "https" });
                                            resolve(_this.serverData);
                                        });
                                        return [2];
                                }
                            });
                        }); })];
                }
                else {
                    this.httpsServer = undefined;
                    return [2, new Promise(function (resolve, _reject) {
                            _this.httpServer = http.createServer(_this.expressApp).listen(p, function () {
                                _this.serverData = {
                                    urlHost: "127.0.0.1",
                                    urlPort: p,
                                    urlScheme: "http",
                                };
                                resolve(_this.serverData);
                            });
                        })];
                }
                return [2];
            });
        });
    };
    Server.prototype.stop = function () {
        if (this.isStarted()) {
            if (this.httpServer) {
                this.httpServer.close();
                this.httpServer = undefined;
            }
            if (this.httpsServer) {
                this.httpsServer.close();
                this.httpsServer = undefined;
            }
            this.serverData = undefined;
            this.uncachePublications();
        }
    };
    Server.prototype.serverInfo = function () {
        return this.serverData;
    };
    Server.prototype.serverUrl = function () {
        if (!this.isStarted()) {
            return undefined;
        }
        var info = this.serverInfo();
        if (!info) {
            return undefined;
        }
        if (info.urlPort === 443 || info.urlPort === 80) {
            return info.urlScheme + "://" + info.urlHost;
        }
        return info.urlScheme + "://" + info.urlHost + ":" + info.urlPort;
    };
    Server.prototype.setResponseCacheHeaders = function (res, enableCaching) {
        if (enableCaching) {
            res.setHeader("Cache-Control", "public,max-age=86400");
        }
        else {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
        }
    };
    Server.prototype.setResponseCORS = function (res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Ranges, Content-Range, Range, Link, Transfer-Encoding, X-Requested-With, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, Keep-Alive, If-Modified-Since");
        res.setHeader("Access-Control-Expose-Headers", "Content-Type, Content-Length, Accept-Ranges, Content-Range, Range, Link, Transfer-Encoding, X-Requested-With, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, Keep-Alive, If-Modified-Since");
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
            var pubid = UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(pub).toString("base64"));
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
            var pubid = UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(pub).toString("base64"));
            return "/pub/" + pubid + "/manifest.json";
        });
    };
    Server.prototype.getPublications = function () {
        return this.publications;
    };
    Server.prototype.loadOrGetCachedPublication = function (filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var publication, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        publication = this.cachedPublication(filePath);
                        if (!!publication) return [3, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, publication_parser_1.PublicationParsePromise(filePath)];
                    case 2:
                        publication = _a.sent();
                        return [3, 4];
                    case 3:
                        err_2 = _a.sent();
                        debug(err_2);
                        return [2, Promise.reject(err_2)];
                    case 4:
                        this.cachePublication(filePath, publication);
                        _a.label = 5;
                    case 5: return [2, publication];
                }
            });
        });
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
                    var filePathBase64 = UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(pub).toString("base64"));
                    args_1.push(filePathBase64);
                });
                debug("SPAWN OPDS2-create: " + args_1[0]);
                var child = child_process.spawn("node", args_1, {
                    cwd: process.cwd(),
                    env: process.env,
                });
                child.stdout.on("data", function (data) {
                    debug(data.toString());
                });
                child.stderr.on("data", function (data) {
                    debug(data.toString());
                });
            }
            return undefined;
        }
        this.creatingPublicationsOPDS = false;
        var jsonStr = fs.readFileSync(this.opdsJsonFilePath, { encoding: "utf8" });
        if (!jsonStr) {
            return undefined;
        }
        var json = global.JSON.parse(jsonStr);
        this.publicationsOPDSfeed = serializable_1.TaJsonDeserialize(json, opds2_1.OPDSFeed);
        return this.publicationsOPDSfeed;
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map