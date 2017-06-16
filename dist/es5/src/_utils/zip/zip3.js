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
var request = require("request");
var unzipper = require("unzipper");
var UrlUtils_1 = require("../http/UrlUtils");
var zip_1 = require("./zip");
var debug = debug_("r2:zip3");
var Zip3 = (function (_super) {
    __extends(Zip3, _super);
    function Zip3(filePath, zip) {
        var _this = _super.call(this) || this;
        _this.filePath = filePath;
        _this.zip = zip;
        _this.entries = {};
        _this.zip.files.forEach(function (file) {
            _this.entries[file.path] = file;
        });
        return _this;
    }
    Zip3.loadPromise = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (UrlUtils_1.isHTTP(filePath)) {
                    return [2, Zip3.loadPromiseHTTP(filePath)];
                }
                return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var zip, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4, unzipper.Open.file(filePath)];
                                case 1:
                                    zip = _a.sent();
                                    return [3, 3];
                                case 2:
                                    err_1 = _a.sent();
                                    debug(err_1);
                                    reject(err_1);
                                    return [2];
                                case 3:
                                    debug(zip);
                                    resolve(new Zip3(filePath, zip));
                                    return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    Zip3.loadPromiseHTTP = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var zip, err_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4, unzipper.Open.url(request.get, {
                                            headers: {},
                                            method: "GET",
                                            uri: filePath,
                                            url: filePath,
                                        })];
                                case 1:
                                    zip = _a.sent();
                                    return [3, 3];
                                case 2:
                                    err_2 = _a.sent();
                                    debug(err_2);
                                    reject(err_2);
                                    return [2];
                                case 3:
                                    debug(zip);
                                    resolve(new Zip3(filePath, zip));
                                    return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    Zip3.prototype.freeDestroy = function () {
        console.log("freeDestroy: Zip3");
        if (this.zip) {
        }
    };
    Zip3.prototype.entriesCount = function () {
        return this.zip.files.length;
    };
    Zip3.prototype.hasEntries = function () {
        return this.entriesCount() > 0;
    };
    Zip3.prototype.hasEntry = function (entryPath) {
        return this.hasEntries() && this.entries[entryPath];
    };
    Zip3.prototype.forEachEntry = function (callback) {
        if (!this.hasEntries()) {
            return;
        }
        Object.keys(this.entries).forEach(function (entryName) {
            callback(entryName);
        });
    };
    Zip3.prototype.entryStreamPromise = function (entryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.hasEntries() || !this.hasEntry(entryPath)) {
                    return [2, Promise.reject("no such path in zip: " + entryPath)];
                }
                return [2, new Promise(function (resolve, _reject) {
                        var entry = _this.entries[entryPath];
                        debug(entry);
                        var stream = entry.stream();
                        var streamAndLength = {
                            length: entry.size,
                            stream: stream,
                        };
                        resolve(streamAndLength);
                    })];
            });
        });
    };
    return Zip3;
}(zip_1.Zip));
exports.Zip3 = Zip3;
//# sourceMappingURL=zip3.js.map