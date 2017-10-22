"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
var util = require("util");
var publication_parser_1 = require("../parser/publication-parser");
var lcp_1 = require("../parser/epub/lcp");
var init_globals_1 = require("../init-globals");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP/lcp.node"));
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname: ");
console.log(__dirname);
var args = process.argv.slice(2);
console.log("args:");
console.log(args);
if (!args[0]) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
var argPath = args[0].trim();
var filePath = argPath;
console.log(filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, argPath);
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), argPath);
        console.log(filePath);
        if (!fs.existsSync(filePath)) {
            console.log("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}
var fileName = path.basename(filePath);
var ext = path.extname(fileName).toLowerCase();
(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var publication, err_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, publication_parser_1.PublicationParsePromise(filePath)];
            case 1:
                publication = _a.sent();
                return [3, 3];
            case 2:
                err_1 = _a.sent();
                console.log("== Publication Parser: reject");
                console.log(err_1);
                return [2];
            case 3:
                console.log("== Publication Parser: resolve: " + publication.Links);
                if (/\.epub[3]?$/.test(ext)) {
                }
                else if (ext === ".cbz") {
                    dumpPublication(publication);
                }
                return [2];
        }
    });
}); })();
function dumpPublication(publication) {
    console.log("#### RAW OBJECT:");
    console.log(util.inspect(publication, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
exports.dumpPublication = dumpPublication;
//# sourceMappingURL=cli.js.map