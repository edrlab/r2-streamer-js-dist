"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const opds2_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
const ta_json_1 = require("ta-json");
const tmp_1 = require("tmp");
const publication_parser_1 = require("r2-shared-js/dist/es8-es2017/src/parser/publication-parser");
const self_signed_1 = require("../utils/self-signed");
const server_assets_1 = require("./server-assets");
const server_manifestjson_1 = require("./server-manifestjson");
const server_mediaoverlays_1 = require("./server-mediaoverlays");
const server_opds_1 = require("./server-opds");
const server_opds1_2_1 = require("./server-opds1-2");
const server_opds2_1 = require("./server-opds2");
const server_pub_1 = require("./server-pub");
const server_url_1 = require("./server-url");
const debug = debug_("r2:streamer#http/server");
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
        this.disableRemotePubUrl = options && options.disableRemotePubUrl ? options.disableRemotePubUrl : false;
        this.disableOPDS = options && options.disableOPDS ? options.disableOPDS : false;
        this.publications = [];
        this.pathPublicationMap = {};
        this.publicationsOPDSfeed = undefined;
        this.publicationsOPDSfeedNeedsUpdate = true;
        this.creatingPublicationsOPDS = false;
        this.opdsJsonFilePath = tmp_1.tmpNameSync({ prefix: "readium2-OPDS2-", postfix: ".json" });
        this.expressApp = express();
        this.expressApp.use((req, res, next) => {
            if (!this.isSecured()) {
                next();
                return;
            }
            let doFail = true;
            if (this.serverData && this.serverData.trustKey &&
                this.serverData.trustCheck && this.serverData.trustCheckIV) {
                const base64Val = req.get("X-" + this.serverData.trustCheck);
                if (base64Val) {
                    const decodedVal = new Buffer(base64Val, "base64");
                    const encrypted = decodedVal;
                    const decrypteds = [];
                    const decryptStream = crypto.createDecipheriv("aes-256-cbc", this.serverData.trustKey, this.serverData.trustCheckIV);
                    decryptStream.setAutoPadding(false);
                    const buff1 = decryptStream.update(encrypted);
                    if (buff1) {
                        decrypteds.push(buff1);
                    }
                    const buff2 = decryptStream.final();
                    if (buff2) {
                        decrypteds.push(buff2);
                    }
                    const decrypted = Buffer.concat(decrypteds);
                    const nPaddingBytes = decrypted[decrypted.length - 1];
                    const size = encrypted.length - nPaddingBytes;
                    let decryptedStr = decrypted.slice(0, size).toString("utf8");
                    debug(decryptedStr);
                    const i = decryptedStr.lastIndexOf("#");
                    if (i > 0) {
                        decryptedStr = decryptedStr.substr(0, i);
                    }
                    if (decryptedStr === (this.serverUrl() + req.url)) {
                        doFail = false;
                    }
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
            if (!this.disableOPDS) {
                html += "<h1>OPDS2 feed</h1><p><a href='./opds2'>CLICK HERE</a></p>";
            }
            if (!this.disableRemotePubUrl) {
                html += "<h1>Load HTTP publication URL</h1><p><a href='./url'>CLICK HERE</a></p>";
            }
            if (!this.disableOPDS) {
                html += "<h1>Browse HTTP OPDS1 feed</h1><p><a href='./opds'>CLICK HERE</a></p>";
                html += "<h1>Convert OPDS feed v1 to v2</h1><p><a href='./opds12'>CLICK HERE</a></p>";
            }
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
        if (!this.disableRemotePubUrl) {
            server_url_1.serverUrl(this, this.expressApp);
        }
        if (!this.disableOPDS) {
            server_opds_1.serverOPDS(this, this.expressApp);
            server_opds2_1.serverOPDS2(this, this.expressApp);
            server_opds1_2_1.serverOPDS12(this, this.expressApp);
        }
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
    isStarted() {
        return (typeof this.serverInfo() !== "undefined") &&
            (typeof this.httpServer !== "undefined") ||
            (typeof this.httpsServer !== "undefined");
    }
    isSecured() {
        return (typeof this.serverInfo() !== "undefined") &&
            (typeof this.httpsServer !== "undefined");
    }
    async start(port, secure) {
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
            return new Promise(async (resolve, reject) => {
                let certData;
                try {
                    certData = await self_signed_1.generateSelfSignedData();
                }
                catch (err) {
                    debug(err);
                    reject("err");
                    return;
                }
                this.httpsServer = https.createServer({ key: certData.private, cert: certData.cert }, this.expressApp).listen(p, () => {
                    this.serverData = Object.assign({}, certData, { urlHost: "127.0.0.1", urlPort: p, urlScheme: "https" });
                    resolve(this.serverData);
                });
            });
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
    async loadOrGetCachedPublication(filePath) {
        let publication = this.cachedPublication(filePath);
        if (!publication) {
            try {
                publication = await publication_parser_1.PublicationParsePromise(filePath);
            }
            catch (err) {
                debug(err);
                return Promise.reject(err);
            }
            this.cachePublication(filePath, publication);
        }
        return publication;
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