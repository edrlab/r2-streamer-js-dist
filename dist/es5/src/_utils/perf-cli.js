"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
var zip1_1 = require("./zip/zip1");
var zip2_1 = require("./zip/zip2");
var zip3_1 = require("./zip/zip3");
var lcp_1 = require("../parser/epub/lcp");
var init_globals_1 = require("../init-globals");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname:");
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
if (/\.epub[3]?$/.test(ext) || ext === ".cbz" || ext === ".zip") {
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var time3, zip3, diff3, time2, zip2, diff2, time1, zip1, diff1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    time3 = process.hrtime();
                    return [4, zip3_1.Zip3.loadPromise(filePath)];
                case 1:
                    zip3 = _a.sent();
                    diff3 = process.hrtime(time3);
                    console.log("Zip 3 (" + zip3.entriesCount() + "): " + diff3[0] + " seconds + " + diff3[1] + " nanoseconds");
                    time2 = process.hrtime();
                    return [4, zip2_1.Zip2.loadPromise(filePath)];
                case 2:
                    zip2 = _a.sent();
                    diff2 = process.hrtime(time2);
                    console.log("Zip 2 (" + zip2.entriesCount() + "): " + diff2[0] + " seconds + " + diff2[1] + " nanoseconds");
                    time1 = process.hrtime();
                    return [4, zip1_1.Zip1.loadPromise(filePath)];
                case 3:
                    zip1 = _a.sent();
                    diff1 = process.hrtime(time1);
                    console.log("Zip 1 (" + zip1.entriesCount() + "): " + diff1[0] + " seconds + " + diff1[1] + " nanoseconds");
                    return [2];
            }
        });
    }); })();
}
//# sourceMappingURL=perf-cli.js.map