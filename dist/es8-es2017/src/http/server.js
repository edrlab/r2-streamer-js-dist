"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const opds2_1 = require("../models/opds2/opds2");
const UrlUtils_1 = require("../_utils/http/UrlUtils");
const css2json = require("css2json");
const debug_ = require("debug");
const express = require("express");
const jsonMarkup = require("json-markup");
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
            html += "<h1>Server version</h1><p><a href='./version/show'>CLICK HERE</a></p>";
            html += "</body></html>";
            res.status(200).send(html);
        });
        this.expressApp.get(["/version", "/version/show/:jsonPath?"], (req, res) => {
            const isShow = req.url.indexOf("/show") >= 0 || req.query.show;
            if (!req.params.jsonPath && req.query.show) {
                req.params.jsonPath = req.query.show;
            }
            const jsonObj = require("../../../gitrev.json");
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
        const routerPathBase64 = server_pub_1.serverPub(this, this.expressApp);
        server_manifestjson_1.serverManifestJson(this, routerPathBase64);
        server_mediaoverlays_1.serverMediaOverlays(this, routerPathBase64);
        server_assets_1.serverAssets(this, routerPathBase64);
    }
    start(port) {
        const p = port || process.env.PORT || 3000;
        debug(`PORT: ${p} || ${process.env.PORT} || 3000 => ${p}`);
        this.httpServer = this.expressApp.listen(p, () => {
            debug(`http://localhost:${p}`);
        });
        return `http://127.0.0.1:${p}`;
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