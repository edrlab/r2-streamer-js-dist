"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debug_ = require("debug");
var StreamZip = require("node-stream-zip");
var zip_1 = require("./zip");
var debug = debug_("r2:zip1");
var Zip1 = (function (_super) {
    tslib_1.__extends(Zip1, _super);
    function Zip1(filePath, zip) {
        var _this = _super.call(this) || this;
        _this.filePath = filePath;
        _this.zip = zip;
        return _this;
    }
    Zip1.loadPromise = function (filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var zip = new StreamZip({
                            file: filePath,
                            storeEntries: true,
                        });
                        zip.on("error", function (err) {
                            debug("--ZIP error: " + filePath);
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
        debug("freeDestroy: Zip1 -- " + this.filePath);
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
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
    return Zip1;
}(zip_1.Zip));
exports.Zip1 = Zip1;
//# sourceMappingURL=zip1.js.map