"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.MAX_PREFETCH_LINKS = void 0;
const tslib_1 = require("tslib");
const child_process = require("child_process");
const debug_ = require("debug");
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const tmp_1 = require("tmp");
const serializable_1 = require("r2-lcp-js/dist/es6-es2015/src/serializable");
const opds2_1 = require("r2-opds-js/dist/es6-es2015/src/opds/opds2/opds2");
const publication_parser_1 = require("r2-shared-js/dist/es6-es2015/src/parser/publication-parser");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const self_signed_1 = require("../utils/self-signed");
const server_assets_1 = require("./server-assets");
const server_lcp_lsd_show_1 = require("./server-lcp-lsd-show");
const server_manifestjson_1 = require("./server-manifestjson");
const server_mediaoverlays_1 = require("./server-mediaoverlays");
const server_opds_browse_v1_1 = require("./server-opds-browse-v1");
const server_opds_browse_v2_1 = require("./server-opds-browse-v2");
const server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
const server_opds_local_feed_1 = require("./server-opds-local-feed");
const server_pub_1 = require("./server-pub");
const server_root_1 = require("./server-root");
const server_secure_1 = require("./server-secure");
const server_url_1 = require("./server-url");
const server_version_1 = require("./server-version");
const debug = debug_("r2:streamer#http/server");
exports.MAX_PREFETCH_LINKS = 10;
class Server {
    constructor(options) {
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
        const staticOptions = {
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
        const routerPathBase64 = server_pub_1.serverPub(this, this.expressApp);
        server_manifestjson_1.serverManifestJson(this, routerPathBase64);
        server_mediaoverlays_1.serverMediaOverlays(this, routerPathBase64);
        server_assets_1.serverAssets(this, routerPathBase64);
    }
    preventRobots() {
        this.expressApp.get("/robots.txt", (_req, res) => {
            const robotsTxt = `User-agent: *
Disallow: /
`;
            res.header("Content-Type", "text/plain");
            res.status(200).send(robotsTxt);
        });
    }
    expressUse(pathf, func) {
        this.expressApp.use(pathf, func);
    }
    expressGet(paths, func) {
        this.expressApp.get(paths, func);
    }
    isStarted() {
        return (typeof this.serverInfo() !== "undefined") &&
            (typeof this.httpServer !== "undefined") ||
            (typeof this.httpsServer !== "undefined");
    }
    isSecured() {
        return (typeof this.serverInfo() !== "undefined") &&
            (typeof this.httpsServer !== "undefined");
    }
    getSecureHTTPHeader(url) {
        return server_secure_1.serverSecureHTTPHeader(this, url);
    }
    start(port, secure) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.isStarted()) {
                return Promise.resolve(this.serverInfo());
            }
            let envPort = 0;
            try {
                envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 0;
            }
            catch (err) {
                debug(err);
                envPort = 0;
            }
            const p = port || envPort || 3000;
            debug(`PORT: ${port} || ${envPort} || 3000 => ${p}`);
            if (secure) {
                this.httpServer = undefined;
                return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    let certData;
                    try {
                        certData = yield self_signed_1.generateSelfSignedData();
                    }
                    catch (err) {
                        debug(err);
                        reject("err");
                        return;
                    }
                    this.httpsServer = https.createServer({ key: certData.private, cert: certData.cert }, this.expressApp).listen(p, () => {
                        this.serverData = Object.assign(Object.assign({}, certData), { urlHost: "127.0.0.1", urlPort: p, urlScheme: "https" });
                        resolve(this.serverData);
                    });
                }));
            }
            else {
                this.httpsServer = undefined;
                return new Promise((resolve, _reject) => {
                    this.httpServer = http.createServer(this.expressApp).listen(p, () => {
                        this.serverData = {
                            urlHost: "127.0.0.1",
                            urlPort: p,
                            urlScheme: "http",
                        };
                        resolve(this.serverData);
                    });
                });
            }
        });
    }
    stop() {
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
    }
    serverInfo() {
        return this.serverData;
    }
    serverUrl() {
        if (!this.isStarted()) {
            return undefined;
        }
        const info = this.serverInfo();
        if (!info) {
            return undefined;
        }
        if (info.urlPort === 443 || info.urlPort === 80) {
            return `${info.urlScheme}://${info.urlHost}`;
        }
        return `${info.urlScheme}://${info.urlHost}:${info.urlPort}`;
    }
    setResponseCacheHeaders(res, enableCaching) {
        if (enableCaching) {
            res.setHeader("Cache-Control", "public,max-age=86400");
        }
        else {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
        }
    }
    setResponseCORS(res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Ranges, Content-Range, Range, Link, Transfer-Encoding, X-Requested-With, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, Keep-Alive, If-Modified-Since");
        res.setHeader("Access-Control-Expose-Headers", "Content-Type, Content-Length, Accept-Ranges, Content-Range, Range, Link, Transfer-Encoding, X-Requested-With, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, Keep-Alive, If-Modified-Since");
    }
    addPublications(pubs) {
        pubs.forEach((pub) => {
            if (this.publications.indexOf(pub) < 0) {
                this.publicationsOPDSfeedNeedsUpdate = true;
                this.publications.push(pub);
            }
        });
        return pubs.map((pub) => {
            const pubid = UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(pub).toString("base64"));
            return `/pub/${pubid}/manifest.json`;
        });
    }
    removePublications(pubs) {
        pubs.forEach((pub) => {
            this.uncachePublication(pub);
            const i = this.publications.indexOf(pub);
            if (i >= 0) {
                this.publicationsOPDSfeedNeedsUpdate = true;
                this.publications.splice(i, 1);
            }
        });
        return pubs.map((pub) => {
            const pubid = UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(pub).toString("base64"));
            return `/pub/${pubid}/manifest.json`;
        });
    }
    getPublications() {
        return this.publications;
    }
    loadOrGetCachedPublication(filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let publication = this.cachedPublication(filePath);
            if (!publication) {
                try {
                    publication = yield publication_parser_1.PublicationParsePromise(filePath);
                }
                catch (err) {
                    debug(err);
                    return Promise.reject(err);
                }
                this.cachePublication(filePath, publication);
            }
            return publication;
        });
    }
    isPublicationCached(filePath) {
        return typeof this.cachedPublication(filePath) !== "undefined";
    }
    cachedPublication(filePath) {
        return this.pathPublicationMap[filePath];
    }
    cachePublication(filePath, pub) {
        if (!this.isPublicationCached(filePath)) {
            this.pathPublicationMap[filePath] = pub;
        }
    }
    uncachePublication(filePath) {
        if (this.isPublicationCached(filePath)) {
            const pub = this.cachedPublication(filePath);
            if (pub) {
                pub.freeDestroy();
            }
            this.pathPublicationMap[filePath] = undefined;
            delete this.pathPublicationMap[filePath];
        }
    }
    uncachePublications() {
        Object.keys(this.pathPublicationMap).forEach((filePath) => {
            this.uncachePublication(filePath);
        });
    }
    publicationsOPDS() {
        if (this.publicationsOPDSfeedNeedsUpdate) {
            this.publicationsOPDSfeed = undefined;
            if (fs.existsSync(this.opdsJsonFilePath)) {
                fs.unlinkSync(this.opdsJsonFilePath);
            }
        }
        if (this.publicationsOPDSfeed) {
            return this.publicationsOPDSfeed;
        }
        debug(`OPDS2.json => ${this.opdsJsonFilePath}`);
        if (!fs.existsSync(this.opdsJsonFilePath)) {
            if (!this.creatingPublicationsOPDS) {
                this.creatingPublicationsOPDS = true;
                this.publicationsOPDSfeedNeedsUpdate = false;
                const jsFile = path.join(__dirname, "opds2-create-cli.js");
                const args = [jsFile, this.opdsJsonFilePath];
                this.publications.forEach((pub) => {
                    const filePathBase64 = UrlUtils_1.encodeURIComponent_RFC3986(Buffer.from(pub).toString("base64"));
                    args.push(filePathBase64);
                });
                debug(`SPAWN OPDS2-create: ${args[0]}`);
                const child = child_process.spawn("node", args, {
                    cwd: process.cwd(),
                    env: process.env,
                });
                child.stdout.on("data", (data) => {
                    debug(data.toString());
                });
                child.stderr.on("data", (data) => {
                    debug(data.toString());
                });
            }
            return undefined;
        }
        this.creatingPublicationsOPDS = false;
        const jsonStr = fs.readFileSync(this.opdsJsonFilePath, { encoding: "utf8" });
        if (!jsonStr) {
            return undefined;
        }
        const json = global.JSON.parse(jsonStr);
        this.publicationsOPDSfeed = serializable_1.TaJsonDeserialize(json, opds2_1.OPDSFeed);
        return this.publicationsOPDSfeed;
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map