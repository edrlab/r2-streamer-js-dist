"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lcp");
const init_globals_1 = require("r2-opds-js/dist/es7-es2016/src/opds/init-globals");
const init_globals_2 = require("r2-shared-js/dist/es7-es2016/src/init-globals");
const debug_ = require("debug");
const filehound = require("filehound");
const server_1 = require("./server");
init_globals_1.initGlobalConverters_OPDS();
init_globals_2.initGlobalConverters_SHARED();
init_globals_2.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
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
const isEPUB = fs.existsSync(path.join(filePath, "META-INF", "container.xml"));
if (stats.isDirectory() && !isEPUB) {
    debug("Analysing directory...");
    (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const files = yield filehound.create()
            .discard("node_modules")
            .depth(5)
            .paths(filePath)
            .ext([".epub", ".epub3", ".cbz"])
            .find();
        const server = new server_1.Server();
        server.preventRobots();
        server.addPublications(files);
        const url = yield server.start(0, false);
        debug(url);
    }))();
}
else {
    (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const server = new server_1.Server();
        server.preventRobots();
        server.addPublications([filePath]);
        const url = yield server.start(0, false);
        debug(url);
    }))();
}
//# sourceMappingURL=server-cli.js.map