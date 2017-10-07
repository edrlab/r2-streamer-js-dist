"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
var debug_ = require("debug");
var filehound = require("filehound");
var init_globals_1 = require("../init-globals");
var server_1 = require("./server");
init_globals_1.initGlobals();
var debug = debug_("r2:server:cli");
debug("process.cwd(): " + process.cwd());
debug("__dirname: " + __dirname);
var args = process.argv.slice(2);
debug("process.argv.slice(2): %o", args);
var filePath = args[0];
if (!filePath) {
    debug("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
filePath = filePath.trim();
debug("path: " + filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, filePath);
    debug("path: " + filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), filePath);
        debug("path: " + filePath);
        if (!fs.existsSync(filePath)) {
            debug("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}
filePath = fs.realpathSync(filePath);
debug("path (normalized): " + filePath);
var stats = fs.lstatSync(filePath);
if (!stats.isFile() && !stats.isDirectory()) {
    debug("FILEPATH MUST BE FILE OR DIRECTORY.");
    process.exit(1);
}
if (stats.isDirectory()) {
    debug("Analysing directory...");
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var files, server;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, filehound.create()
                        .discard("node_modules")
                        .depth(5)
                        .paths(filePath)
                        .ext([".epub", ".epub3", ".cbz"])
                        .find()];
                case 1:
                    files = _a.sent();
                    server = new server_1.Server();
                    server.addPublications(files);
                    server.start(0);
                    return [2];
            }
        });
    }); })();
}
else {
    var server = new server_1.Server();
    server.addPublications([filePath]);
    server.start(0);
}
//# sourceMappingURL=server-cli.js.map