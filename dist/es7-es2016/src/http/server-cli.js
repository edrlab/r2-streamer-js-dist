"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const debug_ = require("debug");
const filehound = require("filehound");
const init_globals_1 = require("../init-globals");
const server_1 = require("./server");
init_globals_1.initGlobals();
const debug = debug_("r2:server:cli");
debug(`process.cwd(): ${process.cwd()}`);
debug(`__dirname: ${__dirname}`);
const args = process.argv.slice(2);
debug("process.argv.slice(2): %o", args);
let filePath = args[0];
if (!filePath) {
    debug("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
filePath = filePath.trim();
debug(`path: ${filePath}`);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, filePath);
    debug(`path: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), filePath);
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
    (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const files = yield filehound.create()
            .discard("node_modules")
            .depth(5)
            .paths(filePath)
            .ext([".epub", ".epub3", ".cbz"])
            .find();
        const server = new server_1.Server();
        server.addPublications(files);
        server.start(0);
    }))();
}
else {
    const server = new server_1.Server();
    server.addPublications([filePath]);
    server.start(0);
}
//# sourceMappingURL=server-cli.js.map