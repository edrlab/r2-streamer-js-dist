"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debug_ = require("debug");
var request = require("request");
var unzipper = require("unzipper");
var UrlUtils_1 = require("../http/UrlUtils");
var zip_1 = require("./zip");
var debug = debug_("r2:zip3");
var Zip3 = (function (_super) {
    tslib_1.__extends(Zip3, _super);
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (UrlUtils_1.isHTTP(filePath)) {
                    return [2, Zip3.loadPromiseHTTP(filePath)];
                }
                return [2, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var zip, err_1;
                        return tslib_1.__generator(this, function (_a) {
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var zip, err_2;
                        return tslib_1.__generator(this, function (_a) {
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
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