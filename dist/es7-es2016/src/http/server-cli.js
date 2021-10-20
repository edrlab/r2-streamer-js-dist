"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_ = require("debug");
const fs = require("fs");
const path = require("path");
const lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lcp");
const init_globals_1 = require("r2-opds-js/dist/es7-es2016/src/opds/init-globals");
const init_globals_2 = require("r2-shared-js/dist/es7-es2016/src/init-globals");
const epub_1 = require("r2-shared-js/dist/es7-es2016/src/parser/epub");
const server_1 = require("./server");
(0, init_globals_1.initGlobalConverters_OPDS)();
(0, init_globals_2.initGlobalConverters_SHARED)();
(0, init_globals_2.initGlobalConverters_GENERIC)();
(0, lcp_1.setLcpNativePluginPath)(path.join(process.cwd(), "LCP", "lcp.node"));
const debug = debug_("r2:streamer#http/server-cli");
debug(`process.cwd(): ${process.cwd()}`);
debug(`__dirname: ${__dirname}`);
const args = process.argv.slice(2);
debug("process.argv.slice(2): %o", args);
if (!args[0]) {
    debug("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
const argPath = args[0].trim();
let filePath = argPath;
debug(`path: ${filePath}`);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, argPath);
    debug(`path: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), argPath);
        debug(`path: ${filePath}`);
        if (!fs.existsSync(filePath)) {
            debug("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}
filePath = fs.realpathSync(filePath);
debug(`path (normalized): ${filePath}`);
const stats = fs.lstatSync(filePath);
if (!stats.isFile() && !stats.isDirectory()) {
    debug("FILEPATH MUST BE FILE OR DIRECTORY.");
    process.exit(1);
}
let maxPrefetchLinks = server_1.MAX_PREFETCH_LINKS;
if (args[1]) {
    args[1] = args[1].trim();
    if (args[1].length && args[1][0] === "-") {
        maxPrefetchLinks = -1;
    }
    else {
        try {
            maxPrefetchLinks = parseInt(args[1], 10);
        }
        catch (err) {
            debug(err);
        }
        if (isNaN(maxPrefetchLinks)) {
            maxPrefetchLinks = server_1.MAX_PREFETCH_LINKS;
        }
    }
}
debug(`maxPrefetchLinks: ${maxPrefetchLinks}`);
const isAnEPUB = (0, epub_1.isEPUBlication)(filePath);
if (stats.isDirectory() && (isAnEPUB !== epub_1.EPUBis.LocalExploded)) {
    debug("Analysing directory...");
    (() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const files = fs.readdirSync(filePath, { withFileTypes: true }).
            filter((f) => f.isFile() && /\.(epub3?)|(cbz)|(audiobook)|(lcpaudiobook)|(lcpa)|(divina)|(lcpdivina)$/.test(f.name)).map((f) => path.join(filePath, f.name));
        const server = new server_1.Server({
            maxPrefetchLinks,
        });
        server.preventRobots();
        server.addPublications(files);
        const url = yield server.start(0, false);
        debug(url);
    }))();
}
else {
    (() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const server = new server_1.Server({
            maxPrefetchLinks,
        });
        server.preventRobots();
        server.addPublications([filePath]);
        const url = yield server.start(0, false);
        debug(url);
    }))();
}
//# sourceMappingURL=server-cli.js.map