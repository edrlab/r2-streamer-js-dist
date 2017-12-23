"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const opds2_1 = require("r2-opds-js/dist/es7-es2016/src/opds/opds2/opds2");
const UrlUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/http/UrlUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const ta_json_1 = require("ta-json");
const tmp_1 = require("tmp");
const publication_parser_1 = require("r2-shared-js/dist/es7-es2016/src/parser/publication-parser");
const server_assets_1 = require("./server-assets");
const server_manifestjson_1 = require("./server-manifestjson");
const server_mediaoverlays_1 = require("./server-mediaoverlays");
const server_opds_1 = require("./server-opds");
const server_opds1_2_1 = require("./server-opds1-2");
const server_opds2_1 = require("./server-opds2");
const server_pub_1 = require("./server-pub");
const server_url_1 = require("./server-url");
const debug = debug_("r2:server:main");
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
class Server {
    constructor(options) {
        this.lcpBeginToken = "*-";
        this.lcpEndToken = "-*";
        this.disableReaders = options && options.disableReaders ? options.disableReaders : false;
        this.disableDecryption = options && options.disableDecryption ? options.disableDecryption : false;
        this.publications = [];
        this.pathPublicationMap = {};
        this.publicationsOPDSfeed = undefined;
        this.publicationsOPDSfeedNeedsUpdate = true;
        this.creatingPublicationsOPDS = false;
        this.opdsJsonFilePath = tmp_1.tmpNameSync({ prefix: "readium2-OPDS2-", postfix: ".json" });
        this.started = false;
        this.expressApp = express();
        const staticOptions = {
            etag: false,
        };
        if (!this.disableReaders) {
            this.expressApp.use("/readerNYPL", express.static("misc/readers/reader-NYPL", staticOptions));
            this.expressApp.use("/readerHADRIEN", express.static("misc/readers/reader-HADRIEN", staticOptions));
        }
        this.expressApp.get("/", (_req, res) => {
            let html = "<html><body><h1>Publications</h1>";
            this.publications.forEach((pub) => {
                const filePathBase64 = new Buffer(pub).toString("base64");
                html += "<p><strong>"
                    + (UrlUtils_1.isHTTP(pub) ? pub : path.basename(pub))
                    + "</strong><br> => <a href='./pub/" + UrlUtils_1.encodeURIComponent_RFC3986(filePathBase64)
                    + "'>" + "./pub/" + filePathBase64 + "</a></p>";
            });
            html += "<h1>OPDS2 feed</h1><p><a href='./opds2'>CLICK HERE</a></p>";
            html += "<h1>Load HTTP publication URL</h1><p><a href='./url'>CLICK HERE</a></p>";
            html += "<h1>Browse HTTP OPDS1 feed</h1><p><a href='./opds'>CLICK HERE</a></p>";
            html += "<h1>Convert OPDS feed v1 to v2</h1><p><a href='./opds12'>CLICK HERE</a></p>";
            html += "<h1>Server version</h1><p><a href='./version/show'>CLICK HERE</a></p>";
            html += "</body></html>";
            res.status(200).send(html);
        });
        this.expressApp.get(["/version", "/version/show/:jsonPath?"], (req, res) => {
            const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
            if (!req.params.jsonPath && req.query.show) {
                req.params.jsonPath = req.query.show;
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
                this.setResponseCORS(res);
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
        server_url_1.serverUrl(this, this.expressApp);
        server_opds_1.serverOPDS(this, this.expressApp);
        server_opds2_1.serverOPDS2(this, this.expressApp);
        server_opds1_2_1.serverOPDS12(this, this.expressApp);
        const routerPathBase64 = server_pub_1.serverPub(this, this.expressApp);
        server_manifestjson_1.serverManifestJson(this, routerPathBase64);
        server_mediaoverlays_1.serverMediaOverlays(this, routerPathBase64);
        server_assets_1.serverAssets(this, routerPathBase64);
    }
    expressUse(pathf, func) {
        this.expressApp.use(pathf, func);
    }
    expressGet(paths, func) {
        this.expressApp.get(paths, func);
    }
    start(port) {
        if (this.started) {
            return this.url();
        }
        const p = port || process.env.PORT || 3000;
        debug(`PORT: ${p} || ${process.env.PORT} || 3000 => ${p}`);
        this.httpServer = this.expressApp.listen(p, () => {
            debug(`http://localhost:${p}`);
        });
        this.started = true;
        return `http://127.0.0.1:${p}`;
    }
    stop() {
        if (this.started) {
            this.httpServer.close();
            this.started = false;
            this.uncachePublications();
        }
    }
    url() {
        return this.started ?
            `http://127.0.0.1:${this.httpServer.address().port}` :
            undefined;
    }
    setResponseCORS(res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Ranges, Link, Transfer-Encoding");
    }
    addPublications(pubs) {
        pubs.forEach((pub) => {
            if (this.publications.indexOf(pub) < 0) {
                this.publicationsOPDSfeedNeedsUpdate = true;
                this.publications.push(pub);
            }
        });
        return pubs.map((pub) => {
            const pubid = new Buffer(pub).toString("base64");
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
            const pubid = new Buffer(pub).toString("base64");
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
                    const filePathBase64 = new Buffer(pub).toString("base64");
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
        this.publicationsOPDSfeed = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
        return this.publicationsOPDSfeed;
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map