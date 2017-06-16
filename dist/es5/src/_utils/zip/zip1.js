"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var debug_ = require("debug");
var StreamZip = require("node-stream-zip");
var zip_1 = require("./zip");
var debug = debug_("r2:zip1");
var Zip1 = (function (_super) {
    __extends(Zip1, _super);
    function Zip1(filePath, zip) {
        var _this = _super.call(this) || this;
        _this.filePath = filePath;
        _this.zip = zip;
        return _this;
    }
    Zip1.loadPromise = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var zip = new StreamZip({
                            file: filePath,
                            storeEntries: true,
                        });
                        zip.on("error", function (err) {
                            debug("--ZIP error:");
                            debug(err);
                            reject(err);
                        });
                        zip.on("entry", function (_entry) {
                        });
                        zip.on("extract", function (entry, file) {
                            debug("--ZIP extract:");
                            debug(entry.name);
                            debug(file);
                        });
                        zip.on("ready", function () {
                            resolve(new Zip1(filePath, zip));
                        });
                    })];
            });
        });
    };
    Zip1.prototype.freeDestroy = function () {
        console.log("freeDestroy: Zip1");
        if (this.zip) {
            this.zip.close();
        }
    };
    Zip1.prototype.entriesCount = function () {
        return this.zip.entriesCount;
    };
    Zip1.prototype.hasEntries = function () {
        return this.entriesCount() > 0;
    };
    Zip1.prototype.hasEntry = function (entryPath) {
        return this.hasEntries()
            && this.zip.entries()[entryPath];
    };
    Zip1.prototype.forEachEntry = function (callback) {
        if (!this.hasEntries()) {
            return;
        }
        Object.keys(this.zip.entries()).forEach(function (entryName) {
            callback(entryName);
        });
    };
    Zip1.prototype.entryStreamPromise = function (entryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.hasEntries() || !this.hasEntry(entryPath)) {
                    return [2, Promise.reject("no such path in zip: " + entryPath)];
                }
                return [2, new Promise(function (resolve, reject) {
                        _this.zip.stream(entryPath, function (err, stream) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            var entry = _this.zip.entries()[entryPath];
                            var streamAndLength = {
                                length: entry.size,
                                stream: stream,
                            };
                            resolve(streamAndLength);
                        });
                    })];
            });
        });
    };
    return Zip1;
}(zip_1.Zip));
exports.Zip1 = Zip1;
//# sourceMappingURL=zip1.js.map