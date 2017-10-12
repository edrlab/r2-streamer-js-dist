"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
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
    tslib_1.__extends(Zip2, _super);
    function Zip2(filePath, zip) {
        var _this = _super.call(this) || this;
        _this.filePath = filePath;
        _this.zip = zip;
        _this.entries = {};
        return _this;
    }
    Zip2.loadPromise = function (filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var needsStreamingResponse;
            return tslib_1.__generator(this, function (_a) {
                needsStreamingResponse = true;
                return [2, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        var failure, success, res, err_1;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    failure = function (err) {
                                        debug(err);
                                        reject(err);
                                    };
                                    success = function (res) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                        var _this = this;
                                        var httpZipByteLength, failure_1, success_, ress, err_2, httpZipReader;
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                                                        failure("HTTP CODE " + res.statusCode);
                                                        return [2];
                                                    }
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
                                                    failure_1 = function (err) {
                                                        debug(err);
                                                        reject(err);
                                                    };
                                                    success_ = function (ress) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                                        var buffer, err_3;
                                                        return tslib_1.__generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0:
                                                                    if (ress.statusCode && (ress.statusCode < 200 || ress.statusCode >= 300)) {
                                                                        failure_1("HTTP CODE " + ress.statusCode);
                                                                        return [2];
                                                                    }
                                                                    _a.label = 1;
                                                                case 1:
                                                                    _a.trys.push([1, 3, , 4]);
                                                                    return [4, BufferUtils_1.streamToBufferPromise(ress)];
                                                                case 2:
                                                                    buffer = _a.sent();
                                                                    return [3, 4];
                                                                case 3:
                                                                    err_3 = _a.sent();
                                                                    debug(err_3);
                                                                    reject(err_3);
                                                                    return [2];
                                                                case 4:
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
                                                    if (!needsStreamingResponse) return [3, 1];
                                                    request.get({
                                                        headers: {},
                                                        method: "GET",
                                                        uri: filePath,
                                                    })
                                                        .on("response", success_)
                                                        .on("error", failure_1);
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
                                                    failure_1(err_2);
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
    Zip2.prototype.freeDestroy = function () {
        debug("freeDestroy: Zip2 -- " + this.filePath);
        if (this.zip) {
            this.zip.close();
        }
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var entry;
            return tslib_1.__generator(this, function (_a) {
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
                                reset: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    return tslib_1.__generator(this, function (_a) {
                                        return [2, this.entryStreamPromise(entryPath)];
                                    });
                                }); },
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