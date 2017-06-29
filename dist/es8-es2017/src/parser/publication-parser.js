"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const cbz_1 = require("./cbz");
const epub_1 = require("./epub");
async function PublicationParsePromise(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const check = /\.epub[3]?$/.test(ext);
    console.log(check);
    console.log(ext);
    console.log(fileName);
    console.log(filePath);
    return check ?
        epub_1.EpubParsePromise(filePath) :
        cbz_1.CbzParsePromise(filePath);
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map