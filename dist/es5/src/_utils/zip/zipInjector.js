"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var debug_ = require("debug");
var yauzl = require("yauzl");
var yazl = require("yazl");
var debug = debug_("r2:zipInjector");
var InjectType;
(function (InjectType) {
    InjectType[InjectType["FILE"] = 0] = "FILE";
    InjectType[InjectType["BUFFER"] = 1] = "BUFFER";
    InjectType[InjectType["STREAM"] = 2] = "STREAM";
})(InjectType || (InjectType = {}));
function injectStreamInZip(destPathTMP, destPathFINAL, stream, zipEntryPath, zipError, doneCallback) {
    injectObjectInZip(destPathTMP, destPathFINAL, stream, InjectType.STREAM, zipEntryPath, zipError, doneCallback);
}
exports.injectStreamInZip = injectStreamInZip;
function injectBufferInZip(destPathTMP, destPathFINAL, buffer, zipEntryPath, zipError, doneCallback) {
    injectObjectInZip(destPathTMP, destPathFINAL, buffer, InjectType.BUFFER, zipEntryPath, zipError, doneCallback);
}
exports.injectBufferInZip = injectBufferInZip;
function injectFileInZip(destPathTMP, destPathFINAL, filePath, zipEntryPath, zipError, doneCallback) {
    injectObjectInZip(destPathTMP, destPathFINAL, filePath, InjectType.FILE, zipEntryPath, zipError, doneCallback);
}
exports.injectFileInZip = injectFileInZip;
function injectObjectInZip(destPathTMP, destPathFINAL, contentsToInject, typeOfContentsToInject, zipEntryPath, zipError, doneCallback) {
    yauzl.open(destPathTMP, { lazyEntries: true, autoClose: false }, function (err, zip) {
        if (err) {
            debug("yauzl init ERROR");
            zipError(err);
            return;
        }
        var zipfile = new yazl.ZipFile();
        zip.on("error", function (erro) {
            debug("yauzl ERROR");
            zipError(erro);
        });
        zip.readEntry();
        zip.on("entry", function (entry) {
            if (entry.fileName[entry.fileName.length - 1] === "/") {
            }
            else if (entry.fileName === zipEntryPath) {
            }
            else {
                zip.openReadStream(entry, function (errz, stream) {
                    if (err) {
                        debug("yauzl openReadStream ERROR");
                        debug(errz);
                        zipError(errz);
                        return;
                    }
                    var compress = entry.fileName !== "mimetype";
                    zipfile.addReadStream(stream, entry.fileName, { compress: compress });
                });
            }
            zip.readEntry();
        });
        zip.on("end", function () {
            debug("yauzl END");
            if (typeOfContentsToInject === InjectType.FILE) {
                zipfile.addFile(contentsToInject, zipEntryPath);
            }
            else if (typeOfContentsToInject === InjectType.BUFFER) {
                zipfile.addBuffer(contentsToInject, zipEntryPath);
            }
            else if (typeOfContentsToInject === InjectType.STREAM) {
                zipfile.addReadStream(contentsToInject, zipEntryPath);
            }
            else {
                debug("yazl FAIL to inject! (unknown type)");
            }
            zipfile.end();
            var destStream2 = fs.createWriteStream(destPathFINAL);
            zipfile.outputStream.pipe(destStream2);
            destStream2.on("finish", function () {
                doneCallback();
            });
            destStream2.on("error", function (ere) {
                zipError(ere);
            });
        });
        zip.on("close", function () {
            debug("yauzl CLOSE");
        });
    });
}
//# sourceMappingURL=zipInjector.js.map