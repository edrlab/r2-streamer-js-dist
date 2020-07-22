"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debug_ = require("debug");
var filehound = require("filehound");
var fs = require("fs");
var path = require("path");
var lcp_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lcp");
var init_globals_1 = require("r2-opds-js/dist/es5/src/opds/init-globals");
var init_globals_2 = require("r2-shared-js/dist/es5/src/init-globals");
var epub_1 = require("r2-shared-js/dist/es5/src/parser/epub");
var server_1 = require("./server");
init_globals_1.initGlobalConverters_OPDS();
init_globals_2.initGlobalConverters_SHARED();
init_globals_2.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
var debug = debug_("r2:streamer#http/server-cli");
debug("process.cwd(): " + process.cwd());
debug("__dirname: " + __dirname);
var args = process.argv.slice(2);
debug("process.argv.slice(2): %o", args);
if (!args[0]) {
    debug("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
var argPath = args[0].trim();
var filePath = argPath;
debug("path: " + filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, argPath);
    debug("path: " + filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), argPath);
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
var maxPrefetchLinks = server_1.MAX_PREFETCH_LINKS;
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
debug("maxPrefetchLinks: " + maxPrefetchLinks);
var isAnEPUB = epub_1.isEPUBlication(filePath);
if (stats.isDirectory() && (isAnEPUB !== epub_1.EPUBis.LocalExploded)) {
    debug("Analysing directory...");
    (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var files, server, url;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, filehound.create()
                        .discard("node_modules")
                        .depth(5)
                        .paths(filePath)
                        .ext([".epub", ".epub3", ".cbz", ".audiobook", ".lcpaudiobook", ".lcpa", ".divina", ".lcpdivina"])
                        .find()];
                case 1:
                    files = _a.sent();
                    server = new server_1.Server({
                        maxPrefetchLinks: maxPrefetchLinks,
                    });
                    server.preventRobots();
                    server.addPublications(files);
                    return [4, server.start(0, false)];
                case 2:
                    url = _a.sent();
                    debug(url);
                    return [2];
            }
        });
    }); })();
}
else {
    (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var server, url;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server = new server_1.Server({
                        maxPrefetchLinks: maxPrefetchLinks,
                    });
                    server.preventRobots();
                    server.addPublications([filePath]);
                    return [4, server.start(0, false)];
                case 1:
                    url = _a.sent();
                    debug(url);
                    return [2];
            }
        });
    }); })();
}
//# sourceMappingURL=server-cli.js.map