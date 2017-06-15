"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const util = require("util");
const cbz_1 = require("../parser/cbz");
const epub_1 = require("../parser/epub");
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname: ");
console.log(__dirname);
const args = process.argv.slice(2);
console.log("args:");
console.log(args);
let filePath = args[0];
if (!filePath) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
filePath = filePath.trim();
console.log(filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, filePath);
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), filePath);
        console.log(filePath);
        if (!fs.existsSync(filePath)) {
            console.log("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}
const fileName = path.basename(filePath);
const ext = path.extname(fileName).toLowerCase();
(async () => {
    if (ext === ".epub") {
        let publication;
        try {
            publication = await epub_1.EpubParsePromise(filePath);
        }
        catch (err) {
            console.log("== EpubParser: reject");
            console.log(err);
            return;
        }
        console.log("== EpubParser: resolve: " + publication.Links);
    }
    else if (ext === ".cbz") {
        let publication;
        try {
            publication = await cbz_1.CbzParsePromise(filePath);
        }
        catch (err) {
            console.log("== CbzParser: reject");
            console.log(err);
            return;
        }
        console.log("== CbzParser: resolve");
        dumpPublication(publication);
    }
})();
function dumpPublication(publication) {
    console.log("#### RAW OBJECT:");
    console.log(util.inspect(publication, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
exports.dumpPublication = dumpPublication;
//# sourceMappingURL=cli.js.map