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
const fs = require("fs");
const path = require("path");
const util = require("util");
const publication_parser_1 = require("../parser/publication-parser");
const init_globals_1 = require("../init-globals");
init_globals_1.initGlobals();
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
(() => __awaiter(this, void 0, void 0, function* () {
    let publication;
    try {
        publication = yield publication_parser_1.PublicationParsePromise(filePath);
    }
    catch (err) {
        console.log("== Publication Parser: reject");
        console.log(err);
        return;
    }
    console.log("== Publication Parser: resolve: " + publication.Links);
    if (/\.epub[3]?$/.test(ext)) {
    }
    else if (ext === ".cbz") {
        dumpPublication(publication);
    }
}))();
function dumpPublication(publication) {
    console.log("#### RAW OBJECT:");
    console.log(util.inspect(publication, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
exports.dumpPublication = dumpPublication;
//# sourceMappingURL=cli.js.map