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
const StreamZip = require("node-stream-zip");
const zip_1 = require("./zip");
const debug = debug_("r2:zip1");
class Zip1 extends zip_1.Zip {
    constructor(filePath, zip) {
        super();
        this.filePath = filePath;
        this.zip = zip;
    }
    static loadPromise(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const zip = new StreamZip({
                    file: filePath,
                    storeEntries: true,
                });
                zip.on("error", (err) => {
                    debug("--ZIP error:");
                    debug(err);
                    reject(err);
                });
                zip.on("entry", (_entry) => {
                });
                zip.on("extract", (entry, file) => {
                    debug("--ZIP extract:");
                    debug(entry.name);
                    debug(file);
                });
                zip.on("ready", () => {
                    resolve(new Zip1(filePath, zip));
                });
            });
        });
    }
    freeDestroy() {
        console.log("freeDestroy: Zip1");
        if (this.zip) {
            this.zip.close();
        }
    }
    entriesCount() {
        return this.zip.entriesCount;
    }
    hasEntries() {
        return this.entriesCount() > 0;
    }
    hasEntry(entryPath) {
        return this.hasEntries()
            && this.zip.entries()[entryPath];
    }
    forEachEntry(callback) {
        if (!this.hasEntries()) {
            return;
        }
        Object.keys(this.zip.entries()).forEach((entryName) => {
            callback(entryName);
        });
    }
    entryStreamPromise(entryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasEntries() || !this.hasEntry(entryPath)) {
                return Promise.reject("no such path in zip: " + entryPath);
            }
            return new Promise((resolve, reject) => {
                this.zip.stream(entryPath, (err, stream) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const entry = this.zip.entries()[entryPath];
                    const streamAndLength = {
                        length: entry.size,
                        stream,
                    };
                    resolve(streamAndLength);
                });
            });
        });
    }
}
exports.Zip1 = Zip1;
//# sourceMappingURL=zip1.js.map