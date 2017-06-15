"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const opds2_1 = require("../models/opds2/opds2");
const UrlUtils_1 = require("../_utils/http/UrlUtils");
const debug_ = require("debug");
const express = require("express");
const ta_json_1 = require("ta-json");
const tmp_1 = require("tmp");
const server_assets_1 = require("./server-assets");
const server_manifestjson_1 = require("./server-manifestjson");
const server_mediaoverlays_1 = require("./server-mediaoverlays");
const server_opds_1 = require("./server-opds");
const server_opds2_1 = require("./server-opds2");
const server_pub_1 = require("./server-pub");
const server_url_1 = require("./server-url");
const debug = debug_("r2:server:main");
class Server {
    constructor() {
        this.lcpBeginToken = "*-";
        this.lcpEndToken = "-*";
        this.publications = [];
        this.pathPublicationMap = {};
        this.publicationsOPDSfeed = undefined;
        this.creatingPublicationsOPDS = false;
        this.opdsJsonFilePath = tmp_1.tmpNameSync({ prefix: "readium2-OPDS2-", postfix: ".json" });
        this.expressApp = express();
        const staticOptions = {
            etag: false,
        };
        this.expressApp.use("/readerNYPL", express.static("misc/readers/reader-NYPL", staticOptions));
        this.expressApp.use("/readerHADRIEN", express.static("misc/readers/reader-HADRIEN", staticOptions));
        this.expressApp.get("/", (_req, res) => {
            let html = "<html><body><h1>Publications</h1>";
            this.publications.forEach((pub) => {
                const filePathBase64 = new Buffer(pub).toString("base64");
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
        const routerPathBase64 = server_pub_1.serverPub(this, this.expressApp);
        server_manifestjson_1.serverManifestJson(this, routerPathBase64);
        server_mediaoverlays_1.serverMediaOverlays(this, routerPathBase64);
        server_assets_1.serverAssets(this, routerPathBase64);
    }
    start() {
        const port = process.env.PORT || 3000;
        debug(`PORT: ${process.env.PORT} => ${port}`);
        this.httpServer = this.expressApp.listen(port, () => {
            debug(`http://localhost:${port}`);
        });
        return `http://127.0.0.1:${port}`;
    }
    stop() {
        this.httpServer.close();
    }
    setResponseCORS(res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Ranges, Link, Transfer-Encoding");
    }
    addPublications(pubs) {
        pubs.forEach((pub) => {
            if (this.publications.indexOf(pub) < 0) {
                this.publications.push(pub);
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
    publicationsOPDS() {
        if (this.publicationsOPDSfeed) {
            return this.publicationsOPDSfeed;
        }
        debug(`OPDS2.json => ${this.opdsJsonFilePath}`);
        if (!fs.existsSync(this.opdsJsonFilePath)) {
            if (!this.creatingPublicationsOPDS) {
                this.creatingPublicationsOPDS = true;
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
                    console.log(data.toString());
                });
                child.stderr.on("data", (data) => {
                    console.log(data.toString());
                });
            }
            return undefined;
        }
        const jsonStr = fs.readFileSync(this.opdsJsonFilePath, "utf8");
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