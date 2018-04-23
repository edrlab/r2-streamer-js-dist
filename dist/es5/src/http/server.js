"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var child_process = require("child_process");
var crypto = require("crypto");
var fs = require("fs");
var http = require("http");
var https = require("https");
var path = require("path");
var opds2_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2");
var publication_parser_1 = require("r2-shared-js/dist/es5/src/parser/publication-parser");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var css2json = require("css2json");
var debug_ = require("debug");
var express = require("express");
var jsonMarkup = require("json-markup");
var ta_json_1 = require("ta-json");
var tmp_1 = require("tmp");
var self_signed_1 = require("../utils/self-signed");
var request_ext_1 = require("./request-ext");
var server_assets_1 = require("./server-assets");
var server_manifestjson_1 = require("./server-manifestjson");
var server_mediaoverlays_1 = require("./server-mediaoverlays");
var server_opds_1 = require("./server-opds");
var server_opds1_2_1 = require("./server-opds1-2");
var server_opds2_1 = require("./server-opds2");
var server_pub_1 = require("./server-pub");
var server_url_1 = require("./server-url");
var debug = debug_("r2:streamer#http/server");
var debugHttps = debug_("r2:https");
var IS_DEV = (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev");
var jsonStyle = "\n.json-markup {\n    line-height: 17px;\n    font-size: 13px;\n    font-family: monospace;\n    white-space: pre;\n}\n.json-markup-key {\n    font-weight: bold;\n}\n.json-markup-bool {\n    color: firebrick;\n}\n.json-markup-string {\n    color: green;\n}\n.json-markup-null {\n    color: gray;\n}\n.json-markup-number {\n    color: blue;\n}\n";
var Server = (function () {
    function Server(options) {
        var _this = this;
        this.lcpBeginToken = "*-";
        this.lcpEndToken = "-*";
        this.disableReaders = options && options.disableReaders ? options.disableReaders : false;
        this.disableDecryption = options && options.disableDecryption ? options.disableDecryption : false;
        this.disableRemotePubUrl = options && options.disableRemotePubUrl ? options.disableRemotePubUrl : false;
        this.disableOPDS = options && options.disableOPDS ? options.disableOPDS : false;
        this.publications = [];
        this.pathPublicationMap = {};
        this.publicationsOPDSfeed = undefined;
        this.publicationsOPDSfeedNeedsUpdate = true;
        this.creatingPublicationsOPDS = false;
        this.opdsJsonFilePath = tmp_1.tmpNameSync({ prefix: "readium2-OPDS2-", postfix: ".json" });
        this.expressApp = express();
        this.expressApp.use(function (req, res, next) {
            if (!_this.isSecured()) {
                next();
                return;
            }
            var doFail = true;
            if (_this.serverData && _this.serverData.trustKey &&
                _this.serverData.trustCheck && _this.serverData.trustCheckIV) {
                var t1 = void 0;
                if (IS_DEV) {
                    t1 = process.hrtime();
                }
                var delta = 0;
                var urlCheck = _this.serverUrl() + req.url;
                var base64Val = req.get("X-" + _this.serverData.trustCheck);
                if (base64Val) {
                    var decodedVal = new Buffer(base64Val, "base64");
                    var encrypted = decodedVal;
                    var decrypteds = [];
                    var decryptStream = crypto.createDecipheriv("aes-256-cbc", _this.serverData.trustKey, _this.serverData.trustCheckIV);
                    decryptStream.setAutoPadding(false);
                    var buff1 = decryptStream.update(encrypted);
                    if (buff1) {
                        decrypteds.push(buff1);
                    }
                    var buff2 = decryptStream.final();
                    if (buff2) {
                        decrypteds.push(buff2);
                    }
                    var decrypted = Buffer.concat(decrypteds);
                    var nPaddingBytes = decrypted[decrypted.length - 1];
                    var size = encrypted.length - nPaddingBytes;
                    var decryptedStr = decrypted.slice(0, size).toString("utf8");
                    try {
                        var decryptedJson = JSON.parse(decryptedStr);
                        var url = decryptedJson.url;
                        var time = decryptedJson.time;
                        var now = Date.now();
                        delta = now - time;
                        if (delta <= 3000) {
                            var i = url.lastIndexOf("#");
                            if (i > 0) {
                                url = url.substr(0, i);
                            }
                            if (url === urlCheck) {
                                doFail = false;
                            }
                        }
                    }
                    catch (err) {
                        debug(err);
                        debug(decryptedStr);
                    }
                }
                if (IS_DEV) {
                    var t2 = process.hrtime(t1);
                    var seconds = t2[0];
                    var nanoseconds = t2[1];
                    var milliseconds = nanoseconds / 1e6;
                    debugHttps("< B > (" + delta + "ms) " + seconds + "s " + milliseconds + "ms [ " + urlCheck + " ]");
                }
            }
            if (doFail) {
                debug("############## X-Debug- FAIL ========================== ");
                debug(req.url);
                res.status(200);
                res.end();
                return;
            }
            next();
        });
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
            if (!_this.disableOPDS) {
                html += "<h1>OPDS2 feed</h1><p><a href='./opds2'>CLICK HERE</a></p>";
            }
            if (!_this.disableRemotePubUrl) {
                html += "<h1>Load HTTP publication URL</h1><p><a href='./url'>CLICK HERE</a></p>";
            }
            if (!_this.disableOPDS) {
                html += "<h1>Browse HTTP OPDS1 feed</h1><p><a href='./opds'>CLICK HERE</a></p>";
                html += "<h1>Convert OPDS feed v1 to v2</h1><p><a href='./opds12'>CLICK HERE</a></p>";
            }
            html += "<h1>Server version</h1><p><a href='./version/show'>CLICK HERE</a></p>";
            html += "</body></html>";
            res.status(200).send(html);
        });
        this.expressApp.get(["/" + request_ext_1._version, "/" + request_ext_1._version + "/" + request_ext_1._show + "/:" + request_ext_1._jsonPath + "?"], function (req, res) {
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
        if (!this.disableRemotePubUrl) {
            server_url_1.serverUrl(this, this.expressApp);
        }
        if (!this.disableOPDS) {
            server_opds_1.serverOPDS(this, this.expressApp);
            server_opds2_1.serverOPDS2(this, this.expressApp);
            server_opds1_2_1.serverOPDS12(this, this.expressApp);
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
    Server.prototype.start = function (port, secure) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var envPort, p;
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
                            var _this = this;
                            var certData, err_1;
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
                                            _this.serverData = tslib_1.__assign({}, certData, { urlHost: "127.0.0.1", urlPort: p, urlScheme: "https" });
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
                    var filePathBase64 = new Buffer(pub).toString("base64");
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
        this.publicationsOPDSfeed = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
        return this.publicationsOPDSfeed;
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map