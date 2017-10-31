"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const debug_ = require("debug");
const filehound = require("filehound");
const lcp_1 = require("../parser/epub/lcp");
const init_globals_1 = require("../init-globals");
const server_1 = require("./server");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
const debug = debug_("r2:server:cli");
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
if (stats.isDirectory()) {
    debug("Analysing directory...");
    (async () => {
        const files = await filehound.create()
            .discard("node_modules")
            .depth(5)
            .paths(filePath)
            .ext([".epub", ".epub3", ".cbz"])
            .find();
        const server = new server_1.Server();
        server.addPublications(files);
        server.start(0);
    })();
}
else {
    const server = new server_1.Server();
    server.addPublications([filePath]);
    server.start(0);
}
//# sourceMappingURL=server-cli.js.map