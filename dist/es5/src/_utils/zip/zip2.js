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
var requestPromise = require("request-promise-native");
var yauzl = require("yauzl");
var UrlUtils_1 = require("../http/UrlUtils");
var BufferUtils_1 = require("../stream/BufferUtils");
var zip_1 = require("./zip");
var zip2RandomAccessReader_Http_1 = require("./zip2RandomAccessReader_Http");
var debug = debug_("r2:zip2");
var Zip2 = (function (_super) {
    __extends(Zip2, _super);
    function Zip2(filePath, zip) {
        var _this = _super.call(this) || this;
        _this.filePath = filePath;
        _this.zip = zip;
        _this.entries = {};
        return _this;
    }
    Zip2.loadPromise = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (UrlUtils_1.isHTTP(filePath)) {
                    return [2, Zip2.loadPromiseHTTP(filePath)];
                }
                return [2, new Promise(function (resolve, reject) {
                        yauzl.open(filePath, { lazyEntries: true, autoClose: false }, function (err, zip) {
                            if (err) {
                                debug("yauzl init ERROR");
                                debug(err);
                                reject(err);
                                return;
                            }
                            var zip2 = new Zip2(filePath, zip);
                            zip.on("error", function (erro) {
                                debug("yauzl ERROR");
                                debug(erro);
                                reject(erro);
                            });
                            zip.readEntry();
                            zip.on("entry", function (entry) {
                                if (entry.fileName[entry.fileName.length - 1] === "/") {
                                }
                                else {
                                    zip2.addEntry(entry);
                                }
                                zip.readEntry();
                            });
                            zip.on("end", function () {
                                debug("yauzl END");
                                resolve(zip2);
                            });
                            zip.on("close", function () {
                                debug("yauzl CLOSE");
                            });
                        });
                    })];
            });
        });
    };
    Zip2.loadPromiseHTTP = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        var failure, success, needsStreamingResponse, res, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    failure = function (err) {
                                        debug(err);
                                        reject(err);
                                    };
                                    success = function (res) { return __awaiter(_this, void 0, void 0, function () {
                                        var _this = this;
                                        var httpZipByteLength, failure_, success_, needsStreamingResponse_1, ress, err_2, httpZipReader;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    debug(filePath);
                                                    debug(res.headers);
                                                    if (!res.headers["content-length"]) {
                                                        reject("content-length not supported!");
                                                        return [2];
                                                    }
                                                    httpZipByteLength = parseInt(res.headers["content-length"], 10);
                                                    debug("Content-Length: " + httpZipByteLength);
                                                    if (!(!res.headers["accept-ranges"]
                                                        || res.headers["accept-ranges"] !== "bytes")) return [3, 8];
                                                    if (httpZipByteLength > (2 * 1024 * 1024)) {
                                                        reject("accept-ranges not supported, file too big to download: " + httpZipByteLength);
                                                        return [2];
                                                    }
                                                    debug("Downloading: " + filePath);
                                                    failure_ = function (err) {
                                                        debug(err);
                                                        reject(err);
                                                    };
                                                    success_ = function (ress) { return __awaiter(_this, void 0, void 0, function () {
                                                        var buffer, err_3;
                                                        return __generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0:
                                                                    _a.trys.push([0, 2, , 3]);
                                                                    return [4, BufferUtils_1.streamToBufferPromise(ress)];
                                                                case 1:
                                                                    buffer = _a.sent();
                                                                    return [3, 3];
                                                                case 2:
                                                                    err_3 = _a.sent();
                                                                    debug(err_3);
                                                                    reject(err_3);
                                                                    return [2];
                                                                case 3:
                                                                    yauzl.fromBuffer(buffer, { lazyEntries: true }, function (err, zip) {
                                                                        if (err) {
                                                                            debug("yauzl init ERROR");
                                                                            debug(err);
                                                                            reject(err);
                                                                            return;
                                                                        }
                                                                        var zip2 = new Zip2(filePath, zip);
                                                                        zip.on("error", function (erro) {
                                                                            debug("yauzl ERROR");
                                                                            debug(erro);
                                                                            reject(erro);
                                                                        });
                                                                        zip.readEntry();
                                                                        zip.on("entry", function (entry) {
                                                                            if (entry.fileName[entry.fileName.length - 1] === "/") {
                                                                            }
                                                                            else {
                                                                                zip2.addEntry(entry);
                                                                            }
                                                                            zip.readEntry();
                                                                        });
                                                                        zip.on("end", function () {
                                                                            debug("yauzl END");
                                                                            resolve(zip2);
                                                                        });
                                                                        zip.on("close", function () {
                                                                            debug("yauzl CLOSE");
                                                                        });
                                                                    });
                                                                    return [2];
                                                            }
                                                        });
                                                    }); };
                                                    needsStreamingResponse_1 = true;
                                                    if (!needsStreamingResponse_1) return [3, 1];
                                                    request.get({
                                                        headers: {},
                                                        method: "GET",
                                                        uri: filePath,
                                                    })
                                                        .on("response", success_)
                                                        .on("error", failure_);
                                                    return [3, 7];
                                                case 1:
                                                    ress = void 0;
                                                    _a.label = 2;
                                                case 2:
                                                    _a.trys.push([2, 4, , 5]);
                                                    return [4, requestPromise({
                                                            headers: {},
                                                            method: "GET",
                                                            resolveWithFullResponse: true,
                                                            uri: filePath,
                                                        })];
                                                case 3:
                                                    ress = _a.sent();
                                                    return [3, 5];
                                                case 4:
                                                    err_2 = _a.sent();
                                                    failure_(err_2);
                                                    return [2];
                                                case 5:
                                                    ress = ress;
                                                    return [4, success_(ress)];
                                                case 6:
                                                    _a.sent();
                                                    _a.label = 7;
                                                case 7: return [2];
                                                case 8:
                                                    httpZipReader = new zip2RandomAccessReader_Http_1.HttpZipReader(filePath, httpZipByteLength);
                                                    yauzl.fromRandomAccessReader(httpZipReader, httpZipByteLength, { lazyEntries: true, autoClose: false }, function (err, zip) {
                                                        if (err) {
                                                            debug("yauzl init ERROR");
                                                            debug(err);
                                                            reject(err);
                                                            return;
                                                        }
                                                        zip.httpZipReader = httpZipReader;
                                                        var zip2 = new Zip2(filePath, zip);
                                                        zip.on("error", function (erro) {
                                                            debug("yauzl ERROR");
                                                            debug(erro);
                                                            reject(erro);
                                                        });
                                                        zip.readEntry();
                                                        zip.on("entry", function (entry) {
                                                            if (entry.fileName[entry.fileName.length - 1] === "/") {
                                                            }
                                                            else {
                                                                zip2.addEntry(entry);
                                                            }
                                                            zip.readEntry();
                                                        });
                                                        zip.on("end", function () {
                                                            debug("yauzl END");
                                                            resolve(zip2);
                                                        });
                                                        zip.on("close", function () {
                                                            debug("yauzl CLOSE");
                                                        });
                                                    });
                                                    return [2];
                                            }
                                        });
                                    }); };
                                    needsStreamingResponse = true;
                                    if (!needsStreamingResponse) return [3, 1];
                                    request.get({
                                        headers: {},
                                        method: "HEAD",
                                        uri: filePath,
                                    })
                                        .on("response", success)
                                        .on("error", failure);
                                    return [3, 7];
                                case 1:
                                    res = void 0;
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4, requestPromise({
                                            headers: {},
                                            method: "HEAD",
                                            resolveWithFullResponse: true,
                                            uri: filePath,
                                        })];
                                case 3:
                                    res = _a.sent();
                                    return [3, 5];
                                case 4:
                                    err_1 = _a.sent();
                                    failure(err_1);
                                    return [2];
                                case 5:
                                    res = res;
                                    return [4, success(res)];
                                case 6:
                                    _a.sent();
                                    _a.label = 7;
                                case 7: return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    Zip2.prototype.entriesCount = function () {
        return this.zip.entryCount;
    };
    Zip2.prototype.hasEntries = function () {
        return this.entriesCount() > 0;
    };
    Zip2.prototype.hasEntry = function (entryPath) {
        return this.hasEntries() && this.entries[entryPath];
    };
    Zip2.prototype.forEachEntry = function (callback) {
        if (!this.hasEntries()) {
            return;
        }
        Object.keys(this.entries).forEach(function (entryName) {
            callback(entryName);
        });
    };
    Zip2.prototype.entryStreamPromise = function (entryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var entry;
            return __generator(this, function (_a) {
                if (!this.hasEntries() || !this.hasEntry(entryPath)) {
                    return [2, Promise.reject("no such path in zip: " + entryPath)];
                }
                entry = this.entries[entryPath];
                return [2, new Promise(function (resolve, reject) {
                        _this.zip.openReadStream(entry, function (err, stream) {
                            if (err) {
                                debug("yauzl openReadStream ERROR");
                                debug(err);
                                reject(err);
                                return;
                            }
                            var streamAndLength = {
                                length: entry.uncompressedSize,
                                stream: stream,
                            };
                            resolve(streamAndLength);
                        });
                    })];
            });
        });
    };
    Zip2.prototype.addEntry = function (entry) {
        this.entries[entry.fileName] = entry;
    };
    return Zip2;
}(zip_1.Zip));
exports.Zip2 = Zip2;
//# sourceMappingURL=zip2.js.map