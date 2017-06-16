"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_ = require("debug");
const request = require("request");
const unzipper = require("unzipper");
const UrlUtils_1 = require("../http/UrlUtils");
const zip_1 = require("./zip");
const debug = debug_("r2:zip3");
class Zip3 extends zip_1.Zip {
    constructor(filePath, zip) {
        super();
        this.filePath = filePath;
        this.zip = zip;
        this.entries = {};
        this.zip.files.forEach((file) => {
            this.entries[file.path] = file;
        });
    }
    static loadPromise(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (UrlUtils_1.isHTTP(filePath)) {
                return Zip3.loadPromiseHTTP(filePath);
            }
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let zip;
                try {
                    zip = yield unzipper.Open.file(filePath);
                }
                catch (err) {
                    debug(err);
                    reject(err);
                    return;
                }
                debug(zip);
                resolve(new Zip3(filePath, zip));
            }));
        });
    }
    static loadPromiseHTTP(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let zip;
                try {
                    zip = yield unzipper.Open.url(request.get, {
                        headers: {},
                        method: "GET",
                        uri: filePath,
                        url: filePath,
                    });
                }
                catch (err) {
                    debug(err);
                    reject(err);
                    return;
                }
                debug(zip);
                resolve(new Zip3(filePath, zip));
            }));
        });
    }
    freeDestroy() {
        console.log("freeDestroy: Zip3");
        if (this.zip) {
        }
    }
    entriesCount() {
        return this.zip.files.length;
    }
    hasEntries() {
        return this.entriesCount() > 0;
    }
    hasEntry(entryPath) {
        return this.hasEntries() && this.entries[entryPath];
    }
    forEachEntry(callback) {
        if (!this.hasEntries()) {
            return;
        }
        Object.keys(this.entries).forEach((entryName) => {
            callback(entryName);
        });
    }
    entryStreamPromise(entryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasEntries() || !this.hasEntry(entryPath)) {
                return Promise.reject("no such path in zip: " + entryPath);
            }
            return new Promise((resolve, _reject) => {
                const entry = this.entries[entryPath];
                debug(entry);
                const stream = entry.stream();
                const streamAndLength = {
                    length: entry.size,
                    stream,
                };
                resolve(streamAndLength);
            });
        });
    }
}
exports.Zip3 = Zip3;
//# sourceMappingURL=zip3.js.map