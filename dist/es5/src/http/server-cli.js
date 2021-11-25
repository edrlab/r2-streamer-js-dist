"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debug_ = require("debug");
var fs = require("fs");
var path = require("path");
var lcp_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lcp");
var init_globals_1 = require("r2-opds-js/dist/es5/src/opds/init-globals");
var init_globals_2 = require("r2-shared-js/dist/es5/src/init-globals");
var epub_1 = require("r2-shared-js/dist/es5/src/parser/epub");
var server_1 = require("./server");
(0, init_globals_1.initGlobalConverters_OPDS)();
(0, init_globals_2.initGlobalConverters_SHARED)();
(0, init_globals_2.initGlobalConverters_GENERIC)();
(0, lcp_1.setLcpNativePluginPath)(path.join(process.cwd(), "LCP", "lcp.node"));
var debug = debug_("r2:streamer#http/server-cli");
debug("process.cwd(): ".concat(process.cwd()));
debug("__dirname: ".concat(__dirname));
var args = process.argv.slice(2);
debug("process.argv.slice(2): %o", args);
if (!args[0]) {
    debug("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
var argPath = args[0].trim();
var filePath = argPath;
debug("path: ".concat(filePath));
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, argPath);
    debug("path: ".concat(filePath));
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), argPath);
        debug("path: ".concat(filePath));
        if (!fs.existsSync(filePath)) {
            debug("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}
filePath = fs.realpathSync(filePath);
debug("path (normalized): ".concat(filePath));
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
debug("maxPrefetchLinks: ".concat(maxPrefetchLinks));
var isAnEPUB = (0, epub_1.isEPUBlication)(filePath);
if (stats.isDirectory() && (isAnEPUB !== epub_1.EPUBis.LocalExploded)) {
    debug("Analysing directory...");
    (function () { return (0, tslib_1.__awaiter)(void 0, void 0, void 0, function () {
        var files, server, url;
        return (0, tslib_1.__generator)(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = fs.readdirSync(filePath, { withFileTypes: true }).
                        filter(function (f) {
                        return f.isFile() &&
                            (/((\.epub3?)|(\.cbz)|(\.audiobook)|(\.lcpaudiobook)|(\.lcpa)|(\.divina)|(\.lcpdivina))$/i.test(f.name)
                                ||
                                    (/_manifest\.json$/.test(f.name)
                                        && fs.existsSync(path.join(filePath, path.basename(f.name).replace(/_manifest\.json$/, "")))));
                    }).map(function (f) { return path.join(filePath, f.name); });
                    server = new server_1.Server({
                        maxPrefetchLinks: maxPrefetchLinks,
                    });
                    server.preventRobots();
                    server.addPublications(files);
                    return [4, server.start(0, false)];
                case 1:
                    url = _a.sent();
                    debug(url);
                    return [2];
            }
        });
    }); })();
}
else {
    (function () { return (0, tslib_1.__awaiter)(void 0, void 0, void 0, function () {
        var server, url;
        return (0, tslib_1.__generator)(this, function (_a) {
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