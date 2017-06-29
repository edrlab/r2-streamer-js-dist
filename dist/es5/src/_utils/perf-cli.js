"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var zip1_1 = require("./zip/zip1");
var zip2_1 = require("./zip/zip2");
var zip3_1 = require("./zip/zip3");
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname:");
console.log(__dirname);
var args = process.argv.slice(2);
console.log("args:");
console.log(args);
var filePath = args[0];
if (!filePath) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
filePath = filePath.trim();
console.log(filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, filePath);
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), filePath);
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
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var time3, zip3, diff3, time2, zip2, diff2, time1, zip1, diff1;
        return __generator(this, function (_a) {
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