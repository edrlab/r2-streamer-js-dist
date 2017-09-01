"use strict";
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
    static async loadPromise(filePath) {
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
    async entryStreamPromise(entryPath) {
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
                    reset: async () => {
                        return this.entryStreamPromise(entryPath);
                    },
                    stream,
                };
                resolve(streamAndLength);
            });
        });
    }
}
exports.Zip1 = Zip1;
//# sourceMappingURL=zip1.js.map