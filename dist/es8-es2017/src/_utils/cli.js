"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const util = require("util");
const publication_parser_1 = require("../parser/publication-parser");
const lcp_1 = require("../parser/epub/lcp");
const init_globals_1 = require("../init-globals");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP/lcp.node"));
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname: ");
console.log(__dirname);
const args = process.argv.slice(2);
console.log("args:");
console.log(args);
if (!args[0]) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
const argPath = args[0].trim();
let filePath = argPath;
console.log(filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, argPath);
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), argPath);
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
    let publication;
    try {
        publication = await publication_parser_1.PublicationParsePromise(filePath);
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
})();
function dumpPublication(publication) {
    console.log("#### RAW OBJECT:");
    console.log(util.inspect(publication, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
exports.dumpPublication = dumpPublication;
//# sourceMappingURL=cli.js.map